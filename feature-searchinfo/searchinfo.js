const isLoggedIn = localStorage.getItem("isLoggedIn");
const nickname = localStorage.getItem("nickname");
if (isLoggedIn !== "true" || !nickname){
    alert("로그인이 필요합니다.");
  window.location.href = "/feature-login/login.html";
  }
  
document.addEventListener("DOMContentLoaded", async () => {

  //  토큰 기반 (JWT)
  // const token = localStorage.getItem("accessToken");
  // if (!token) {
  //   alert(\"토큰 없음. 로그인 필요\");
  //   return;
  // }

  // 가게 ID 파라미터 확인
  const params = new URLSearchParams(location.search);
  const storeId = Number(params.get("id"));

  // if (!storeId || isNaN(storeId)) {
  //   alert("잘못된 접근입니다.");
  //   location.href = "/feature-searchMain/searchResult.html";
  //   return;
  // }

  const store = await fetchStoreFromServer(storeId);
  renderStoreDetail(store);
});

// 실서버 연동
async function fetchStoreFromServer(id) {
  const response = await axios.get(`http://192.168.0.110:8080/nomzy/store/${id}`, {
    // herder : {
    // Authorization: `Bearer ${localStorage.getItem("token")}`
    // }
  });
  return response.data;
}

// 화면 렌더링
function renderStoreDetail(store) {
  const container = document.getElementById("storeDetailContainer");

  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const openingTable = store.openingHours.map(h => {
    return `<tr><td>${days[h.day]}</td><td>${h.open} ~ ${h.close}</td></tr>`;
  }).join("") || "<tr><td colspan='2'>정보 없음</td></tr>";

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
        ${store.phone
            ? `<a href="tel:${store.phone}" style="color: blue;">${store.phone}</a>`
            : `<span style="color: gray;">정보 없음</span>`}
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
      ${store.tags?.length > 0
          ? store.tags.map(tag => `<span style="margin-right: 0.5rem;">#${tag}</span>`).join('')
          : "<span style='color:gray;'>태그 정보 없음</span>"}
    </p>
    `;
     container.innerHTML += `
      <div>
        <button id="writeReviewBtn">✍ 리뷰 작성</button>
      </div>
    `;
        // ✍ 리뷰 작성 버튼 아래에 추가
    container.innerHTML += `
      <div style="margin-top: 0.5rem;">
        <button id="viewReviewBtn" style="padding: 8px 14px; font-weight: bold;">🗂 리뷰 보러가기</button>
      </div>
    `;

    // 버튼 이벤트 핸들링
    document.getElementById("viewReviewBtn").addEventListener("click", () => {
      const restaurantId = store.id;
      window.location.href = `/feature-reviewPage/review.html?restaurantId=${restaurantId}`;
    });

    
    document.getElementById("writeReviewBtn").addEventListener("click", () => {
      const restaurantId = store.id;
      window.location.href = `/feature-cerationReview/cerationreviewPage.html?restaurantId=${restaurantId}`;
    });

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

  
  const favoriteButton = document.getElementById("favoriteButton");
    favoriteButton.addEventListener("click", async () => {

      const isNowFavorite = favoriteButton.dataset.favorite === "true";
      const newStatus = !isNowFavorite;

      favoriteButton.style.color = newStatus ? "#ffc107" : "#ccc";
      favoriteButton.dataset.favorite = newStatus;

      const nickname = localStorage.getItem("nickname") || "GUEST";
      
      try {
        const response = await axios.post("http://192.168.0.110:8080/nomzy/favorite/toggle", {          
            restaurantId : store.id,
            favorite : newStatus,
            nickname
        }, {
          headers : {
            "Content-Type" : "application/json",
            // Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
        console.log("[서버응답]",response);

      } catch(error) {
        favoriteButton.style.color = isNowFavorite ? "#ffc107" : "#ccc";
        favoriteButton.dataset.favorite = String(isNowFavorite);
        alert("즐겨찾기 처리 중 오류가 발생했습니다.");
        console.error(error);
      }
      console.log(`즐겨찾기 상태 ${newStatus ? "추가됨" : "제거됨"}`);
    })
    const likeButton = document.getElementById("likeBtn");
    const dislikeButton = document.getElementById("dislikeBtn");

    likeButton.addEventListener("click", () => handleReaction("like", store));
    dislikeButton.addEventListener("click", () => handleReaction("dislike", store));
} // 화면 렌더링함수 끝


// 좋아요 / 싫어요 처리 함수 
async function handleReaction(type, store) {

  const isLike = type === "like";
  const prevReaction = store.userReaction;

  if (prevReaction === type) {
    store.userReaction = null;
    if (isLike) store.likes--; else store.dislikes--;
  } else {
    if (prevReaction === "like") store.likes--;
    if (prevReaction === "dislike") store.dislikes--;
    store.userReaction = type;
    if (isLike) store.likes++; else store.dislikes++;
  }

  document.getElementById("likeBtn").style.color = store.userReaction === "like" ? "blue" : "gray";
  document.getElementById("dislikeBtn").style.color = store.userReaction === "dislike" ? "red" : "gray";
  document.getElementById("likeBtn").innerHTML = `👍${store.likes}`;
  document.getElementById("dislikeBtn").innerHTML = `👎${store.dislikes}`;

  const nickname = localStorage.getItem("nickname") || "GUEST";

  try {
    const response = await axios.post("http://192.168.0.110:8080/nomzy/reaction/toggle", {
        restaurantId: store.id,
        reaction: store.userReaction, // "like" | "dislike" | null
        nickname
    } , {
      headers : {
        "Content-Type" : "application/json",
        // Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    console.log("[서버 응답]", response);

  } catch(error) {
    if (store.userReaction === "like") store.likes--;
    if (store.userReaction === "dislike") store.dislikes--;
    if (prevReaction === "like") store.likes++;
    if (prevReaction === "dislike") store.dislikes++;
    store.userReaction = prevReaction;

    document.getElementById("likeBtn").style.color = prevReaction === "like" ? "blue" : "gray";
    document.getElementById("dislikeBtn").style.color = prevReaction === "dislike" ? "red" : "gray";
    document.getElementById("likeBtn").innerHTML = `👍${store.likes}`;
    document.getElementById("dislikeBtn").innerHTML = `👎${store.dislikes}`;
    console.error(error);
  }
}


// 실시간 영업상태 표시 서버연동 함수
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