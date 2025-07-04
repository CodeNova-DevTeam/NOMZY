document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const keyword = params.get("keyword");

  if (!keyword) {
    alert("검색어가 없습니다.");
    return;
  }

  const nickname = localStorage.getItem("nickname") || "GUEST"; // 추후 로그용

  fetch(`http://localhost:8082/api/search?keyword=${encodeURIComponent(keyword)}&nickname=${nickname}`)
    .then(res => res.json())
    .then(data => {
      renderSearchResults(data);
    })
    .catch(err => {
      console.error("검색 오류:", err);
    });
});

function renderSearchResults(results) {
  const container = document.getElementById("resultContainer");
  container.innerHTML = "";

  if (results.length === 0) {
    container.innerHTML = "<p>검색 결과가 없습니다.</p>";
    return;
  }

  results.forEach(item => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <h3>${item.title}</h3>
      <p>지역: ${item.regionName}</p>
      <p>메뉴: ${item.menuNames}</p>
      <p>태그: ${item.tagNames}</p>
    `;
    container.appendChild(div);
  });
}