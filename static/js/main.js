// 검색기능 관련 메인돔트리
const handleSearch = (event) => {

    event.preventDefault(); 

const searchInput = document.getElementById('searchInput');
    // 검색결과를 표시해줄
    const searchTerm = searchInput.value.trim();

    if(searchTerm === '') { // 검색창에 공백입력시 리턴 (알람은 따로 띄우지않음)
        alert("검색어입력해라"); // 임시로 알람 나중에삭제할것
        return;
    };

    /*
        encodeURIComponent = 안전하게 인코딩을 도와주는 함수
        검색어를 url에 안전하게 인코딩함
        encodeURLComponent() : URL에 사용될 수 없는 특수문자(공백,& , = , ?)를
        %?? 형태로 변환하여 URL이 올바르게 구성되도록 함
        ex) 치킨 추천 등의 검색어를 -> 치킨%20추천 등으로 공백을 변한시켜줌
    */
   const encodedSearchTerm = encodeURIComponent(searchTerm);

   // 검색한 데이터에 따라서 검색페이지로 이동
   window.location.href = `searchMain.html?q=${encodedSearchTerm}`;

}; // handleSearch() end




document.getElementById("loginBtn").addEventListener("click", () => {
        window.location.href = "login.html";
      });
      document.getElementById("signupBtn").addEventListener("click", () => {
        window.location.href = "joinMembership.html";
      });

      // async function checkLoginStatus() {
      //   try {
      //     const res = await fetch("http://100.74.28.37:8080/api/main", {
      //       method: "GET",
      //       credentials: "include", // 세션 유지 필수!
      //     });

      //     if (!res.ok) throw new Error("로그인 필요");

      //     const data = await res.json();
      //     const nickname = data.nickname;

      //     // 로그인 상태 → 닉네임 표시 + 로그인/회원가입 숨김
      //     document.getElementById("nicknameText").innerText = nickname;
      //     document.getElementById("nicknameBtn").style.display = "inline-block";
      //     document.getElementById("dropdownMenu").style.display = "block";

      //     document.getElementById("loginBtn").style.display = "none";
      //     document.getElementById("signupBtn").style.display = "none";
      //     document.getElementById("headerDash").style.display = "none";
      //   } catch (err) {
      //     // 비로그인 상태 → 닉네임/드롭다운 숨기고 로그인/회원가입만 보이기
      //     document.getElementById("nicknameBtn").style.display = "none";
      //     document.getElementById("dropdownMenu").style.display = "none";

      //     document.getElementById("loginBtn").style.display = "inline-block";
      //     document.getElementById("signupBtn").style.display = "inline-block";
      //     document.getElementById("headerDash").style.display = "inline-block";
      //   }
      // }

      window.addEventListener("DOMContentLoaded", checkLoginStatus);

      // 드롭다운 토글
      document.getElementById("nicknameBtn").addEventListener("click", function (e) {
        e.stopPropagation();
        const dropdown = document.getElementById("dropdownMenu");
        this.classList.toggle("active");
        dropdown.classList.toggle("show");
      });

      // 바깥 클릭 시 드롭다운 닫기
      document.addEventListener("click", function () {
        document.getElementById("dropdownMenu").classList.remove("show");
        document.getElementById("nicknameBtn").classList.remove("active");
      });

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


      
      function updateLogoutBtn() {
        const logoutBtn = document.getElementById("logoutBtn");
        // 로그인한 상태에서만 보여주기
        if (!isLoggedIn) return;
        logoutBtn.style.display = isLoggedIn ? "block" : "none";
      }

      document.addEventListener("mousemove", function (e) {
        // const windowWidth = window.innerWidth - document.documentElement.clientWidth;
        const sidebar = document.getElementById("sidebar");
        const sidebarOverlay = document.getElementById("sidebarOverlay");

        // if (e.clientX > windowWidth * 0.95) {
        //   sidebar.classList.add("active");
        //   sidebarOverlay.classList.add("active");
        //   document.body.style.overflow = "hidden";
        // }
        if (e.clientX > window.innerWidth * 0.95) {
          sidebar.classList.add("active");
          sidebarOverlay.classList.add("active");

          // 스크롤 막기 + 오른쪽 패딩 (스크롤바 자연스럽게)
          const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
          document.body.style.paddingRight = scrollBarWidth + "px";
          setTimeout(() => {
            document.body.style.overflow = "hidden";
          }, 4); // 0~50ms 사이면 자연스러움

          updateLogoutBtn();
        }
      });

      document.addEventListener("DOMContentLoaded", updateLogoutBtn);

      // 오버레이 클릭 시 닫기 (*** 이게 있어야 닫힘)
      document.getElementById("sidebarOverlay").addEventListener("click", closeSidebar);

      // ESC키로 닫기
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeSidebar();
        }
      });

      // 사이드바 닫기 함수
      function closeSidebar() {
        const sidebar = document.getElementById("sidebar");
        const sidebarOverlay = document.getElementById("sidebarOverlay");
        sidebar.classList.remove("active");
        sidebarOverlay.classList.remove("active");

        // 1. overflow 먼저 해제
        document.body.style.overflow = "";
        // 2. 트랜지션 효과로 padding-right 해제 (딜레이와 맞춤)
        setTimeout(() => {
          document.body.style.paddingRight = "";
        }, 250); // CSS transition 시간과 맞춰줌(0.25s)
      }

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

      function updateClock() {
        const now = new Date();
        const hour = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const sec = String(now.getSeconds()).padStart(2, "0");
        document.getElementById("clock").textContent = `${hour}:${min}:${sec}`;
      }
      setInterval(updateClock, 1000);
      updateClock();

      // (실제 서비스에선 이 부분에서 fetch/AJAX 등으로 서버에서 정보 받아와야 함)
      // 예시 데이터: 현 사용자, 기타 접속자(정렬)
      const currentUser = "홍민기";
      let otherUsers = ["박성순", "최대한", "김현수"];

      // (현 사용자 제외하고 접속자 정렬, 닉네임 오름차순)
      otherUsers = otherUsers.filter((u) => u !== currentUser).sort();

      // 화면에 뿌리기
      document.getElementById("currentUser").textContent = "현 사용자 : " + currentUser;
      const userListElem = document.getElementById("userList");
      otherUsers.forEach(function (user) {
        const li = document.createElement("li");
        li.textContent = user;
        userListElem.appendChild(li);
      });

      // ★ 실제 서비스에서는 여기에 AJAX, WebSocket 등으로 실시간 정보 받아오고
      //   받아온 데이터로 위의 currentUser, otherUsers 갱신하면 됩니다!

      // 오늘의 상세 날씨 예시 데이터
      // 한국 요일 배열 (일~토)
      const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

      // 오늘 날짜/요일 구하기
      const todayObj = new Date();
      const todayY = todayObj.getFullYear();
      const todayM = String(todayObj.getMonth() + 1).padStart(2, "0");
      const todayD = String(todayObj.getDate()).padStart(2, "0");
      const todayDayIdx = todayObj.getDay();
      const todayDay = weekDays[todayDayIdx];

      // 오늘의 상세 날씨 예시 데이터
      const todayDetail = {
        date: `${todayY}-${todayM}-${todayD}`,
        day: todayDay,
        location: "서울",
        main: "흐림",
        temp: 21,
        humidity: 63,
        feel: 22,
        pop: 40, // 강수확률(%)
      };

      // 1주일 요일별 날씨 (예시) - 실제 연동 시 이 배열만 바꾸면 됨
      const weekWeather = [
        { day: "일", temp: 22, icon: "☀️", main: "맑음" },
        { day: "월", temp: 18, icon: "🌤️", main: "구름 많음" },
        { day: "화", temp: 20, icon: "⛅", main: "흐림" },
        { day: "수", temp: 17, icon: "🌦️", main: "비" },
        { day: "목", temp: 21, icon: "🌧️", main: "비" },
        { day: "금", temp: 19, icon: "☀️", main: "맑음" },
        { day: "토", temp: 20, icon: "⛅", main: "흐림" },
      ];

      // 오늘 상세 날씨 박스 내용 (요일 추가)
      document.getElementById("todayDetail").innerHTML = `
      <div class="weather-today-title">${todayDetail.date} (${todayDetail.day}) · ${todayDetail.location}</div>
      <div class="weather-today-info">
        오늘 날씨: ${todayDetail.main} / ${todayDetail.temp}°C
      </div>
      <div class="weather-today-etc">
        습도: ${todayDetail.humidity}%<br>
        체감: ${todayDetail.feel}°C<br>
        강수확률: ${todayDetail.pop}%
      </div>
    `;

      // 실시간 오늘 날씨 (간단)
      document.getElementById("weatherInfo").innerHTML = `
      <div class="weather-main">${todayDetail.main} ☁️</div>
      <div class="weather-temp">${todayDetail.temp}°C</div>
      <div class="weather-location">${todayDetail.location}</div>
    `;

      // 1주일(요일별) 날씨 리스트
      const weekListHtml = weekWeather
        .map((item, idx) => {
          // 오늘 요일과 같은 경우 강조
          const isToday = item.day === todayDay;
          return `
        <div class="weather-week-day${isToday ? " today" : ""}">
          <span>${item.day}</span>
          <span class="icon">${item.icon}</span>
          <span>${item.main}</span>
          <span class="weather-week-temp">${item.temp}°C</span>
        </div>
      `;
        })
        .join("");
      document.getElementById("weatherWeek").innerHTML = `
      <div class="weather-week-title">1주일 요일별 날씨</div>
      <div class="weather-week-list">
        ${weekListHtml}
      </div>
    `;

      /**
       * 실제 서비스에선
       *   1) 오늘 상세: fetch("/api/weather/today") → todayDetail에 값 대입
       *   2) 1주일 요일별: fetch("/api/weather/week") → weekWeather 배열에 값 대입
       * 하면 즉시 반영됩니다!
       */