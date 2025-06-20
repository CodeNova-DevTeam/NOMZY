// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("nicknameForm");
//   const newNicknameInput = document.getElementById("newNickname");
//   const checkBtn = document.getElementById("checkNicknameBtn");
//   const submitBtn = document.getElementById("submitNicknameBtn");
//   const cancelBtn = document.getElementById("cancelNickname");
//   const message = document.getElementById("nicknameMessage");

//   const currentNickname = localStorage.getItem("nickname") || "";

//   let isChecked = false;

//   // ✅ 정규식: 한글/영문/숫자만
//   const nicknameRegex = /^[a-zA-Z0-9가-힣]+$/;

//   // ✅ 중복 확인
//   checkBtn.addEventListener("click", async () => {
//     const newNickname = newNicknameInput.value.trim();
//     message.textContent = "";
//     isChecked = false;

//     if (!newNickname) {
//       message.textContent = "닉네임을 입력해주세요.";
//       return;
//     }

//     if (!nicknameRegex.test(newNickname)) {
//       message.textContent = "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
//       return;
//     }

//     if (newNickname === currentNickname) {
//       message.textContent = "현재 닉네임과 같습니다.";
//       return;
//     }

//     try {
//       const res = await fetch(`http://100.74.28.37:8081/api/checknickname?nickname=${encodeURIComponent(newNickname)}`);
//       if (!res.ok) throw new Error("서버 응답 실패");

//       const isAvailable = await res.text();
//       if (isAvailable === "true") {
//         message.textContent = "사용 가능한 닉네임입니다.";
//         isChecked = true;
//       } else {
//         message.textContent = "이미 사용 중인 닉네임입니다.";
//       }
//     } catch (err) {
//       message.textContent = "중복 확인 중 오류 발생";
//       console.error(err);
//     }
//   });

//   // ✅ 닉네임 변경 제출
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const newNickname = newNicknameInput.value.trim();
//     message.textContent = "";

//     if (!isChecked) {
//       message.textContent = "닉네임 중복 확인을 해주세요.";
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changenickname", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname: currentNickname,
//           newNickname: newNickname,
//         }),
//       });

//       if (!res.ok) {
//         message.textContent = "닉네임 변경 실패";
//         return;
//       }

//       alert("닉네임이 성공적으로 변경되었습니다.");
//       localStorage.setItem("nickname", newNickname);
//       location.reload();
//     } catch (err) {
//       console.error("❌ 닉네임 변경 오류:", err);
//       message.textContent = "변경 중 오류 발생";
//     }
//   });

//   // ✅ 취소 버튼
//   cancelBtn.addEventListener("click", () => {
//     document.getElementById("nicknamePopupOverlay").style.display = "none";
//     form.reset();
//     message.textContent = "";
//     isChecked = false;
//   });
// });

// document.addEventListener("DOMContentLoaded", () => {
//   const form = document.getElementById("nicknameForm");
//   const newNicknameInput = document.getElementById("newNickname");
//   const checkBtn = document.getElementById("checkNicknameBtn");
//   const submitBtn = document.getElementById("submitNicknameBtn");
//   const cancelBtn = document.getElementById("cancelNickname");
//   const message = document.getElementById("nicknameMessage");

//   const currentNickname = localStorage.getItem("nickname") || "";

//   let isChecked = false;
//   let checkedNickname = ""; // ✅ 중복 확인된 닉네임 저장

//   const nicknameRegex = /^[a-zA-Z0-9가-힣]+$/;

//   // ✅ 닉네임 중복 확인
//   checkBtn.addEventListener("click", async () => {
//     const newNickname = newNicknameInput.value.trim();
//     message.textContent = "";
//     isChecked = false;
//     checkedNickname = "";

//     if (!newNickname) {
//       message.textContent = "닉네임을 입력해주세요.";
//       return;
//     }

//     if (!nicknameRegex.test(newNickname)) {
//       message.textContent = "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
//       return;
//     }

//     if (newNickname === currentNickname) {
//       message.textContent = "현재 닉네임과 같습니다.";
//       return;
//     }

//     try {
//       const res = await fetch(`http://100.74.28.37:8081/api/checknickname?nickname=${encodeURIComponent(newNickname)}`);
//       if (!res.ok) throw new Error("서버 응답 실패");

//       const isAvailable = await res.text();
//       if (isAvailable === "true") {
//         message.textContent = "사용 가능한 닉네임입니다.";
//         isChecked = true;
//         checkedNickname = newNickname; // ✅ 확인된 닉네임 저장
//       } else {
//         message.textContent = "이미 사용 중인 닉네임입니다.";
//       }
//     } catch (err) {
//       console.error(err);
//       message.textContent = "중복 확인 중 오류 발생";
//     }
//   });

//   // ✅ 닉네임 변경 제출
//   form.addEventListener("submit", async (e) => {
//     e.preventDefault();
//     const newNickname = newNicknameInput.value.trim();
//     message.textContent = "";

//     if (!isChecked || newNickname !== checkedNickname) {
//       message.textContent = "닉네임 중복 확인을 다시 해주세요.";
//       return;
//     }

//     try {
//       const res = await fetch("http://100.74.28.37:8081/api/changenickname", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           nickname: currentNickname,
//           newNickname: newNickname,
//         }),
//       });

//       if (!res.ok) {
//         message.textContent = "닉네임 변경 실패";
//         return;
//       }

//       alert("닉네임이 성공적으로 변경되었습니다.");
//       localStorage.setItem("nickname", newNickname);
//       location.reload();
//     } catch (err) {
//       console.error("❌ 닉네임 변경 오류:", err);
//       message.textContent = "변경 중 오류 발생";
//     }
//   });

//   // ✅ 닉네임 변경 취소
//   cancelBtn.addEventListener("click", () => {
//     document.getElementById("nicknamePopupOverlay").style.display = "none";
//     form.reset();
//     message.textContent = "";
//     isChecked = false;
//     checkedNickname = "";
//   });
// });
//

// 닉네임 -----------------------------
// const nicknameForm = document.getElementById("nicknameForm");
// const newNicknameInput = document.getElementById("newNickname");
// const nicknameCheckBtn = document.getElementById("checkNicknameBtn");
// const cancelBtn = document.getElementById("cancelNickname");
// const nicknameMessage = document.getElementById("nicknameMessage");

// const currentNicknameNick = localStorage.getItem("nickname") || "";
// let isNicknameChecked = false;
// let checkedNickname = "";

// const nicknameRegex = /^[a-zA-Z0-9가-힣]+$/;

// nicknameCheckBtn.addEventListener("click", async () => {
//   const newNickname = newNicknameInput.value.trim();
//   nicknameMessage.textContent = "";
//   isNicknameChecked = false;
//   checkedNickname = "";
//   nicknameCheckBtn.disabled = true;

//   if (!newNickname || newNickname === currentNicknameNick || !nicknameRegex.test(newNickname)) {
//     nicknameMessage.textContent = !newNickname
//       ? "닉네임을 입력해주세요."
//       : newNickname === currentNicknameNick
//       ? "현재 닉네임과 같습니다."
//       : "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
//     return;
//   }

//   try {
//     const res = await fetch(`http://100.74.28.37:8081/api/checknickname?nickname=${encodeURIComponent(newNickname)}`);
//     if (!res.ok) throw new Error("서버 응답 실패");

//     const isAvailable = await res.text();
//     if (isAvailable === "false") {
//       nicknameMessage.textContent = "사용 가능한 닉네임입니다.";
//       isNicknameChecked = true;
//       checkedNickname = newNickname;
//       nicknameCheckBtn.disabled = false;
//     } else {
//       nicknameMessage.textContent = "이미 사용 중인 닉네임입니다.";
//     }
//   } catch (err) {
//     console.error("❌ 중복 확인 에러:", err);
//     nicknameMessage.textContent = "중복 확인 중 오류 발생";
//   }
// });

// nicknameForm.addEventListener("submit", async (e) => {
//   e.preventDefault();
//   const newNickname = newNicknameInput.value.trim();
//   nicknameMessage.textContent = "";

//   if (!isNicknameChecked || newNickname !== checkedNickname) {
//     nicknameMessage.textContent = "닉네임 중복 확인을 다시 해주세요.";
//     return;
//   }

//   try {
//     const res = await fetch("http://100.74.28.37:8081/api/changenickname", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         nickname: currentNicknameNick,
//         newNickname: newNickname,
//       }),
//     });

//     if (!res.ok) {
//       nicknameMessage.textContent = "닉네임 변경 실패";
//       return;
//     }

//     alert("닉네임이 성공적으로 변경되었습니다.");
//     localStorage.setItem("nickname", newNickname);
//     user.nickname = newNickname;
//     localStorage.setItem("user", JSON.stringify(user));
//     document.getElementById("info-nickname").innerText = newNickname;
//     document.getElementById("nicknamePopupOverlay").style.display = "none";
//     nicknameForm.reset();
//     nicknameMessage.textContent = "";
//     isNicknameChecked = false;
//     checkedNickname = "";
//   } catch (err) {
//     console.error("❌ 닉네임 변경 오류:", err);
//     nicknameMessage.textContent = "변경 중 오류 발생";
//   }
// });

// cancelBtn.addEventListener("click", () => {
//   document.getElementById("nicknamePopupOverlay").style.display = "none";
//   nicknameForm.reset();
//   nicknameMessage.textContent = "";
//   isNicknameChecked = false;
//   checkedNickname = "";
// });

// 닉네임 -----------------------------
const nicknameForm = document.getElementById("nicknameForm");
const newNicknameInput = document.getElementById("newNickname");
const nicknameCheckBtn = document.getElementById("checkNicknameBtn");
const cancelBtn = document.getElementById("cancelNickname");
const nicknameMessage = document.getElementById("nicknameMessage");

const currentNicknameNick = localStorage.getItem("nickname") || "";
let isNicknameChecked = false;
let checkedNickname = "";

const nicknameRegex = /^[a-zA-Z0-9가-힣]+$/;

nicknameCheckBtn.disabled = true; // 초기 상태에서 비활성화
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("currentNickname").value = localStorage.getItem("nickname") || "";
});

newNicknameInput.addEventListener("input", () => {
  const newNickname = newNicknameInput.value.trim();
  const isValid = newNickname && newNickname !== currentNicknameNick && nicknameRegex.test(newNickname);
  nicknameCheckBtn.disabled = !isValid;
});

nicknameCheckBtn.addEventListener("click", async () => {
  const newNickname = newNicknameInput.value.trim();
  nicknameMessage.textContent = "";
  isNicknameChecked = false;
  checkedNickname = "";
  nicknameCheckBtn.disabled = true;

  if (!newNickname || newNickname === currentNicknameNick || !nicknameRegex.test(newNickname)) {
    nicknameMessage.textContent = !newNickname
      ? "닉네임을 입력해주세요."
      : newNickname === currentNicknameNick
      ? "현재 닉네임과 같습니다."
      : "닉네임은 한글, 영문, 숫자만 사용 가능합니다.";
    return;
  }

  try {
    const res = await fetch(`http://100.74.28.37:8081/api/checknickname?nickname=${encodeURIComponent(newNickname)}`);
    if (!res.ok) throw new Error("서버 응답 실패");

    const isAvailable = await res.text();
    if (isAvailable === "false") {
      nicknameMessage.textContent = "사용 가능한 닉네임입니다.";
      isNicknameChecked = true;
      checkedNickname = newNickname;
      nicknameCheckBtn.disabled = false;
    } else {
      nicknameMessage.textContent = "이미 사용 중인 닉네임입니다.";
    }
  } catch (err) {
    console.error("❌ 중복 확인 에러:", err);
    nicknameMessage.textContent = "중복 확인 중 오류 발생";
  }
});

nicknameForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newNickname = newNicknameInput.value.trim();
  nicknameMessage.textContent = "";

  if (!isNicknameChecked || newNickname !== checkedNickname) {
    nicknameMessage.textContent = "닉네임 중복 확인을 다시 해주세요.";
    return;
  }

  try {
    const res = await fetch("http://100.74.28.37:8081/api/changenickname", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nickname: currentNicknameNick,
        newNickname: newNickname,
      }),
    });

    if (!res.ok) {
      nicknameMessage.textContent = "닉네임 변경 실패";
      return;
    }

    alert("닉네임이 성공적으로 변경되었습니다.");
    localStorage.setItem("nickname", newNickname);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    user.nickname = newNickname;
    localStorage.setItem("user", JSON.stringify(user));
    document.getElementById("info-nickname").innerText = newNickname;
    document.getElementById("nicknamePopupOverlay").style.display = "none";
    nicknameForm.reset();
    nicknameMessage.textContent = "";
    isNicknameChecked = false;
    checkedNickname = "";
    nicknameCheckBtn.disabled = true;
  } catch (err) {
    console.error("❌ 닉네임 변경 오류:", err);
    nicknameMessage.textContent = "변경 중 오류 발생";
  }
});

cancelBtn.addEventListener("click", () => {
  document.getElementById("nicknamePopupOverlay").style.display = "none";
  nicknameForm.reset();
  nicknameMessage.textContent = "";
  isNicknameChecked = false;
  checkedNickname = "";
  nicknameCheckBtn.disabled = true;
});
