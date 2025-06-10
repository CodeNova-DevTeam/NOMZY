// function toggleSidebar() {
//   document.getElementById("sidebar").classList.add("active");
//   document.getElementById("sidebarOverlay").classList.add("active");
// }

// function closeSidebar() {
//   document.getElementById("sidebar").classList.remove("active");
//   document.getElementById("sidebarOverlay").classList.remove("active");
// }

// document.addEventListener("DOMContentLoaded", function () {
//   const scrollContainer = document.querySelector(".sidebar-main");

//   if (scrollContainer) {
//     scrollContainer.addEventListener(
//       "wheel",
//       function (e) {
//         e.preventDefault();
//         scrollContainer.scrollBy({
//           top: e.deltaY, // 사용자의 휠 이동량 그대로 사용
//           behavior: "smooth",
//         });
//       },
//       { passive: false }
//     );
//   }
// });

document.addEventListener("DOMContentLoaded", function () {
  const scrollContainer = document.querySelector(".sidebar-main");
  const itemHeight = document.querySelector(".menu-text")?.offsetHeight || 50;

  let isScrolling = false;
  let scrollQueue = 0;

  if (scrollContainer) {
    scrollContainer.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();

        const direction = e.deltaY > 0 ? 1 : -1;
        scrollQueue += direction;

        if (!isScrolling) {
          smoothScrollStep();
        }
      },
      { passive: false }
    );
  }

  function smoothScrollStep() {
    if (scrollQueue === 0) {
      isScrolling = false;
      return;
    }

    isScrolling = true;
    const direction = scrollQueue > 0 ? 1 : -1;
    scrollQueue -= direction;

    scrollContainer.scrollBy({
      top: direction * itemHeight,
      behavior: "smooth",
    });

    // 스크롤 애니메이션이 끝날 시간만큼 기다림 (0.3초 정도)
    setTimeout(() => {
      smoothScrollStep();
    }, 50);
  }
});

// document.addEventListener("keydown", (e) => {
//   if (e.key === "Escape") {
//     if (document.body.classList.contains("mega-menu-open")) {
//       hideAllMegaMenus();
//       if (megaMenuTriggers.length > 0) moveUnderline(megaMenuTriggers[0]);
//     }
//   }
// });


document.addEventListener('mousemove', function(e) {
  const windowWidth = window.innerWidth;
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (e.clientX > windowWidth * 0.95) {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
  }
});

// 사이드바 닫기 함수도 유지
function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('active');
  sidebarOverlay.classList.remove('active');
}
