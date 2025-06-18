document.addEventListener("DOMContentLoaded", async () => {
  // 🔐 로그인 상태 확인
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const nickname = localStorage.getItem("nickname");

  if (!isLoggedIn || !nickname) {
    alert("로그인이 필요합니다.");
    location.href = "/feature-login/login.html";
    return;
  }

  //  토큰 기반 (JWT)
  // const token = localStorage.getItem("accessToken");
  // if (!token) {
  //   alert(\"토큰 없음. 로그인 필요\");
  //   return;
  // }

  // 🔍 가게 ID 파라미터 확인
  const params = new URLSearchParams(location.search);
  const storeId = Number(params.get("id"));

//   if (!storeId || isNaN(storeId)) {
//     alert("잘못된 접근입니다.");
//     location.href = "/feature-searchMain/search.html";
//     return;
//   }

  // ✅ 더미/실제 연동 토글
  const useDummy = true;

  const store = useDummy
    ? getDummyStore(storeId)
    : await fetchStoreFromServer(storeId);

  renderStoreDetail(store);
});

// 더미 데이터 생성
function getDummyStore(id) {
  return {
    id,
    name: `김밥천국 ${id}호점`,
    category: "분식",
    rating: 4.3,
    reviews: 128,
    isFavorite: true,
    location: "서울시 강남구 테헤란로 123",
    priceRange: "₩₩",
    description: "가성비 좋은 분식 전문점입니다.",
    images: ["/images/store1.jpg", "/images/store2.jpg"],
    openingHours: [
      { day: 1, open: "10:00", close: "22:00" },
      { day: 2, open: "10:00", close: "22:00" }
    ]
  };
}

// 실서버 연동 (나중에 주석 해제)
async function fetchStoreFromServer(id) {
  const res = await fetch(`http://100.74.28.37:8081/api/store/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // "Authorization": `Bearer ${localStorage.getItem(\"accessToken\")}`
    }
  });
  if (!res.ok) throw new Error("가게 정보를 불러오지 못했습니다.");
  return await res.json();
}

// 화면 렌더링
function renderStoreDetail(store) {
  const container = document.getElementById("storeDetailContainer");
  container.innerHTML = `
    <button onclick=\"history.back()\">← 뒤로가기</button>
    <h1>${store.name}</h1>
    <p><strong>카테고리:</strong> ${store.category}</p>
    <p><strong>평점:</strong> ★ ${store.rating} / 리뷰 ${store.reviews}개</p>
    <p><strong>위치:</strong> ${store.location} 
       <a href=\"https://map.kakao.com/link/search/${encodeURIComponent(store.location)}\" target=\"_blank\">[지도]</a></p>
    <p><strong>가격대:</strong> ${store.priceRange}</p>
    <p><strong>설명:</strong> ${store.description}</p>
    <div class=\"image-gallery\">
      ${store.images.map(src => `<img src=\"${src}\" alt=\"매장 이미지\" onerror=\"this.src='/images/default.png'\" loading=\"lazy\">`).join('')}
    </div>
  `;
}
