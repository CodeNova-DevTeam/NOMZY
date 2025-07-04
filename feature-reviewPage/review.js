const isLoggedIn = localStorage.getItem("isLoggedIn");
const nickname = localStorage.getItem("nickname");
// if (isLoggedIn !== "true" || !nickname){
//   alert("로그인이 필요합니다.");
//   window.location.href = "/feature-login/login.html";
// }

let currentReviews = [];


// 추후 JWT토큰으로 로그인시 주석해제
// const token = localStorage.getItem("accessToken");
// if (!token) {
//   alert("토큰 없음. 로그인 필요");
//   return;
// }


document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const restaurantId = urlParams.get("id") || 1;
  const page = parseInt(urlParams.get("page")) || 1;
  fetchReviewsFromDB(restaurantId, page);

  document.getElementById("sort-by").addEventListener("change", () => {
    const sorted = applyReviewSort(currentReviews, document.getElementById("sort-by").value);
    renderReviews(sorted);
  });
});

 // 리뷰의 평점( 예 : 4.5 )을 입력 받아서 별 아이콘 문자열로 변환해주는 함수
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

// 정렬 함수
function applyReviewSort(reviews, sortType = "default") {
  return [...reviews].sort((a, b) => {
    switch (sortType) {
      case "rating_desc":
        return b.rating - a.rating;
      case "rating_asc" :
        return a.rating - b.rating;
      case "likeCount_desc":
        return ((b.likes || 0) - (b.dislikes || 0)) - ((a.likes || 0) - (b.likes || 0))
      case "recent_desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "default":
      default:
        return (
          b.rating - a.rating ||                      // 별점 높은 순
          (b.reviewCount || 0) - (a.reviewCount || 0)    // 리뷰 수
        );
    }
  }).filter(review => {
    if (sortType ==="likeCount_desc") {
      return (review.likes || 0) - (review.dislikes || 0) >= 1;
    }
    return true;
  });
}


// 리뷰 불러오기 
async function fetchReviewsFromDB(restaurantId, page = 1, pageSize = 10) {
  
  try {
    let reviews = [];
    let total = 0;

    const url = new URL(`http://192.168.0.110:8080/nomzy/review`);

      url.searchParams.append("restaurantId", restaurantId);
      url.searchParams.append("page", page);
      url.searchParams.append("size", pageSize);

      const response = await axios.get(url.toString(), {
        headers : {
        // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      const data = response.data;
      reviews = data.reviews;
      total = data.total;
    
      currentReviews = reviews;

      const sortType = document.getElementById("sort-by")?.value || "default";
      const sorted = applyReviewSort(currentReviews, sortType);
      renderReviews(sorted);
      renderPagination(page, pageSize, total);

  } catch (error) {
    console.error("리뷰 가져오기 오류:", error);
    alert("리뷰를 불러오는 중 오류가 발생했습니다.");
  }
}


// 검색 핸들러 등록
document.getElementById("search-button").addEventListener("click", () => {
  const keyword = document.getElementById("search-input").value.trim();
  const type = document.getElementById("search-type").value;
  searchAndRenderReviews(keyword,type);
});


// 검색 함수
async function searchAndRenderReviews(keyword, type) {
    if (!keyword)
      return;

    let filtered = [];
    let total = 0;
      try {
        const response = await axios.get("http://192.168.0.110:8080/nomzy/review/search", {
        params : {
          keyword : keyword,
          type : type      
        }, 
        headers : {
     // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
        const data = response.data;
        currentReviews = data.reviews;
        total = data.total;

        const sortBy = document.getElementById("sort-by").value;
        const sorted = applyReviewSort(currentReviews, sortBy);
        renderReviews(sorted);
        renderPagination(1, 10, total);

      } catch (error) {
        console.error("검색 오류:", error);
        alert("검색 중 오류가 발생했습니다.");
        return;
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

  const myNickname = localStorage.getItem("nickname") || "GUEST";

  reviews.forEach((review) => {
    const isMine = review.nickname === myNickname;

    const div = document.createElement("div");
    div.classList.add("review-box");

    const modifiedText = review.modified ? "(수정됨)" : "";
    const likeClass = review.userLiked ? "active" : "";
    const dislikeClass = review.userDisliked ? "active" : "";
    const titleHtml = review.reviewTitle
      ? `<div class="review-title">
          <a href="/feature-reviewPage/reviewdetail.html?reviewId=${review.id}" style="text-decoration:none; color:inherit;">
            ${review.reviewTitle}
          </a>
        </div>`
      : "";

    div.innerHTML = `
      <div class="review-header">
        <strong>${review.nickname}</strong>
        <span class="rating">${renderStars(review.rating)} (${review.rating}) ${modifiedText}</span>
      </div>

      ${titleHtml}

      <div class="review-meta">
        <span class="store-info">
        <a href="/feature-searchinfo/searchinfo.html?restaurantId=${review.restaurantId}" style="text-decoration:none; color:inherit;">
          ${review.title || '가게명'}
        </a>
        </span> /
        <span class="region-info">${review.region || '지역'}</span> /
        <span class="category-info">${review.category || '음식종류'}</span>
      </div>

      <div class="hashtag-line">
        ${(review.hashtags || []).map(tag => `#${tag}`).join(' ')}
      </div>

      <p class="review-content">${review.content}</p>
      ${review.imageUrl ? `<div class="review-image"><img src="${review.imageUrl}" alt="리뷰 이미지" onerror="this.style.display='none'"></div>` : ''}
      <small class="date">${formatDate(review.createdAt)}</small>

      <div class="review-actions">
        <button class="like-btn ${likeClass}" onclick="toggleLike(${review.id})">👍 ${review.likes || 0}</button>
        <button class="dislike-btn ${dislikeClass}" onclick="toggleDislike(${review.id})">👎 ${review.dislikes || 0}</button>
        <button onclick="alert('신고 접수되었습니다.')">🚫 신고</button>
        ${isMine ? `<button onclick="editReview(${review.id})">✏️ 수정</button>` : ""}
        ${isMine ? `<button onclick="deleteReview(${review.id})">🗑 삭제</button>` : ""}
      </div>

      <div class="reply-toggle" onclick="toggleReplySection(${review.id})">💬 댓글 보기</div>
      <div class="reply-section" id="reply-section-${review.id}" style="display: none;">
        <div class="reply-list" id="reply-list-${review.id}"></div>
        <div class="reply-form">
          <input type="text" id="reply-input-${review.id}" placeholder="답글을 입력하세요" />
          <button onclick="submitReply(${review.id})">등록</button>
        </div>
        <div class="reply-pagination" id="reply-pagination-${review.id}"></div>
      </div>
    `;
    container.appendChild(div);

    if (review.id === 1) {
      toggleReplySection(review.id, true);
    }
  });

  addToggleToLongReviews();
  applyMoreToggle(".reply-content");
}


// 댓글이나 최대길이 제한함수
function addToggleToLongReviews() {
  document.querySelectorAll(".review-content").forEach(content => {
    const originalHeight = content.scrollHeight;
    const lineHeight = parseInt(getComputedStyle(content).lineHeight);
    const maxVisibleLines = 5;

    if (originalHeight / lineHeight > maxVisibleLines) {
      const toggleButton = document.createElement("button");
      toggleButton.textContent = "더보기";
      toggleButton.className = "more-button";
      toggleButton.addEventListener("click", () => {
        content.classList.toggle("expanded");
        toggleButton.textContent = content.classList.contains("expanded") ? "접기" : "더보기";
      });
      content.parentElement.appendChild(toggleButton);
    }
  })
}


// 대댓글용 드랍다운 열기
function toggleReplySection(reviewId, forceOpen = false) {

  const section = document.getElementById(`reply-section-${reviewId}`);
  if (!section)
    return;
  const isVisible = section.style.display === "block";
  section.style.display = forceOpen || !isVisible ? "block" : "none";

  if (!isVisible || forceOpen) {
    loadRepliesWithPagination(reviewId, 1);
  }
}


// 대댓글 로딩 + 페이지네이션
async function loadRepliesWithPagination(reviewId, page = 1, size = 10) {
  const container = document.getElementById(`reply-list-${reviewId}`);
  const pagination = document.getElementById(`reply-pagination-${reviewId}`);
  const nickname = localStorage.getItem("nickname") || "GUEST";

  if (!container || !pagination)
    return;

  container.innerHTML = "";
  pagination.innerHTML = "";

  try {
    let replies = [];
    let total = 0;
    
    
      const response = await axios.get("http://192.168.0.110:8080/nomzy/reply", {
        params : {
          reviewId : reviewId,
          page : page,
          size : size
        },
        headers : {
        // Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const data = response.data;
      replies = data.replies;
      total = data.total;
    

    replies.forEach(reply => {
      const div = document.createElement("div");
      div.classList.add("reply-box");

      const isMine = reply.nickname === nickname;
      const modifiedTag = reply.modified ? "(수정됨)" : "";

      div.innerHTML = `
      <strong>${reply.nickname}</strong> ${modifiedTag}
      <p class="reply-content">${reply.content}</p>
      ${isMine ? `<button onclick="editReply(${reply.id}, ${reviewId})">✏️</button>` : ""}
      ${isMine ? `<button onclick="deleteReply(${reply.id}, ${reviewId})">🗑</button>` : ""}
      `
      container.appendChild(div);
    });

    renderReplyPagination(pagination, reviewId, page, size, total);

  } catch(error) {
    console.error("대댓글 오류 : ", error);
    container.innerHTML = "<p>댓글을 불러오는데 실패했습니다.</p>";
  }

  applyMoreToggle(".reply-content");
}


// 대댓글 페이지네이션 중앙정렬
function renderReplyPagination(container, reviewId, currentPage, size, totalItems) {
  const totalPages = Math.ceil(totalItems / size);
  if (totalPages <= 1)
    return;

  let startPage = Math.max(1, currentPage - 4);
  let endPage = startPage + 9;
  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - 9);
  }

  for(let i=startPage; i<=endPage; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = i === currentPage ? "active" : "";
    button.addEventListener("click", () => loadRepliesWithPagination(reviewId, i));
    container.appendChild(button);
  }
}


// 대댓글 수정 / 삭제
async function editReply(replyId, reviewId) {
  const newContent = prompt("댓글을 수정하세요 : ");

  if (!newContent || newContent.trim() === "")
    return;

  const nickname = localStorage.getItem("nickname") || "GUEST";

  
    try {
      await axios.put(`http://192.168.0.110:8080/nomzy/reply/${replyId}`, {
        content :  newContent,
        nickname
      }, {
      headers : {
        // Authorization: `Bearer ${localStorage.getItem("accessToken")}`
      }
    });

      alert("댓글이 수정되었습니다.");
      loadRepliesWithPagination(reviewId, 1);

    } catch (error) {
      console.error("수정 오류", error);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
}

// 댓글 삭제
async function deleteReply(replyId, reviewId) {

  if (!confirm("정말 삭제하시겠습니까?"))
    return;
  const nickname = localStorage.getItem("nickname") || "GUEST";
  
    try {
      await axios.delete(`http://192.168.0.110:8080/nomzy/reply/${replyId}`, {
        data : { nickname },
        headers : {
        // Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      loadRepliesWithPagination(reviewId, 1);

    } catch (error) {
      console.error("삭제 오류 : ",error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    }
}


// 좋아요 토글 더미 + 서버 기능
async function toggleLike(reviewId) {
  const nickname = localStorage.getItem("nickname") || "GUEST";
  const review = currentReviews.find(r => r.id === reviewId);
  if (!review) return;

    try {
      const response = await axios.post(`http://192.168.0.110:8080/nomzy/review/${reviewId}/like`, {
        nickname : nickname
      }, {
        headers : {
          "Content-Type" : "application:json",
          // Authorization : `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      const updated = response.data;
      review.likes = updated.likes;
      review.dislikes = updated.dislikes;
      review.userLiked = updated.userLiked;
      review.userDisliked = updated.userDisliked;

      renderReviews(currentReviews);
      
    } catch (error) {
      console.error("좋아요 오류:", error);
      alert("좋아요 처리 중 문제가 발생했습니다.");
  }
}

// 싫어요 토글 더미 +서버 기능
async function toggleDislike(reviewId) {
  const nickname = localStorage.getItem("nickname") || "GUEST";
  const review = currentReviews.find(r => r.id === reviewId);
  if (!review) return;

  if (useDummyData) {
    if (review.userDisliked) {
      review.userDisliked = false;
      review.dislikes = (review.dislikes || 0) - 1;
    } else {
      review.userDisliked = true;
      review.dislikes = (review.dislikes || 0) + 1;
      if (review.userLiked) {
        review.userLiked = false;
        review.likes = (review.likes || 0) - 1;
      }
    }
    renderReviews(currentReviews);
  } else {
    try {
      const response = await axios.post(`http://192.168.0.110:8080/nomzy/review/${reviewId}/dislike`, {
        nickname
      });
      const updated = response.data;
      review.likes = updated.likes;
      review.dislikes = updated.dislikes;
      review.userLiked = updated.userLiked;
      review.userDisliked = updated.userDisliked;

      renderReviews(currentReviews);
    } catch (error) {
      console.error("싫어요 오류:", error);
      alert("싫어요 처리 중 문제가 발생했습니다.");
    }
  }
}

// 리뷰 수정 기능
async function editReview(reviewId) {
  const review = currentReviews.find(r => r.id === reviewId);
  if (!review)
    return;

  localStorage.setItem("editMode", "true");
  localStorage.setItem("editReviewId", reviewId);
  localStorage.setItem("editReviewData", JSON.stringify(review));

  window.location.href = "/feature-cerationReview/cerationreviewPage.html";
}


// 리뷰 삭제 기능
async function deleteReview(reviewId) {

  if (!confirm("정말 이 리뷰를 삭제하시겠습니까?"))
    return;

    const nickname = localStorage.getItem("nickname") || "GUEST";

    try {
      await axios.delete(`http://192.168.0.110:8080/nomzy/review/${reviewId}`,{
        data : { nickname },
        headers : {
        // Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      });

      currentReviews = currentReviews.filter(r => r.id !== reviewId);
      renderReviews(currentReviews);
      
    } catch(error) {
      console.error("리뷰 삭제 오류 : ", error);
      alert("리뷰 삭제 중 오류가 발생했습니다.");
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

  const nickname = localStorage.getItem("nickname") || "GUEST";

  try {
    const response = await axios.post("http://192.168.0.110:8080/nomzy/reply", {
        reviewId,
        nickname,
        content
      }, {
        headers : {
          "Content-Type" : "application:json",
        // Authorization: `Bearer ${localStorage.getItem("accessToken")}`
        }
      })

    if (response.status >= 200 && response.status < 300) {
      console.log("댓글 등록 성공:", response.data);
    } else {
      console.warn("댓글 등록 응답 이상:", response.status);
    }

    await loadRepliesWithPagination(reviewId, 1);
    input.value = "";

  } catch (error) {
    console.error("답글 등록 오류:", error);
    alert("답글 등록 중 오류가 발생했습니다.");
  }
}


// 페이지 네이션
function renderPagination(currentPage, pageSize, totalItems) {

  const container = document.getElementById("paginationContainer");
  if (!container)
    return;
  container.innerHTML = "";

  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1)
    return;

  let startPage = Math.max(1, currentPage - 4);
  let endPage = startPage + 9;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - 9);
  }

  for (let i=startPage; i<=endPage; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => {
      const urlParams = new URLSearchParams(window.location.search);
      urlParams.set("page", i);
      history.pushState(null, '', `?${urlParams.toString()}`);
      fetchReviewsFromDB(restaurantId, i);
    });
    container.appendChild(btn);
  }
}


function applyMoreToggle(selector) {
  document.querySelectorAll(selector).forEach(content => {
    const lineHeight = parseInt(getComputedStyle(content).lineHeight);
    const maxVisibleLines = 5;
    if (content.scrollHeight / lineHeight > maxVisibleLines) {
      const button = document.createElement("button");
      button.textContent = "더보기";
      button.className = "more-button";
      button.addEventListener("click", () => {
        content.classList.toggle("expanded");
        button.textContent = content.classList.contains("expanded") ? "접기" : "더보기";
      });
      content.parentElement.appendChild(button);
    }
  })
}

// 리뷰 등록된 날자 계산함수
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date))
    return dateString;

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}