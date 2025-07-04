const isLoggedIn = localStorage.getItem("isLoggedIn");
const nickname = localStorage.getItem("nickname");
if (isLoggedIn !== "true" || !nickname){
  alert("로그인이 필요합니다.");
  window.location.href = "/feature-login/login.html";
}

const imageInput = document.getElementById("image");
const imagePreviewContainer  = document.getElementById("imagePreviewContainer");

const starRatingElement = document.getElementById("starRating");
const ratingInput = document.getElementById("rating");
const ratingDisplay = document.getElementById("ratingDisplay");
const stars = starRatingElement.querySelectorAll("span");

const dropZone = document.getElementById("dropZone");

const restaurantId = getQueryParam("restaurantId");
const region = getQueryParam("region");
const restaurant = getQueryParam("restaurant");
const category = getQueryParam("category");

const deletedImageUrls = []; // 삭제할 기존 이미지 목록

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const ratingError = document.getElementById("ratingError");
const titleError = document.getElementById("titleError");
const submitButton = document.getElementById("submitButton");

let isFormDirty = false;
let selectedRating = 0;

function getQueryParam(param) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param);
}
// 입력필드 유효성검사
function validateFormInputs() {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const rating = document.getElementById("rating").value;

    let isValid = true;

    if (title.length < 2) {
        titleError.textContent = "제목은 2자 이상 입력해주세요.";
        isValid = false;
    } else if (title.length > 30) {
        titleError.textContent = "제목은 최대 30자까지 가능합니다";
        isValid = false;
    } else {
        titleError.textContent = "";
    }

    if (content.length < 5) {
        contentError.textContent = "내용은 5자 이상 입력해주세요.";
        isValid = false;
    } else if (content.length > 500) {
        contentError.textContent = "내용은 최대 500자까지 가능합니다.";
        isValid = false;
    } else {
        contentError.textContent = "";
    }

    if (!rating || parseInt(rating) === 0) {
        ratingError.textContent = "별점을 선택해주세요.";
        isValid = false;
    } else {
        ratingError.textContent = "";
    }
    submitButton.disabled = !isValid;
}

const bindInputWithValidation = (id) => {
    const element = document.getElementById(id);
    if (!element)
        return;
    element.addEventListener("input", () => {
        isFormDirty = true;
        validateFormInputs();
    });
};

const bindClickWithValidation = (id) => {
    const element = document.getElementById(id);
    if (!element)
        return;
    element.addEventListener("click", () => {
        isFormDirty = true;
        validateFormInputs();
    });
};


const isEdit = localStorage.getItem("editMode") === "true";
if (isEdit) {
    const reviewData = JSON.parse(localStorage.getItem("editReviewData") || "{}")

    document.getElementById("restaurantId").value = reviewData.restaurantId;
    document.getElementById("region").value = reviewData.region;
    document.getElementById("restaurant").value = reviewData.title;
    document.getElementById("category").value = reviewData.category;
    document.getElementById("title").value = reviewData.reviewTitle;
    document.getElementById("content").value = reviewData.content;
    document.getElementById("rating").value = reviewData.rating;

    document.getElementById("ratingDisplay").textContent = `선택한 별점 : ${reviewData.rating}점`;
    updateStarUI(reviewData.rating);

    document.getElementById("targetRestaurantName").textContent = reviewData.title;
    document.getElementById("targetRegionCategory").textContent = `${reviewData.region} / ${reviewData.category}`;

    if (Array.isArray(reviewData.imageUrl)) {
        reviewData.imageUrls.forEach((url) => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("existing-image-wrapper");
            wrapper.style.position = "relative";
            wrapper.style.display = "inline-block";
            wrapper.style.marginRight = "10px";

            const img = document.createElement("img");
            img.src = url;
            img.alt = "기존 리뷰 이미지";
            img.style.maxWidth = "100px";
            img.style.borderRadius = "8px";
            img.style.objectFit = "cover";

            const deleteButton = document.createElement("button");
            deleteButton.textContent = "❌";
            deleteButton.classList.add("delete-existing-image");
            deleteButton.setAttribute("data-url", url);
            deleteButton.style.position = "absolute";
            deleteButton.style.top = "2px";
            deleteButton.style.right = "2px";
            deleteButton.style.background = "rgba(0,0,0,0,5)";
            deleteButton.style.color = "white";
            deleteButton.style.border = "none";
            deleteButton.style.borderRadius = "50%";
            deleteButton.style.cursor = "pointer";

            deleteButton.addEventListener("click", () => {
                deletedImageUrls.push(url);
                wrapper.remove();
            });
            wrapper.appendChild(img);
            wrapper.appendChild(deleteButton);
            imagePreviewContainer.appendChild(wrapper);
        });
    }
}


if (!restaurantId || !region || !restaurant || !category) {
    window.history.back();
} else {
    document.getElementById("restaurantId").value = restaurantId;
    document.getElementById("region").value = region;
    document.getElementById("restaurant").value = restaurant;
    document.getElementById("category").value = category;
    // 가게 정보 시각화 영역에 표시
    document.getElementById("reviewTargetFullInfo").textContent = `${restaurant} (${region} / ${category})`;
}

imageInput.addEventListener("change", () => {
    const files = Array.from(imageInput.files);
    if (files.length > 4) {
        alert("이미지는 최대 4장까지만 업로드 가능합니다.")
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
        return;
    }
    imagePreviewContainer.innerHTML = "";

    files.forEach((file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.onload = function (e) {
                const img = document.createElement("img");
                img.src = e.target.result;
                img.alt = "미리보기 이미지";
                img.style.maxWidth = "100px";
                img.style.borderRadius = "8px";
                img.style.objectFit = "cover";
                imagePreviewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});


// 드래그 진입 시 스타일 변경
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#00aaff";
    dropZone.style.backgroundColor = "#f0faff";
});
// 드래그 이탈 시 스타일 복원
dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#ccc";
    dropZone.style.backgroundColor = "#fff";
});

// 파일이 drop 되었을 때 처리
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#ccc";
    dropZone.style.backgroundColor = "#fff";
    
    const files = Array.from(e.dataTransfer.files);

    if (files.length > 4) {
        alert("이미지는 최대 4장까지만 업로드 가능합니다.");
        imageInput.value = "";
        imagePreviewContainer.innerHTML = "";
        return;
    }

    const dataTransfer = new DataTransfer();
    files.forEach((file) => dataTransfer.items.add(file));
    imageInput.files = dataTransfer.files;

    imagePreviewContainer.innerHTML = "";

    files.forEach((file) => {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = function (event) {
                const img = document.createElement("img");
                img.src = event.target.result;
                img.alt = "미리보기 이미지";
                img.style.maxWidth = "100px";
                img.style.borderRadius = "8px";
                img.style.objectFit = "cover";
                imagePreviewContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });
});

stars.forEach((star) => {
    star.addEventListener("click", () => {
        const score = parseInt(star.getAttribute("data-score"));
        ratingInput.value = score;
        ratingDisplay.textContent = `선택한 별점 : ${score}점`;
        updateStarUI(score);
    })
});

function updateStarUI(score) {
    stars.forEach((star, index) => {
        if (index < score) {
            star.textContent = "★";
            star.style.color = "#ffc107";
        } else {
            star.textContent = "☆";
        } 
    });
}

async function submitReview(event){
    event.preventDefault();

    const formData = new FormData();
    formData.append("restaurantId", document.getElementById("restaurantId").value);
    formData.append("region", document.getElementById("region").value);
    formData.append("title", document.getElementById("title").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("rating", document.getElementById("rating").value);
    formData.append("reviewTitle", document.getElementById("reviewTitle").value);
    formData.append("content", document.getElementById("content").value);

    const imageFile = document.getElementById("image").files;
    for (let i=0; i<imageFile.length; i++) {
        formData.append("images", imageFile[i]);
    }
    
    const isEdit = localStorage.getItem("editMode") === "true";
    const reviewId = localStorage.getItem("editReviewId");
    try {
        let response;
        if (isEdit) {
            formData.append("deleteImageUrls", JSON.stringify(deletedImageUrls));

            response = await axios.put(`http://192.168.0.110:8080/nomzy/review/${reviewId}`, formData, {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }
            });
        } else {
            response = await axios.post("http://192.168.0.110:8080/nomzy/cerationReview/", formData, {
                headers : {
                    "Content-Type" : "multipart/form-data"
                }
            });
        }
        if (response.data) {
            alert(isEdit ? "리뷰 수정 완료" : "리뷰 등록 완료");
            localStorage.removeItem("editMode");
            localStorage.removeItem("editReviewId");
            localStorage.removeItem("editReviewData");

            window.location.href = "/feature-reviewPage/review.html";
        } else {
            throw new Error("요청 실패");
        }
    } catch(error) {
        console.error("서버 오류", error.message);
    }
}
bindInputWithValidation("title");
bindInputWithValidation("content");
bindInputWithValidation("image");
bindClickWithValidation("starRating");

document.addEventListener("DOMContentLoaded", validateFormInputs);

window.addEventListener("beforeunload", (e) => {
    if (isFormDirty) {
        e.preventDefault();
        e.returnValue = "";
    }
});

document.getElementById("reviewForm").addEventListener("submit", () => {
    isFormDirty = false;
})