document.addEventListener("DOMContentLoaded", async () => {
const reviewId = getReviewIdFromURL();
if (!reviewId) {
    alert("잘못된 접근입니다.");
}

await loadReviewDetail(reviewId); // 리뷰 상세 정보 로드
await loadReplies(reviewId); // 댓글 목록 로드

// 각 버튼에 이벤트 핸들러 연결

document.getElementById("replySubmit").addEventListener("click", () => submitReply(reviewId));
document.getElementById("likeBtn").addEventListener("click", () => toggleReaction(reviewId, "like"));
document.getElementById("dislikeBtn").addEventListener("click", () => toggleReaction(reviewId, "dislike"));
document.getElementById("reportBtn").addEventListener("click", () => alert("신고가 접수되었습니다."));
document.getElementById("editBtn").addEventListener("click", () => editReview(reviewId));
document.getElementById("deleteBtn").addEventListener("click", () => deleteReivew(reviewId));
}); // DOM트리 end

// URL에서 reivewId 값을 추출하는 함수
function getReviewIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("reviewId");
}

// 리뷰 상세 데이터를 서버에서 불러와서 화면에 출력
async function loadReviewDetail(reviewId) {
    try {
        const response = await axios.get(`http://192.168.0.110:8080/nomzy/review/${reviewId}`);
        const review = response.data;
        const myNickname = localStorage.getItem("nickname");

        document.getElementById("reviewTitle").textContent = review.reviewTitle;
        document.getElementById("storeName").textContent = review.title;
        document.getElementById("category").textContent = review.category;
        document.getElementById("region").textContent = review.region;
        document.getElementById("rating").textContent = `⭐ ${review.rating}`;
        document.getElementById("nickname").textContent = review.nickname;
        document.getElementById("date").textContent = fomatDate(review.createdAt);
        document.getElementById("reviewContent").textContent = review.content;
    
        // 이미지가 있으면 표시
        if (review.imageUrl) {
            const imageDiv = document.getElementById("reviewImage");
            const img = imageDiv.querySelector("img");
            img.src = review.imageUrl;
            imageDiv.style.display = "block";
        }

        // 좋아요/싫어요 수 업데이트
        document.getElementById("likeBtn").innerHTML = `👍 ${review.likes || 0}`;
        document.getElementById("dislikeBtn").innerHTML = `👎 ${review.dislikes || 0}`
   
        // 본인 리뷰일 경우 수정/삭제 버튼 표시
        if (myNickname === review.nickname) {
            document.getElementById("ownerButtons").style.display = "block";
        }
    } catch(error) {
        console.error("리뷰 상세 불러오기 실패 : ", error);
        alert("리뷰를 불러오는 데 실패했습니다.");
    }
}

// 좋아요/싫어요 토글 처리
async function toggleReaction(reviewId, type) {
    try {
        const nickname = localStorage.getItem("nickname");
        const response = await axios.post(`http://192.168.0.110:8080/nomzy/review/${reviewId}/${type}`, {
            nickname
        });

        const updated = response.data;
        document.getElementById("likeBtn").innerHTML = `👍 ${updated.likes}`;
        document.getElementById("dislikeBtn").innerHTML = `👎 ${updated.dislikes}`
    } catch(error) {
        console.error("리액션 실패 : ", error);
        alert("처리 중 오류가 발생했습니다.");
    }
}

// 댓글 목록을 불러오는 함수
async function loadReplies(reviewId) {
    try {
        const response = await axios.get("http://192.168.0.110:8080/nomzy/reply", {
            params : { reviewId }
        });
        const replies = response.data.replies;
        const list = document.getElementById("replyList");
        list.innerHTML = "";

        const myNickname = localStorage.getItem("nickname");

        replies.forEach(reply => {
            const div = document.createElement("div");
            div.className = "reply-item";
            div.innerHTML = `
                <strong>${reply.nickname}</strong>
                <p>${reply.content}</p>
                ${reply.modified ? '<span>(수정됨)</span>' : ''}
                ${reply.nickname === myNickname
                    ?`<button onclick="editReply(${reply.id}, ${reviewId})">✏️</button>
                    <button onclick="deleteReply(${reply.id}, ${reviewId})">🗑</button>`
                    : ""
                }
            `;
            list.appendChild(div);
        });
    } catch(error) {
        console.error("댓글 불러오기 실패 : ", error);
    }
}

// 댓글을 등록하는 함수
async function submitReply(reviewId){
    const input = document.getElementById("replyInput");
    const content = input.value.trim();
    const nickname = localStorage.getItem("nickname");

    if (!content) {
        alert("댓글 내용을 입력해주세요.");
        return;
    }

    try {
        await axios.post("http://192.168.0.110:8080/nomzy/reply", {
            reviewId,
            nickname,
            content
        });
        input.value = "";
        await loadReplies(reviewId);
    } catch(error) {
        console.error("댓글 등록 실패 : ", error);
        alert("댓글 등록 중 문제가 발생했습니다.");
    }
}

// 댓글 수정 요청 함수
async function editReply(replyId, reviewId) {
    const newContent = propmt("수정할 댓글 내용을 입력하세요 : ");
    if (!newContent)
        return;

    const nickname = localStorage.getItem("nickname");
    try {
        await axios.put(`http://192.168.0.110:8080/nomzy/reply/${replyId}`, {
            content : newContent,
            nickname
        });
        await loadReplies(reviewId);
    } catch(error) {
        console.error("댓글 수정 실패 : ", error);
    }
}

// 댓글 삭제 요청 함수
async function deleteReply(replyId, reviewId) {
    const confirmDelete = confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete)
        return;

    const nickname = localStorage.getItem("nickname");
    try {
        await axios.delete(`http://192.168.0.110:8080/nomzy/reply/${replyId}`, {
            data : { nickname }
        })
        await loadReplies(reviewId);
    } catch(error) {
        console.error("댓글 삭제 실패 : ", error)
    }
}
