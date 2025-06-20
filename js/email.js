// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("emailForm");
//   const currentEmailInput = document.getElementById("currentEmail");
//   const newEmailInput = document.getElementById("newEmail");
//   const checkBtn = document.getElementById("checkEmailBtn");
//   const cancelBtn = document.getElementById("closeEmailPopup");
//   const message = document.getElementById("emailMessage");

//   const currentNickname = localStorage.getItem("nickname") || "";
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const originalEmail = user.email || "";

//   let isChecked = false;

//   // ✅ 이메일 형식 정규식
//   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

//   // ✅ 중복 확인
//   checkBtn.addEventListener("click", async () => {
//     const newEmail = newEmailInput.value.trim();
//     message.textContent = "";
//     isChecked = false;

//     if (!newEmail) {
//       message.textContent = "이메일을 입력해주세요.";
//       return;
//     }

//     if (!emailRegex.test(newEmail)) {
//       message.textContent = "올바른 이메일 형식을 입력해주세요.";
//       return;
//     }

//     if (newEmail === originalEmail) {
//       message.textContent = "현재 이메일과 같습니다.";
//       return;
//     }

//     try {
//       const res = await fetch(`http://100.74.28.37:8081/api/checkemail?email=${encodeURIComponent(newEmail)}`);
//       if (!res.ok) throw new Error("서버 오류");

//       const isAvailable = await res.text();
//       if (isAvailable === "false") {
//         message.textContent = "사용 가능한 이메일입니다.";
//         isChecked = true;
//       } else {
//         message.textContent = "이미 사용 중인 이메일입니다.";
//       }
//     } catch (err) {
//       console.error("❌ 중복 확인 오류:", err);
//       message.textContent = "중복 확인 실패";
//     }
//   });

//   // ✅ 이메일 변경 제출
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const currentEmail = currentEmailInput.value.trim();
//     const newEmail = newEmailInput.value.trim();

//     message.textContent = "";

//     if (!isChecked) {
//       message.textContent = "이메일 중복 확인을 해주세요.";
//       return;
//     }

//     if (currentEmail !== originalEmail) {
//       message.textContent = "현재 이메일이 일치하지 않습니다.";
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changeemail", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname: currentNickname,
//           email: email, //수정햇음 new->email
//         }),
//       });

//       if (!res.ok) {
//         message.textContent = "이메일 변경 실패";
//         return;
//       }

//       alert("이메일이 성공적으로 변경되었습니다.");
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       user.email = newEmail;
//       localStorage.setItem("user", JSON.stringify(user));
//       location.reload();
//     } catch (err) {
//       console.error("❌ 이메일 변경 오류:", err);
//       message.textContent = "변경 중 오류 발생";
//     }
//   });

//   // ✅ 취소
//   cancelBtn.addEventListener("click", () => {
//     document.getElementById("emailPopupOverlay").style.display = "none";
//     form.reset();
//     message.textContent = "";
//     isChecked = false;
//   });
// });

//

//

document.addEventListener("DOMContentLoaded", () => {
  const emailForm = document.getElementById("emailForm");
  const emailInput = document.getElementById("newEmail");
  const currentEmailInput = document.getElementById("currentEmail");
  const newEmailInput = document.getElementById("newEmail");
  const emailCheckBtn = document.getElementById("checkEmailBtn");
  const emailCancelBtn = document.getElementById("closeEmailPopup");
  const emailMessage = document.getElementById("emailMessage");

  const currentNickname = localStorage.getItem("nickname") || "";
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const originalEmail = user.email || "";

  let isEmailChecked = false;

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // ✅ 입력할 때 중복 확인 버튼 활성/비활성 처리
  emailInput.addEventListener("input", () => {
    const email = emailInput.value.trim();
    const currentEmail = currentEmailInput.value.trim(); // 새로 추가된 줄
    emailCheckBtn.disabled = !email || email === currentEmail || !emailRegex.test(email); // 수정된 비교 기준
  });

  emailCheckBtn.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    emailMessage.textContent = "";
    isEmailChecked = false;
    emailCheckBtn.disabled = true;

    if (!email || email === originalEmail || !emailRegex.test(email)) {
      emailMessage.textContent = !email
        ? "이메일을 입력해주세요."
        : email === originalEmail
        ? "현재 이메일과 같습니다."
        : "올바른 이메일 형식을 입력해주세요.";
      return;
    }

    try {
      const res = await fetch(`http://100.74.28.37:8081/api/checkemail?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error("서버 오류");

      const isAvailable = await res.text();
      if (isAvailable === "false") {
        emailMessage.textContent = "사용 가능한 이메일입니다.";
        isEmailChecked = true;
        emailCheckBtn.disabled = false;
      } else {
        emailMessage.textContent = "이미 사용 중인 이메일입니다.";
      }
    } catch (err) {
      console.error("❌ 중복 확인 오류:", err);
      emailMessage.textContent = "중복 확인 실패";
    }
  });

  emailForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    emailMessage.textContent = "";

    if (!isEmailChecked) {
      emailMessage.textContent = "이메일 중복 확인을 해주세요.";
      return;
    }

    try {
      const res = await fetch("http://100.74.28.37:8081/api/changeemail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname: currentNickname,
          email: email,
        }),
      });

      if (!res.ok) {
        emailMessage.textContent = "이메일 변경 실패";
        return;
      }

      alert("이메일이 성공적으로 변경되었습니다.");
      user.email = email;
      localStorage.setItem("user", JSON.stringify(user));
      location.reload();
    } catch (err) {
      console.error("❌ 이메일 변경 오류:", err);
      emailMessage.textContent = "변경 중 오류 발생";
    }
  });

  emailCancelBtn.addEventListener("click", () => {
    document.getElementById("emailPopupOverlay").style.display = "none";
    emailForm.reset();
    emailMessage.textContent = "";
    isEmailChecked = false;
    emailCheckBtn.disabled = true;
  });
});
