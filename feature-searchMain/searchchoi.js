// 브라우저가 HTML 문서를 모두 불러온 후 실행됌
// 즉, 모든 요소를 안전하게 조작 할 수 있는 시점에서 js 시작
document.addEventListener('DOMContentLoaded', async () => {
  const storeListContainer = document.querySelector('.store-list-container');
  const searchQueryDisplay = document.getElementById('searchQueryDisplay');
  const sortOption = document.getElementById('sortOption');

  // if (localStorage.getItem("isLoggedIn") !== "true"){
  //   alert("로그인이 필요합니다람쥐.");
  // window.location.href = "/feature-login/login.html";
  // }

  
  // ----------------------------------------
  // 더미 데이터 버전 (기본 테스트용)
  // ----------------------------------------
  /* dummyStoresData 라는 변수명으로 20개의 가게 데이터를 생성함
     Array.from = 배열을 만들기 위한 자바스크립트 내장함수
                ㄴ 무언가를 배열로 변환하거나 새 배열을 생성할때 사용됌
                ㄴ { length : 20 } 길이만 20이고 값은 없는 빈 배열처럼 동작
                ㄴ (_, i)  = _ 는 배열 요소의 값을 의미하지만 여기선 사용하지 않음
                ㄴ 더미니까 요소 값 자체가 필요 없고 인덱스만 필요하므로 _로 표시
                ㄴ (_, i) = i 는 배열의 인덱스 번호 (0부터 시작),
                ㄴ 이걸 사용해서 "1호점", "2호점"처럼 가게 이름을 만들고 요일이나 이미지 번호,id 등도 계산해서 넣을 수 있음,
  */
  const dummyStoresData = Array.from({ length: 20 }, (_, i) => {
    //                      ㄴ 길이 20개의 빈배열을 생성해서 (배열의값, 인덱스번호) 순으로 출력
    const categories = ["한식", "중식", "일식", "양식", "분식", "카페", "패스트푸드", "멕시칸", "해산물", "바"];
    const names = ["김밥천국", "홍콩반점", "스시야", "이탈리안하우스", "떡볶이연구소", "별다방", "버거킹", "타코벨", "제주해물탕", "펍서울"];
    return {
      id: i + 1,
      // i 는 만들어둔 20개의 빈 배열을 통해 0부터 19까지 반복되며 아래의 내용을 통해 하나의 가게 객체를 생성함 
      name: `${names[i % names.length]} ${i + 1}호점`,
      /* i % names.length
      
      */
      category: categories[i % categories.length],
      isFavorite: Math.random() < 0.5,
      rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
      reviews: Math.floor(Math.random() * 1000),
      images: [
        `/images/store${(i % 5) + 1}.jpg`,
        `/images/store${((i + 1) % 5) + 1}.jpg`
      ],
      openingHours: [
        { day: i % 7, open: "10:00", close: "22:00" },
        { day: (i + 1) % 7, open: "11:00", close: "21:00" },
      ]
    };
  });
///////////////////////////////////////////////////////////////////////////////////
//                  더미끝 
///////////////////////////////////////////////////////////////////////////////////
  function fetchStoresDataDummy(query = '') {
    return new Promise((resolve) => {
      const filtered = dummyStoresData.filter((store) =>
        store.name.includes(query || "")
      );
      setTimeout(() => resolve(filtered), 200);
    });
  }

  async function updateFavoriteStatusDummy(storeId, isFavorite) {
    const store = dummyStoresData.find(s => s.id === storeId);
    if (store) store.isFavorite = isFavorite;
  }

  // ----------------------------------------
  // 실서버 연동 버전
  // ----------------------------------------
  async function fetchStoresDataReal(query = '') {
    const res = await fetch(`http://100.74.28.37:8081/api/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!res.ok) throw new Error('서버 응답 실패');
    return await res.json();
  }

  function createStoreCard(store) {
    const card = document.createElement("div");
    card.className = "store-card";

    const isOpen = getStoreStatus(store.openingHours) === '영업 중';
    const rating = store.rating;
    const reviews = store.reviews > 999 ? '999+' : store.reviews;

    card.innerHTML = `
      <div class="store-info">
        <div class="store-header">
          <h3 class="store-name">
            <span class="store-link" data-id="${store.id}">${store.name}</span>
          </h3>
          <span class="store-category">${store.category}</span>
          <button class="favorite-button ${store.isFavorite ? 'active' : ''}" aria-label="즐겨찾기">☆</button>
        </div>
        <div class="store-details">
          <span class="status ${isOpen ? 'open' : ''}">${isOpen ? '영업 중' : '영업 전'}</span>
          <span class="rating">★ ${rating}</span>
          <span class="reviews">리뷰 ${reviews}</span>
        </div>
      </div>
      <div class="store-images">
        ${store.images.map(src => `<img src="${src}" alt="${store.name} 이미지" loading="lazy">`).join('')}
      </div>
    `;

    const link = card.querySelector(".store-link");
      link.addEventListener("click", () => {
        window.location.href = `/feature-searchinfo/searchinfo.html?id=${store.id}`;
    });

    const favBtn = card.querySelector(".favorite-button");
    favBtn.addEventListener("click", async () => {

      if(localStorage.getItem("isLoggedIn") !== "true"){
        alert("로그인이 필요합니다람쥐.");
        return;
      }

      const newStatus = !favBtn.classList.contains("active");
      favBtn.classList.toggle("active", newStatus);
      await updateFavoriteStatusDummy(store.id, newStatus); // 실서버 전환 시 별도 처리 필요
    });
    return card;
  }

  function getStoreStatus(openingHours) {
    const now = new Date();
    const day = now.getDay();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const today = openingHours.find(h => h.day === day);
    if (!today) return '영업 전';

    const [oh, om] = today.open.split(":").map(Number);
    const [ch, cm] = today.close.split(":").map(Number);
    let open = oh * 60 + om;
    let close = ch * 60 + cm;

    if (close < open) {
      return nowMinutes >= open || nowMinutes < close ? '영업 중' : '영업 전';
    }
    return (nowMinutes >= open && nowMinutes < close) ? '영업 중' : '영업 전';
  }

  function applySort(stores, type) {
    switch (type) {
      case 'rating':
        return stores.slice().sort((a, b) => b.rating - a.rating); // 평점 높은순
      case 'views':
        return stores.slice().sort((a, b) => b.viewCount - a.viewCount); // 조회 많은 순
      case 'alphabet':
        return stores.slice().sort((a, b) => a.name.localeCompare(b.name)); // 가나다순
      case 'favorite':
        return stores.filter(store => store.isFavorite); // 즐겨찾기만 필터링
      case 'reviews':
        return stores.slice().sort((a, b) => b.reviews - a.reviews); // 리뷰 많은 순
      default:
        return stores;
    }
  }
// top5 랭킹 출력 함수
   async function renderTop5Ranking(useDummy = true) {
    const topRankingList = document.getElementById("topRankingList");
    if (!topRankingList)
      return;

    let top5 = [];

    if (useDummy) {
      // 더미 데이터에서 조회수(viewCount) 기준으로 상위 5개 추출
      top5 = dummyStoresData
        .slice()
        .sort((a, b) => b.viewCount - a.viewCount)
        .slice(0, 5);

      updateTopRankingList(top5);
    } else {
      // 실서버 연동: try-catch로 예외 처리
      try {
        const res = await fetch("http://백엔드주소/api/ranking", {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!res.ok) throw new Error("서버 응답 실패");

        const data = await res.json();     // 서버에서 받아온 top5 데이터
        top5 = data.slice(0, 5);           // 혹시 5개 이상일 수도 있으므로 제한
        updateTopRankingList(top5);        // 화면에 출력

      } catch (err) {
        console.error("TOP5 로딩 실패", err);
        topRankingList.innerHTML = `<li style="color:red;">TOP5 불러오기 실패</li>`;
      }
    }
  }

// top5 UI 그리는 함수
  function updateTopRankingList(top5) {
    const topRankingList = document.getElementById("topRankingList");
    topRankingList.innerHTML = '';

    top5.forEach((store, index) => {
      const li = document.createElement("li");
      li.style.marginBottom = "12px";

      li.innerHTML = `
        <div style="font-weight: bold;">${index + 1}위. ${store.name}</div>
        <div style="font-size: 0.9em; color: gray;">조회수: ${store.viewCount}</div>
      `;
      topRankingList.appendChild(li);
    });
  }

  async function renderAllStoreCards() {
    storeListContainer.innerHTML = "<p style='text-align:center'>불러오는 중...</p>";
    try {
      const query = new URLSearchParams(location.search).get('q');
      if (query) searchQueryDisplay.textContent = `'${query}' 검색 결과`;

      // 아래 중 하나만 사용: 더미 또는 실서버
      const stores = await fetchStoresDataDummy(query); // 기본 테스트용
      // const stores = await fetchStoresDataReal(query); // 실제 서버 연동용

      const sortValue = sortOption?.value || 'default';
      const sortedStores = applySort(stores, sortValue);

      storeListContainer.innerHTML = '';

      if (sortedStores.length > 0) {
        sortedStores.forEach(store => {
          storeListContainer.appendChild(createStoreCard(store));
        });
      } else {
        storeListContainer.innerHTML = '<p style="text-align:center">검색 결과가 없습니다.</p>';
      }
    } catch (err) {
      console.error("렌더링 오류:", err);
      storeListContainer.innerHTML = '<p style="text-align:center; color:red">가게 정보를 불러오는 데 실패했습니다람쥐.</p>';
    }
  }

  sortOption?.addEventListener('change', renderAllStoreCards);
  renderAllStoreCards();
});
