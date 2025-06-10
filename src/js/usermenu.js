function toggleDropdown() {
  const dropdown = document.getElementById("dropdownMenu");
  dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
}

// 바깥 클릭 시 드롭다운 닫기
document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("dropdownMenu");
  const trigger = document.querySelector(".user-name-button");

  if (dropdown && !dropdown.contains(event.target) && !trigger.contains(event.target)) {
    dropdown.style.display = "none";
  }
});
