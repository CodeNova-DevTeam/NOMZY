document.addEventListener('DOMContentLoaded', async () => {
  // HTML 문서가 완전히 로드되고 DOM이 생성된 후 실행되는 이벤트 리스너
  // 즉, HTML이 다 로딩된 다음에 안의 스크립트를 실행하겠다는 뜻임
  // (DOMContentLoaded 전에 실행하면 HTML 요소들을 찾지 못하는 문제가 생길 수 있어서 이렇게 보장함)
  const storeListContainer = document.querySelector('.store-list-container');
  // class="store-list-container"인 HTML 요소를 가져옴
  // 검색 결과로 렌더링되는 가게 카드들을 이 div 안에 넣을 예정
  const searchQueryDisplay = document.getElementById('searchQueryDisplay');
  // id="searchQueryDisplay"인 요소 가져옴
  // 검색한 키워드를 상단에 표시할 때 사용됨 ('삼겹살' 검색 결과 이런 형태로 출력됨)
  const sortOption = document.getElementById('sortOption');
  // id="sortOption"인 select 박스를 가져옴
  // 사용자 정렬 옵션을 감지하기 위해 사용 (별점순, 조회수순 등)
  const params = new URLSearchParams(window.location.search);
  // 현재 URL의 쿼리스트링 부분 (?keyword=삼겹살 이런 형태)을 객체로 파싱함
  // => get("keyword")로 원하는 값만 추출 가능
  const keyword = params.get("keyword") || "";
  // 쿼리스트링에서 "keyword" 값을 추출, 없으면 빈 문자열
  // 예: ?keyword=삼겹살 → keyword = "삼겹살"
  // 예: URL에 keyword 없음 → keyword = ""
  const nickname = localStorage.getItem("nickname") || "GUEST";
  // 브라우저 localStorage에서 nickname 값을 불러옴
  // 없으면 기본값으로 "GUEST" 사용
  // 주로 사용자 개인화 검색(즐겨찾기 포함)에 사용될 수 있음
  searchQueryDisplay.textContent = `'${keyword}' 검색 결과`;
  // 실제 검색 키워드를 화면 상단에 출력
  // 예: '삼겹살' 검색 결과 ← 이런 형태로 표시됨

  const useDummy = false;

  const stores = useDummy
    ? await fetchStoresDataDummy(keyword)
    // : await fetchStoresDataReal(keyword, nickname);
    : await fetchStoresDataReal(keyword);

    console.log("api 응답 데이터 확인" , stores)

  let currentStores = stores;
  const sortedStores = applySort(currentStores, sortOption?.value || "default");
  renderStoreCards(sortedStores);

  sortOption?.addEventListener('change', () => {
    const reSorted = applySort(currentStores, sortOption.value);
    renderStoreCards(reSorted);
  });
  // renderTop5Ranking(useDummy);
});

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
// const dummyStoresData = Array.from({ length: 20 }, (_, i) => {
//   // 가게 카테고리
//   const categories = ["한식", "중식", "일식", "양식", "분식", "카페", "패스트푸드", "멕시칸", "해산물", "바"];
//   // 가게 이름
//   const names = ["김밥천국", "홍콩반점", "스시야", "이탈리안하우스", "떡볶이연구소", "별다방", "버거킹", "타코벨", "제주해물탕", "펍서울"];
//   return {
//     // i 는 만들어둔 20개의 빈 배열을 통해 0부터 19까지 반복되며 아래의 내용을 통해 하나의 가게 객체를 생성함 
//     id: i + 1,
//     name: `${names[i % names.length]} ${i + 1}호점`,
//     category: categories[i % categories.length],
//     isFavorite: Math.random() < 0.5,
//     rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
//     reviews: Math.floor(Math.random() * 1000),
//     viewCount: Math.floor(Math.random() * 1000),
//     images: [
//       `/images/store${(i % 5) + 1}.jpg`,
//       `/images/store${((i + 1) % 5) + 1}.jpg`
//     ],
//     openingHours: [
//       { day: i % 7, open: "10:00", close: "22:00" },
//       { day: (i + 1) % 7, open: "11:00", close: "21:00" },
//     ]
//   };
// });

// function fetchStoresDataDummy(query = '') {
//   return new Promise((resolve) => {
//     const filtered = dummyStoresData.filter((store) =>
//       store.name.includes(query || "")
//     );
//     setTimeout(() => resolve(filtered), 200);
//   });
// }

async function fetchStoresDataReal(query = '', nickname = 'GUEST') {
  // const response = await fetch(`http://localhost:8081/api/search?keyword=${encodeURIComponent(query)}&nickname=${nickname}`, {
  // const response = await fetch(`http://100.123.221.61:8081/api/search?keyword=${encodeURIComponent(query)}&nickname=${nickname}`, {
  const response = await fetch(`http://100.123.221.61:8082/api/search?keyword=${encodeURIComponent(query)}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  // const result = await response.json();
  // console.log(result);
  if (!response.ok) throw new Error('서버 응답 실패');
  const rawData = await response.json();

  // 매핑 처리 (프론트에서 기대하는 필드로 가공)
  const mappedData = rawData.map(item => {
    const fullRegion = item.regionName || "";
    const regionDo = fullRegion.split(" ")[0] || "";  // ← undefined 방지

    return {
      id: item.restaurantId,
      name: item.title || "이름없음",
      category: item.tagNames || "기타",
      regionName: regionDo,  // ⬅ 이 필드를 HTML에서 출력할 때 사용
      isFavorite: false,
      rating: 4.2,
      reviews: 123,
      viewCount: 567,
      images: ["/images/store1.jpg", "/images/store2.jpg"],
      openingHours: [
        { day: 1, open: "10:00", close: "22:00" },
        { day: 2, open: "10:00", close: "22:00" }
      ]
    };
  });
  return mappedData;
}

function createStoreCard(store) {
  const card = document.createElement("div");
  card.className = "store-card";

  const isOpen = Array.isArray(store.openingHours) && getStoreStatus(store.openingHours) === '영업 중';

  const rating = store.rating;
  const reviews = store.reviews > 999 ? '999+' : store.reviews;

  card.innerHTML = `
    <div class="store-info">
      <div class="store-header">
        <h3 class="store-name">
          <span class="store-link" data-id="${store.id}">${store.name}</span>
        </h3>
        <span class="store-category">${store.category}</span>
        <span class="store-region">${store.regionName}</span>
        <button class="favorite-button ${store.isFavorite ? 'active' : ''}" aria-label="즐겨찾기">☆</button>
      </div>
      <div class="store-details">
        <span class="status ${isOpen ? 'open' : ''}">${isOpen ? '영업 중' : '영업 전'}</span>
        <span class="rating">★ ${rating}</span>
        <span class="reviews">리뷰 ${reviews}</span>
      </div>
    </div>
    <div class="store-images">
      ${(store.images || []).map(src => `<img src="${src}" alt="${store.name} 이미지" loading="lazy">`).join('')}
  `;

  const link = card.querySelector(".store-link");
  link.addEventListener("click", () => {
    window.location.href = `/feature-searchinfo/searchinfo.html?id=${store.id}`;
  });

  const favBtn = card.querySelector(".favorite-button");
  favBtn.addEventListener("click", async () => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      alert("로그인이 필요합니다.");
      return;
    }
    const newStatus = !favBtn.classList.contains("active");
    favBtn.classList.toggle("active", newStatus);
    await updateFavoriteStatusDummy(store.id, newStatus);
  });

  return card;
}

function renderStoreCards(stores) {
  const storeListContainer = document.querySelector('.store-list-container');
  storeListContainer.innerHTML = '';
  if (stores.length === 0) {
    storeListContainer.innerHTML = '<p style="text-align:center">검색 결과가 없습니다.</p>';
    return;
  }
  stores.forEach(store => {
    storeListContainer.appendChild(createStoreCard(store));
  });
}

// async function updateFavoriteStatusDummy(storeId, isFavorite) {
//   const store = dummyStoresData.find(s => s.id === storeId);
//   if (store) store.isFavorite = isFavorite;
// }

function getStoreStatus(openingHours) {
if (!Array.isArray(openingHours)) return '영업 전';

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
      return stores.slice().sort((a, b) => b.rating - a.rating);
    case 'views':
      return stores.slice().sort((a, b) => b.viewCount - a.viewCount);
    case 'alphabet':
      return stores.slice().sort((a, b) => a.name.localeCompare(b.name));
    case 'favorite':
      return stores.filter(store => store.isFavorite);
    case 'reviews':
      return stores.slice().sort((a, b) => b.reviews - a.reviews);
    default:
      return stores;
  }
}

// async function renderTop5Ranking(useDummy = true) {
//   const topRankingList = document.getElementById("topRankingList");
//   if (!topRankingList) return;

//   let top5 = [];

//   if (useDummy) {
//     top5 = dummyStoresData
//       .slice()
//       .sort((a, b) => b.viewCount - a.viewCount)
//       .slice(0, 5);
//     updateTopRankingList(top5);
//   } else {
//     try {
//       const response = await fetch("http://백엔드주소/api/ranking", {
//         method: 'GET',
//         headers: { 'Content-Type': 'application/json' }
//       });
//       if (!response.ok) throw new Error("서버 응답 실패");
//       const data = await response.json();
//       top5 = data.slice(0, 5);
//       updateTopRankingList(top5);
//     } catch (err) {
//       topRankingList.innerHTML = `<li style="color:red;">TOP5 불러오기 실패</li>`;
//     }
//   }
// }

// function updateTopRankingList(top5) {
//   const topRankingList = document.getElementById("topRankingList");
//   topRankingList.innerHTML = '';
//   top5.forEach((store, index) => {
//     const li = document.createElement("li");
//     li.style.marginBottom = "12px";
//     li.innerHTML = `
//       <div style="font-weight: bold;">${index + 1}위. ${store.name}</div>
//       <div style="font-size: 0.9em; color: gray;">조회수: ${store.viewCount}</div>
//     `;
//     topRankingList.appendChild(li);
//   });
// }
