document.addEventListener("DOMContentLoaded", () => {
  const loadHTML = async (url, elementId) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${url} 불러오기 실패`);
      const html = await res.text();
      const el = document.getElementById(elementId);
      if (el) el.innerHTML = html;
      return el;
    } catch (err) {
      console.error(err);
    }
  };

  // 사용자 정보
  let user = {
    nickname: "홍민기",
  };
  // let user = null;

  // 헤더 불러온 뒤 로그인 UI 설정
  loadHTML("/templates/includes/header.html", "app-header").then(() => {
    const loginBtn = document.getElementById("login-button");
    const logoutBtn = document.getElementById("logout-button");

    function loginAutoUi() {
      if (user) {
        loginBtn.innerHTML = `<p class="text-xs">${user.nickname}님</p>`;
        logoutBtn.classList.remove("hidden");
      } else {
        loginBtn.innerHTML = `
          <a href="/login.html" class="text-xs hover:text-gray-400">로그인</a>
          <span class="text-xs">|</span>
          <a href="/signup" class="text-xs hover:text-gray-400">회원가입</a>
        `;
        logoutBtn.classList.add("hidden");
      }
    }

    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      user = null;
      loginAutoUi();
    });

    loginAutoUi();
  });

  // 푸터는 따로 이벤트 없으면 그냥 불러오기만 해도 됨
  loadHTML("/templates/includes/footer.html", "app-footer");
});
