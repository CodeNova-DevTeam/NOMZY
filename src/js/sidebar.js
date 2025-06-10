function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  sidebar.classList.toggle("-translate-x-full"); // 열기/닫기 애니메이션
  overlay.classList.toggle("hidden"); // 오버레이 켜고 끄기
}
