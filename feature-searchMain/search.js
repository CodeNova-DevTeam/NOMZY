// searchMain.js - 더미 + 실서버 연동 버전 전체

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
  const dummyStoresData = Array.from({ length: 20 }, (_, i) => {
    const categories = ["한식", "중식", "일식", "양식", "분식", "카페", "패스트푸드", "멕시칸", "해산물", "바"];
    const names = ["김밥천국", "홍콩반점", "스시야", "이탈리안하우스", "떡볶이연구소", "별다방", "버거킹", "타코벨", "제주해물탕", "펍서울"];
    return {
      id: i + 1,
      name: `${names[i % names.length]} ${i + 1}호점`,
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
        return stores.slice().sort((a, b) => b.rating - a.rating);
      case 'favorite':
        return stores.filter(store => store.isFavorite);
      case 'reviews':
        return stores.slice().sort((a, b) => b.reviews - a.reviews);
      default:
        return stores;
    }
  }

  async function renderAllStoreCards() {
    storeListContainer.innerHTML = "<p style='text-align:center'>불러오는 중...</p>";
    try {
      const query = new URLSearchParams(location.search).get('q');
      if (query) searchQueryDisplay.textContent = `'${query}' 검색 결과`;

      // 아래 중 하나만 사용: 더미 또는 실서버
      // const stores = await fetchStoresDataDummy(query); // 기본 테스트용
      const stores = await fetchStoresDataReal(query); // 실제 서버 연동용

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
