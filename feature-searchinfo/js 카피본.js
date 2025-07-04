// 더미/실제 연동 토글
// true면 더미 false면 실제서버연동
const useDummy = true;

document.addEventListener("DOMContentLoaded", async () => {

  // 로그인 상태 확인
//  if (localStorage.getItem("isLoggedIn") !== "true"){
//     alert("로그인이 필요합니다람쥐.");
//   window.location.href = "/feature-login/login.html";
//   }

  //  토큰 기반 (JWT)
  // const token = localStorage.getItem("accessToken");
  // if (!token) {
  //   alert(\"토큰 없음. 로그인 필요\");
  //   return;
  // }

  // 가게 ID 파라미터 확인
  const params = new URLSearchParams(location.search);
  const storeId = Number(params.get("id"));

//   if (!storeId || isNaN(storeId)) {
//     alert("잘못된 접근입니다.");
//     location.href = "/feature-searchMain/search.html";
//     return;
//   }


  const store = useDummy
    ? getDummyStore(storeId)
    : await fetchStoreFromServer(storeId);

  renderStoreDetail(store);
});

// 더미 데이터 생성
function getDummyStore(id) {
  return {
    id,
    title: `김밥천국 ${id}호점`,
    category: "분식",
    rating: 4.3,
    reviews: 128,
    isFavorite: true,
    likes: 72,
    dislikes: 5,
    userReaction : "like",
    phone: "02-123-4567",
    location: "서울시 강남구 테헤란로 123",
    priceRange: "₩₩",
    description: "가성비 좋은 분식 전문점입니다.",
    images: ["/images/store1.jpg", "/images/store2.jpg"],
    tags : ["해장", "저렴한", "혼밥"],
    menuItems: [
      { name: "김밥", price: 4000 },
      { name: "라면", price: 5000 },
      { name: "돈까스", price: 8000 },
      { name: "떡볶이", price: 4500 }
    ],
    openingHours: [
      { day: 1, open: "10:00", close: "22:00" },
      { day: 2, open: "10:00", close: "22:00" },
      { day: 3, open: "10:00", close: "22:00" },
      { day: 4, open: "10:00", close: "22:00" },
      { day: 5, open: "10:00", close: "22:00" },
      { day: 6, open: "10:00", close: "21:00" },
      { day: 0, open: "11:00", close: "20:00" }
    ]
  };
}


// 실서버 연동 (나중에 주석 해제)
async function fetchStoreFromServer(id) {
  const response = await axios.get(`http://100.74.28.37:8082/api/store/${id}`);
  return response.data;
}

// 화면 렌더링
function renderStoreDetail(store) {
  const container = document.getElementById("storeDetailContainer");

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const openingTable = store.openingHours.map(h => {
    return `<tr><td>${days[h.day]}</td><td>${h.open} ~ ${h.close}</td></tr>`;
  }).join("");

  const menuList = store.menuItems
  ?.sort((a,b) => a.price - b.price)
  .map(item => `<li>${item.name} - <strong>${item.price.toLocaleString()}원</strong></li>` 
  ).join("") || "<li>메뉴 정보 없음</li>";

  container.innerHTML = `
    <button onclick=\"history.back()\">← 뒤로가기</button>
    <h1>${store.title}</h1>
      <button id="favoriteButton" data-favorite="${store.isFavorite}" style="font-size: 1.5rem; color: ${store.isFavorite ? '#ffc107' : '#ccc'}; border: none; background: none; cursor: pointer;">
        ★
      </button>
    <p><strong>카테고리:</strong> ${store.category}</p>
    <p><strong>평점:</strong> ★ ${store.rating} / 리뷰 ${store.reviews}개</p>

    <div id="reactionSection" style="margin-bottom: 1rem;">
      <strong>반응:</strong>
      <button id="likeBtn" style="margin-right: 1rem; color: ${store.userReaction === "like" ? "blue" : "gray"};">👍 ${store.likes}</button>
      <button id="dislikeBtn" style="color: ${store.userReaction === "dislike" ? "red" : "gray"};">👎 ${store.dislikes}</button>
    </div>

    <p><strong>위치:</strong> ${store.location} 
       <a href=\"https://map.kakao.com/link/search/${encodeURIComponent(store.location)}\" target=\"_blank\">[지도]</a></p>
    <p>
      <strong>전화번호:</strong>
        ${
          store.phone
            ? `<a href="tel:${store.phone}" style="color: blue;">${store.phone}</a>`
            : `<span style="color: gray;">정보 없음</span>`
        }
    </p>

    </p>
    <p><strong>가격대:</strong> ${store.priceRange}</p>
    <p><strong>설명:</strong> ${store.description}</p>

    <p>
      <span style="color:${getCurrentStatus(store.openingHours) === '영업 중' ? 'green' : 'gray'}; font-weight:bold;">
        ${getCurrentStatus(store.openingHours)}
      </span>
    </p>

    <h3>📅 영업시간</h3>
    <table border="1" style="border-collapse:collapse; margin-bottom: 1rem;">
      <thead><tr><th>요일</th><th>운영시간</th></tr></thead>
      <tbody>${openingTable}</tbody>
    </table>

    <h3>📋 대표 메뉴</h3>
    <ul>${menuList}</ul>

    <div class=\"image-gallery\">
       ${store.images.map(src => `<img src=\"${src}\" alt=\"매장 이미지\" onerror=\"this.src='/images/default.png'\" loading=\"lazy\">`).join('')}
    </div>

    <h3>🏷️ 태그</h3>
    <p>
      ${
        store.tags?.length > 0
          ? store.tags.map(tag => `<span style="margin-right: 0.5rem;">#${tag}</span>`).join('')
          : "<span style='color:gray;'>태그 정보 없음</span>"
      }
    </p>
    `;

  const favoriteButton = document.getElementById("favoriteButton");

  // 이미지 클릭 시 모달 열기
  document.querySelectorAll(".image-gallery img").forEach(img => {
    img.addEventListener("click", () => {
      const modal = document.getElementById("imageModal");
      const modalImg = document.getElementById("modalImage");
      modalImg.src = img.src;
      modal.style.display = "flex";
    });
  });
  // 모달 닫기
  document.getElementById("modalClose").addEventListener("click", () => {
    document.getElementById("imageModal").style.display = "none";
  });
  // ESC키 누르면 모달 닫기
  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") {
      document.getElementById("imageModal").style.display = "none";
    }
  }, { once : false });

    favoriteButton.addEventListener("click", async () => {

      const isNowFavorite = favoriteButton.dataset.favorite === "true";
      const newStatus = !isNowFavorite;

      favoriteButton.style.color = newStatus ? "#ffc107" : "#ccc";
      favoriteButton.dataset.favorite = newStatus;

      const nickname = localStorage.getItem("nickname") || "GUEST";

      if (useDummy) {
        console.log(`[더미] 즐겨찾기 상태 ${newStatus ? "추가됨" : "제거됨"} : ${nickname}`);
        return;
      }
      
      try {
        const response = await axios.post("http://100.123.221.61:8082/api/favorite/toggle", {          
            restaurantId : store.id,
            favorite : newStatus,
            nickname
        });

        const result = response.data;
        console.log("[서버응답]",result);

      } catch(error) {
        favoriteButton.style.color = isNowFavorite ? "#ffc107" : "#ccc";
        favoriteButton.dataset.favorite = String(isNowFavorite);
        alert("즐겨찾기 처리 중 오류가 발생했습니다.");
        console.error(error);
      }

      console.log(`즐겨찾기 상태 ${newStatus ? "추가됨" : "제거됨"}`);
    })
} // 화면 렌더링함수 끝


const likeButton = document.getElementById("likeButton");
const dislikeButton = document.getElementById("dislikeButton");

likeButton.addEventListener("click", () => handleReaction("like"));
dislikeButton.addEventListener("click", () => handleReaction("dislike"));

async function handleReaction(type) {

  const isLike = type === "like";

  const prevReaction = store.userReaction;
  let changed = false;

  if (prevReaction === type) {
    store.userReaction = null;
    if (isLike) store.likes--; else store.dislikes--;
    changed = true;
  } else {
    if (prevReaction === "like") store.likes--;
    if (prevReaction === "dislike") store.dislikes--;
    store.userReaction = type;
    if (isLike) store.likes++; else store.dislikes++;
    changed = true;
  }
  if (!changed)
    return;

  likeButton.style.color = store.userReaction === "like" ? "blue" : "gray";
  dislikeButton.style.color = store.userReaction === "dislike" ? "red" : "gray";
  likeButton.innerHTML = `👍${store.likes}`;
  dislikeButton.innerHTML = `👎${store.dislikes}`;

  const nickname = localStorage.getItem("nickname") || "GUEST";

  if (useDummy) {
    console.log(`[더미] 반응 처리됨 : ${store.userReaction}`);
    return;
  }

  try {

    const response = await axios.post("http://100.123.221.61:8082/api/reaction/toggle", {
      
        restaurantId: store.id,
        reaction: store.userReaction, // "like" | "dislike" | null
        nickname
    });

    const result = response.data;
    console.log("[서버 응답]", result);

  } catch(error) {
    console.log(error);

    if (store.userReaction === "like") store.likes--;
    if (store.userReaction === "dislike") store.dislikes--;
    if (prevReaction === "like") store.likes++;
    if (prevReaction === "dislike") store.dislikes++;

    store.userReaction = prevReaction;

    likeButton.style.color = prevReaction === "like" ? "blue" : "gray";
    dislikeButton.style.color = prevReaction === "dislike" ? "red" : "gray";
    likeButton.innerHTML = `👍${store.likes}`;
    dislikeButton.innerHTML = `👎${store.dislikes}`;
  }
}


// 실시간 영업상태 표시 ( 더미 + 서버연동 ) 함수
function getCurrentStatus(openingHours) {
  
  if (!Array.isArray(openingHours))
    return "정보 없음";

  const now = new Date();
  const nowDay = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const today = openingHours.find(h => h.day === nowDay);
  if (!today)
    return "정보 없음";

  const [oh , om] = today.open.split(":").map(Number);
  const [ch , cm] = today.close.split(":").map(Number);
  const open = oh * 60 + om;
  const close = ch * 60 + cm;

  if (close < open) {
    return nowMin >= open || nowMin < close ? "영업 중" : "영업 전";
  }
  return nowMin >= open && nowMin < close ? "영업 중" : "영업 전";
} // 실시간 영업상태 표시 함수 끝