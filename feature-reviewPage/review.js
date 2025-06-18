// 리뷰 페이지 js 전체 리팩터링 (JWT 인증 포함, 더미 & 서버 연동 분기 + 페이지네이션 지원)

const useDummyData = true; // true일 때 로그인 없이 테스트 가능

if (!useDummyData && localStorage.getItem("isLoggedIn") !== "true") {
  alert("로그인 후 리뷰 페이지를 이용하실 수 있습니다.");
  window.location.href = "/feature-login/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get("id") || 1;
  const page = parseInt(urlParams.get("page")) || 1;
  fetchReviewsFromDB(restaurantId, page);
});

function renderStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    "★".repeat(fullStars) +
    (halfStar ? "☆" : "") +
    "✩".repeat(emptyStars)
  );
}
// 리뷰 불러오기 
async function fetchReviewsFromDB(restaurantId, page = 1, pageSize = 5) {
  try {
    let reviews = [];
    let total = 0;

    if (useDummyData) {
      const allDummy = Array.from({ length: 23 }, (_, i) => ({
        id: i + 1,
        nickname: `유저${i + 1}`,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        content: `더미 리뷰 내용 ${i + 1}`,
        createdAt: `2024-06-${String((i % 30) + 1).padStart(2, '0')}`
      }));
      total = allDummy.length;
      reviews = allDummy.slice((page - 1) * pageSize, page * pageSize);
    } else {

      const url = new URL(`http://백엔드서버주소/api/review`);

      url.searchParams.append("restaurantId", restaurantId);
      url.searchParams.append("page", page);
      url.searchParams.append("size", pageSize);

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("리뷰 조회 실패");
      const data = await response.json();
      reviews = data.reviews;
      total = data.total;
    }

    renderReviews(reviews);
    renderPagination(page, pageSize, total);
  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    alert("리뷰를 불러오는 중 오류가 발생했습니다.");
  }
}
// 리뷰 렌더링 + 대댓글
function renderReviews(reviews) {
  const container = document.getElementById("reviewContainer");
  container.innerHTML = "";

  if (reviews.length === 0) {
    container.innerHTML = "<p>아직 리뷰가 없습니다.</p>";
    return;
  }

  reviews.forEach((review) => {
    const div = document.createElement("div");
    div.classList.add("review-box");

    div.innerHTML = `
      <div class="review-header">
        <strong>${review.nickname}</strong>
        <span class="rating">${renderStars(review.rating)} (${review.rating})</span>
      </div>
      <p class="content">${review.content}</p>
      <small class="date">${review.createdAt}</small>
      <div class="reply-list" id="reply-list-${review.id}"></div>

      <div class="reply-form">
        <input type="text" id="reply-input-${review.id}" placeholder="답글을 입력하세요" />
        <button onclick="submitReply(${review.id})">등록</button>
      </div>
    `;

    container.appendChild(div);
  });
}

async function loadReplies(reviewId) {
  try {
    const res = await fetch(`http://100.74.28.37:8081/api/replies?reviewId=${reviewId}`);
    if (!res.ok) throw new Error("답글 불러오기 실패");

    const replyData = await res.json();
    const replyBox = document.getElementById(`reply-list-${reviewId}`);
    replyBox.innerHTML = "";

    replyData.forEach(reply => {
      const div = document.createElement("div");
      div.classList.add("reply-box");
      div.innerHTML = `<strong>${reply.nickname}</strong>: ${reply.content}`;
      replyBox.appendChild(div);
    });
  } catch (error) {
    console.error("답글 조회 오류:", error);
  }
}

// 대댓글 등록
async function submitReply(reviewId) {
  const input = document.getElementById(`reply-input-${reviewId}`);
  const content = input.value.trim();

  if (!content) {
    alert("답글을 입력해주세요.");
    return;
  }

  const nickname = localStorage.getItem("nickname") || "익명";

  try {
    const response = await fetch("#", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        reviewId,
        nickname,
        content
      })
    });

    if (!response.ok) throw new Error("답글 등록 실패");

    await loadReplies(reviewId);
    input.value = "";
  } catch (error) {
    console.error("답글 등록 오류:", error);
    alert("답글 등록 중 오류가 발생했습니다.");
  }
}


// 페이지 네이션
function renderPagination(currentPage, pageSize, totalItems) {
  const container = document.getElementById("paginationContainer");
  if (!container) return;
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", i);
      history.pushState(null, '', `?${urlParams.toString()}`);
      location.reload();
    });
    container.appendChild(btn);
  }
}

