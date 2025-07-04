// 리뷰 페이지 js 전체 리팩터링 (JWT 인증 포함, 더미 & 서버 연동 분기 + 페이지네이션 지원)
const useDummyData = true;
// true일 때 로그인 없이 테스트 가능 ( 더미데이터 사용 )
// false 로 바구면 실제 서버로 테스트 
let currentReviews = [];
// 현재 화면에 출력할 리뷰들을 담는 전역 변수
// 페이지 이동, 정렬, 검색 등에서 계속 재사용
if (!useDummyData && localStorage.getItem("isLoggedIn") !== "true") {
  alert("로그인 후 리뷰 페이지를 이용하실 수 있습니다.");
  window.location.href = "/feature-login/login.html";
  // useDummyData 가 false일때 로그인 후 이용할 수 있게 로그인 페이지로 강제이동
}

// 추후 JWT토큰으로 로그인시 주석해제
// const token = localStorage.getItem("accessToken");
// if (!token) {
//   alert("토큰 없음. 로그인 필요");
//   return;
// }


document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  // 현재 페이지 URL의 파라미터(예 : ?id=2%page=3)를 파싱
  // restaurantId 와 page 를 추출하기 위해 사용
  const restaurantId = urlParams.get("id") || 1;
  // URL에서 id값을 받아서 restaurantIddp 저장 없을경우 기본값은 1번 가게
  const page = parseInt(urlParams.get("page")) || 1;
  // page 번호를 받아서 정수로 바꾼 후 page에 저장 기본값은 1페이지
  fetchReviewsFromDB(restaurantId, page);
  //위에서 뽑은 restaurantId, page를 바탕으로 해당 가게의 리뷰를 불러옴

  document.getElementById("sort-by").addEventListener("change", () => {
    // document.getElementById("sort-by") = HTML 에서 id가 "sort-by"인 요소를 찾음
    // .addEventListener("change", () => { ... } = "sort-by" 드롭다운의 값이 변경(chacge) 되었을 때 실행할 함수를 등록함
    const sorted = applyReviewSort(currentReviews, document.getElementById("sort-by").value);
    /* applyReviewSort(currentReviews, 정렬기준) = 현재 화면에 보여지고 있던 리뷰들(currentReviews)을
                                                ㄴ 선택된 정렬 기준에 따라 정렬
                                                ㄴ 정렬함수 applyReviewsSort()는 내부적으로 .sort()를 이용하여
                                                   기준에 따라 재배열된 새 배열을 반환 */
    // document.getElementById("sort-by").value = 현재 선택된 <option> 의 value 값을 가져옴
    // 예 : 사용자가 "별점 높은 순"을 선택하면 value = "rating_desc"가 됌
    renderReviews(sorted);
    // 새로 정렬 된 리뷰 배열을 받아서 실제 리뷰 UI 화면에 다시 그려주는 함수.
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

function applyReviewSort(reviews, sortType = "default") {
  return [...reviews].sort((a, b) => {
    switch (sortType) {
      case "rating_desc":
        return b.rating - a.rating || a.nickname.localeCompare(b.nickname);
      case "recent_desc":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "favorite_first":
        return (b.favoriteCount || 0) - (a.favoriteCount || 0) || a.nickname.localeCompare(b.nickname);
      case "review_desc":
        return (b.reviewCount || 0) - (a.reviewCount || 0) || a.nickname.localeCompare(b.nickname);
      case "view_desc":
        return (b.viewCount || 0) - (a.viewCount || 0) || a.nickname.localeCompare(b.nickname);
      case "nickname_asc":
        return a.nickname.localeCompare(b.nickname);
      case "default":
      default:
        return (
          b.rating - a.rating ||                      // 별점 높은 순
          (b.favoriteCount || 0) - (a.favoriteCount || 0) ||  // 즐찾 수
          (b.reviewCount || 0) - (a.reviewCount || 0) ||      // 리뷰 수
          a.nickname.localeCompare(b.nickname)        // 닉네임 가나다
        );
    }
  });
}


// 리뷰 불러오기 
async function fetchReviewsFromDB(restaurantId, page = 1, pageSize = 10) {
  
  try {
    let reviews = [];
    let total = 0;

    if (useDummyData) {
      const allDummy = Array.from({ length: 23 }, (_, i) => ({
        id: i + 1,
        nickname: `유저${i + 1}`,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        reviewTitle : `맛있어요 ${i + 1}`,
        content: `더미 리뷰 내용 ${i + 1}`,
        imageUrl: "https://via.placeholder.com/300x200.png?text=리뷰이미지",
        createdAt: `2024-06-${String((i % 30) + 1).padStart(2, '0')}`,
        title: `김밥천국 ${i + 1}`,
        region: i % 2 === 0 ? "강남동" : "원종동",
        category: i % 2 === 0 ? "분식" : "햄버거",
        hashtags: ["가성비", "혼밥", "깔끔함"].slice(0, (i % 3) + 1),
        viewCount: Math.floor(Math.random() * 500)
      }));
      total = allDummy.length;
      reviews = allDummy.slice((page - 1) * pageSize, page * pageSize);
    } else {

      const url = new URL(`http://100.74.28.37:8082/api/review`);

      // url.searchParams.append("restaurantId", restaurantId);
      url.searchParams.append("page", page);
      url.searchParams.append("size", pageSize);

      const response = await axios.get(url.toString());
      const data = response.data;
      reviews = data.reviews;
      total = data.total;
    }
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

    if (useDummyData) {
      const allDummy = Array.from({ length:23 }, (_, i) => ({
        id: i + 1,
        nickname: `유저${i + 1}`,
        rating: parseFloat((Math.random() * 2 + 3).toFixed(1)),
        title: `가게이름 ${i + 1}`,
        reviewTitle : `리뷰제목 ${i + 1}`,
        content: `치킨 맛집 추천 ${i + 1}`,
        likes: Math.floor(Math.random() * 10),
        dislikes: Math.floor(Math.random() * 5),
        createdAt: `2024-06-${String((i % 30) + 1).padStart(2, '0')}`
        }));

      filtered = allDummy.filter(r => {
        if (type === "reviewTitle") return r.reviewTitle.includes(keyword);
        if (type === "reviewTitle+content") return r.reviewTitle.includes(keyword) || r.content.includes(keyword);
        if (type === "title") return r.title.includes(keyword);
        if (type === "nickname") return r.nickname.includes(keyword);
        if (type === "title+nickname") return r.title.includes(keyword) || r.nickname.includes(keyword);
        if (type === "title+reviewTitle") return r.title.includes(keyword) || r.reviewTitle.includes(keyword);
        if (type === "region") return r.region?.includes(keyword);
        if (type === "category") return r.category?.includes(keyword);
        return r.reviewTitle.includes(keyword) || r.content.includes(keyword);
      });

      currentReviews = filtered;
      total = filtered.length;

      const sorted = applyReviewSort(currentReviews, document.getElementById("sort-by").value);
      renderReviews(sorted);
      renderPagination(1, 10, total);
    } else {
      try {
        const response = await axios.get("http://100.74.28.37:8082/api/review/search", {
        params : {
          keyword : keyword,
          type : type      
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
    const titleHtml = review.reviewTitle ? `<div class="review-title">${review.reviewTitle}</div>` : "";

    div.innerHTML = `
      <div class="review-header">
        <strong>${review.nickname}</strong>
        <span class="rating">${renderStars(review.rating)} (${review.rating}) ${modifiedText}</span>
      </div>

      ${titleHtml}

      <div class="review-meta">
        <span class="store-info">${review.title || '가게명'}</span> /
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
    
    if (useDummyData) {
      const dummyAll = Array.from({ length : 50 }, (_, i) => ({
        id : i + 1,
        reviewId : ( i % 5 ) + 1,
        nickname : `유저${ i + 1 }`,
        content : `대댓글 내용 ${ i + 1 }`,
        modified : i % 4 === 0,
        createdAt : `2024-${String(( i % 30) + 1 ).padStart(2, '0')}`
      }));

      const filtered = dummyAll.filter(r => r.reviewId === reviewId);
      replies = filtered.slice(( page - 1 ) * size, page * size);
      total = filtered.length;
    } else {
      const response = await axios.get("http://100.74.28.37:8082/api/reply", {
        params : {
          reviewId : reviewId,
          page : page,
          size : size
        }
      });
      const data = response.data;
      replies = data.replies;
      total = data.total;
    }

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

  if (useDummyData) {
    loadRepliesWithPagination(reviewId, 1);
  } else {
    try {
      await axios.put(`http://100.74.28.37:8082/api/reply/${replyId}`, {
        content :  newContent,
        nickname
      });
      alert("댓글이 수정되었습니다.");
      loadRepliesWithPagination(reviewId, 1);
    } catch (error) {
      console.error("수정 오류", error);
    }
  }
}

// 댓글 삭제
async function deleteReply(replyId, reviewId) {

  if (!confirm("정말 삭제하시겠습니까?"))
    return;
  const nickname = localStorage.getItem("nickname") || "GUEST";
  
  if (useDummyData) {

  } else {
    try {
      await axios.delete(`http://100.74.28.37:8082/api/reply/${replyId}`, {
        data : { nickname }
      });
      loadRepliesWithPagination(reviewId, 1);
    } catch (error) {
      console.error("삭제 오류 : ",error);
    }
  }
}


// 좋아요 토글 더미 + 서버 기능
async function toggleLike(reviewId) {
  const nickname = localStorage.getItem("nickname") || "GUEST";
  const review = currentReviews.find(r => r.id === reviewId);
  if (!review) return;

  if (useDummyData) {
    if (review.userLiked) {
      review.userLiked = false;
      review.likes = (review.likes || 0) - 1;
    } else {
      review.userLiked = true;
      review.likes = (review.likes || 0) + 1;
      if (review.userDisliked) {
        review.userDisliked = false;
        review.dislikes = (review.dislikes || 0) - 1;
      }
    }
    renderReviews(currentReviews);
  } else {
    try {
      const response = await axios.post(`http://100.74.28.37:8082/api/review/${reviewId}/like`, {
        nickname : nickname
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
      const response = await axios.post(`http://100.74.28.37:8082/api/review/${reviewId}/dislike`, {
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

  const newContent = prompt("리뷰를 수정하세요 : ", review.content);
  if (newContent === null || newContent.trim() === "")
    return; 
  
  if (useDummyData) {
    review.content = newContent;
    review.modified = true;
    renderReviews(currentReviews);
  } else {
    const nickname = localStorage.getItem("nickname") || "GUEST";

    try {
      const response = await axios.put(`http://100.74.28.37:8082/api/review/${reviewId}`, {
      content : newContent, nickname 
    });

    const data = response.data;
    review.content = data.content;
    review.modified = data.modified;
    renderReviews(currentReviews);

    } catch(error) {
      console.error("리뷰 수정 오류 : ", error);

    }
  }
}


// 리뷰 삭제 기능
async function deleteReview(reviewId) {

  if (!confirm("정말 이 리뷰를 삭제하시겠습니까?"))
    return;

  if (useDummyData) {
    currentReviews = currentReviews.filter(r => r.id !== reviewId);
    renderReviews(currentReviews);
  } else {
    const nickname = localStorage.getItem("nickname") || "GUEST";

    try {
      await axios.delete(`http://100.74.28.37:8082/api/review/${reviewId}`);
      currentReviews = currentReviews.filter(r => r.id !== reviewId);
      renderReviews(currentReviews);
    } catch(error) {
      console.error("리뷰 삭제 오류 : ", error);
    }
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
    const response = await axios.post("http://100.74.28.37:8082/api/reply", {
        reviewId,
        nickname,
        content
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
      fetchReviewsFromDB(1, i);
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