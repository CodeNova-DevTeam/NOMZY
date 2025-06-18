// if (localStorage.getItem("isLoggedIn") !== "true"){
//     alert("로그인이 필요합니다람쥐.");
//     window.location.href = "/feature-login/login.html";
// }

const seoulDongs = [
  "강남구", "강동구", "강북구", "강서구", "관악구", "광진구",
  "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구",
  "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구",
  "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"
];

const regionSelect = document.getElementById("region");
seoulDongs.forEach((dong) => {
 const option = document.createElement("option");
 option.value = dong;
 option.textContent = dong;
 regionSelect.appendChild(option);
});

async function submitReview(event){
    event.preventDefault();

    const formData = new FormData();
    formData.append("region", document.getElementById("region").value);
    formData.append("restaurant", document.getElementById("restaurant").value);
    formData.append("category", document.getElementById("category").value);
    formData.append("rating", document.getElementById("rating").value);
    formData.append("title", document.getElementById("title").value);
    formData.append("content", document.getElementById("content").value);

    const imageFile = document.getElementById("image").files[0];
    if(imageFile){
        formData.append("image",imageFile);
    };
    const cerationReview = "http://100.74.28.37:8081/api/cerationReview/";
    try {
        const response = await fetch(cerationReview, {
            method : "POST",
            body : formData
        });

        if (response.ok){
            alert("리뷰 등록 성공");
            window.location.href = "/feature-#/#.html";
        } else {
            throw new Error("리뷰 등록 실패");
        }
    } catch (error) {
        console.error("서버 오류"+ error.message);
    }
    return false;
}