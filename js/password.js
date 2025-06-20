// ✅ password.js (최종 완성본)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("passwordForm");
  const currentPasswordInput = document.getElementById("currentPassword");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const cancelBtn = document.getElementById("cancelPassword");

  const nickname = localStorage.getItem("nickname") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

  // 👁️ 비밀번호 보기 toggle
  const toggleIcons = document.querySelectorAll(".toggle-password");
  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = document.getElementById(icon.dataset.target);
      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "🙈";
      } else {
        input.type = "password";
        icon.textContent = "👁️";
      }
    });
  });
   // 🔧 입력 감지해서 버튼 활성화
  function toggleSubmitButton() {
    const newPw = newPasswordInput.value.trim();
    const confirmPw = confirmPasswordInput.value.trim();
    if (newPw && confirmPw) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }

  newPasswordInput.addEventListener("input", toggleSubmitButton);
  confirmPasswordInput.addEventListener("input", toggleSubmitButton);
  submitBtn.disabled = true; // 초기에는 비활성화

  // 제출 처리
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = currentPasswordInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("모든 비밀번호 입력란을 채워주세요.");
      return;
    }

    if (currentPassword !== user.password) {
      alert("현재 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    if (newPassword === currentPassword) {
      alert("현재 비밀번호와 동일합니다. 다른 비밀번호를 입력해주세요.");
      return;
    }

    if (!passwordRegex.test(newPassword)) {
      alert("비밀번호는 8~20자, 문자/숫자/특수문자를 모두 포함해야 합니다.");
      return;
    }

    try {
      const res = await fetch("http://100.74.28.37:8081/api/changepassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname, 
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        alert("비밀번호 변경 실패. 다시 시도해주세요.");
        return;
      }

      alert("비밀번호가 성공적으로 변경되었습니다.");
      user.password = newPassword;
      localStorage.setItem("user", JSON.stringify(user));
      location.reload();
    } catch (err) {
      console.error("❌ 비밀번호 변경 오류:", err);
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  });

  // 취소 버튼
  cancelBtn?.addEventListener("click", () => {
    document.getElementById("passwordPopupOverlay").style.display = "none";
    form.reset();
  });
});

// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("passwordForm");
//   const currentPasswordInput = document.getElementById("currentPassword");
//   const newPasswordInput = document.getElementById("newPassword");
//   const confirmPasswordInput = document.getElementById("confirmPassword");
//   const cancelBtn = document.getElementById("cancelPassword");
//   const nickname = localStorage.getItem("nickname") || "";
//   const user = JSON.parse(localStorage.getItem("user") || "{}");

//   const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

//   // ✅ 비밀번호 보기 기능 (👁️ 아이콘을 사용하는 경우 추가)
//   const toggleIcons = document.querySelectorAll(".toggle-password");
//   toggleIcons.forEach((icon) => {
//     icon.addEventListener("click", () => {
//       const input = document.getElementById(icon.dataset.target);
//       if (input.type === "password") {
//         input.type = "text";
//         icon.textContent = "🙈";
//       } else {
//         input.type = "password";
//         icon.textContent = "👁️";
//       }
//     });
//   });

//   // ✅ 제출 처리
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const currentPassword = currentPasswordInput.value.trim();
//     const newPassword = newPasswordInput.value.trim();
//     const confirmPassword = confirmPasswordInput.value.trim();

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       alert("모든 필드를 입력해주세요.");
//       return;
//     }

//     if (currentPassword !== user.password) {
//       alert("현재 비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       alert("비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     if (newPassword === currentPassword) {
//       alert("현재 비밀번호와 같습니다.");
//       return;
//     }

//     if (!passwordRegex.test(newPassword)) {
//       alert("비밀번호는 8~20자, 문자/숫자/특수문자를 포함해야 합니다.");
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changepassword", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname,
//           password: currentPassword,
//           newPassword: newPassword,
//         }),
//       });

//       if (!res.ok) {
//         alert("비밀번호 변경 실패. 다시 시도해주세요.");
//         return;
//       }

//       alert("비밀번호가 성공적으로 변경되었습니다.");
//       user.password = newPassword;
//       localStorage.setItem("user", JSON.stringify(user));
//       location.reload();
//     } catch (err) {
//       console.error("❌ 비밀번호 변경 오류:", err);
//       alert("비밀번호 변경 중 오류가 발생했습니다.");
//     }
//   });

//   // ✅ 취소 버튼
//   cancelBtn.addEventListener("click", () => {
//     document.getElementById("passwordPopupOverlay").style.display = "none";
//     form.reset();
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("passwordForm");
//   const passwordInput = document.getElementById("password");
//   const confirmPasswordInput = document.getElementById("confirmPassword");
//   const cancelBtn = document.getElementById("cancelPassword");
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const nickname = localStorage.getItem("nickname") || "";

//   const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

//   // ✅ 👁️ 아이콘 toggle
//   const toggleIcons = document.querySelectorAll(".toggle-password");
//   toggleIcons.forEach((icon) => {
//     icon.addEventListener("click", () => {
//       const input = document.getElementById(icon.dataset.target);
//       if (input.type === "password") {
//         input.type = "text";
//         icon.textContent = "🙈";
//       } else {
//         input.type = "password";
//         icon.textContent = "👁️";
//       }
//     });
//   });

//   // ✅ 제출 처리
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const password = passwordInput.value.trim();
//     const confirm = confirmPasswordInput.value.trim();

//     if (!password || !confirm) {
//       alert("새 비밀번호와 확인란을 모두 입력해주세요.");
//       return;
//     }

//     if (password !== confirm) {
//       alert("비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     if (!passwordRegex.test(password)) {
//       alert("비밀번호는 8~20자, 문자/숫자/특수문자를 포함해야 합니다.");
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changepassword", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname,
//           password: password, // ✅ 새 비밀번호만 전달
//         }),
//       });

//       if (!res.ok) {
//         alert("비밀번호 변경 실패. 다시 시도해주세요.");
//         return;
//       }

//       alert("비밀번호가 성공적으로 변경되었습니다.");
//       user.password = password;
//       localStorage.setItem("user", JSON.stringify(user));
//       location.reload();
//     } catch (err) {
//       console.error("❌ 비밀번호 변경 오류:", err);
//       alert("비밀번호 변경 중 오류가 발생했습니다.");
//     }
//   });

//   // ✅ 취소 버튼
//   cancelBtn.addEventListener("click", () => {
//     document.getElementById("passwordPopupOverlay").style.display = "none";
//     form.reset();
//   });
// });
// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("passwordForm");
//   const currentPasswordInput = document.getElementById("currentPassword");
//   const newPasswordInput = document.getElementById("newPassword");
//   const confirmPasswordInput = document.getElementById("confirmPassword");
//   const cancelBtn = document.getElementById("cancelPassword");

//   const nickname = localStorage.getItem("nickname") || "";
//   const user = JSON.parse(localStorage.getItem("user") || {});

//   const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

//   // ✅ 👁️ 비밀번호 보기 toggle
//   const toggleIcons = document.querySelectorAll(".toggle-password");
//   toggleIcons.forEach((icon) => {
//     icon.addEventListener("click", () => {
//       const input = document.getElementById(icon.dataset.target);
//       if (input.type === "password") {
//         input.type = "text";
//         icon.textContent = "🙈";
//       } else {
//         input.type = "password";
//         icon.textContent = "👁️";
//       }
//     });
//   });

//   // ✅ 제출 처리
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();

//     const currentPassword = currentPasswordInput.value.trim();
//     const newPassword = newPasswordInput.value.trim();
//     const confirmPassword = confirmPasswordInput.value.trim();

//     if (!currentPassword || !newPassword || !confirmPassword) {
//       alert("모든 비밀번호 입력란을 채워주세요.");
//       return;
//     }

//     if (currentPassword !== user.password) {
//       alert("현재 비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       alert("새 비밀번호가 일치하지 않습니다.");
//       return;
//     }

//     if (newPassword === currentPassword) {
//       alert("현재 비밀번호와 동일합니다. 다른 비밀번호를 입력해주세요.");
//       return;
//     }

//     if (!passwordRegex.test(newPassword)) {
//       alert("비밀번호는 8~20자, 문자/숫자/특수문자를 모두 포함해야 합니다.");
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changepassword", {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname,
//           currentPassword,
//           newPassword,
//         }),
//       });

//       if (!res.ok) {
//         alert("비밀번호 변경 실패. 다시 시도해주세요.");
//         return;
//       }

//       alert("비밀번호가 성공적으로 변경되었습니다.");
//       user.password = newPassword;
//       localStorage.setItem("user", JSON.stringify(user));
//       location.reload();
//     } catch (err) {
//       console.error("❌ 비밀번호 변경 오류:", err);
//       alert("비밀번호 변경 중 오류가 발생했습니다.");
//     }
//   });

//   // ✅ 취소 버튼
//   cancelBtn?.addEventListener("click", () => {
//     document.getElementById("passwordPopupOverlay").style.display = "none";
//     form.reset();
//   });
// });
