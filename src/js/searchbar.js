// function handleSearch(event) {
//   event.preventDefault(); // 폼 기본 제출 막기
//   const input = document.getElementById("searchInput").value.trim();
//   if (input) {
//     alert(`'${input}'로 검색합니다!`);
//     // 실제 검색 기능을 여기에 추가하면 됩니다 (ex. 페이지 이동 등)
//   }
// }

const suggestionList = document.querySelector(".suggestion-list");
const items = document.querySelectorAll(".suggestion-item");

items.forEach((item) => {
  item.addEventListener("mouseenter", () => {
    suggestionList.classList.add("hovered");
  });
  item.addEventListener("mouseleave", () => {
    suggestionList.classList.remove("hovered");
  });
});
