// // document.addEventListener("DOMContentLoaded", () => {
// //   const form = document.getElementById("phoneForm");
// //   const currentPhoneInput = document.getElementById("currentPhone");
// //   const newPhoneInput = document.getElementById("newPhone");
// //   const carrierSelect = document.getElementById("carrierSelect");
// //   const cancelBtn = document.getElementById("cancelPhone");
// //   const message = document.getElementById("phoneMessage");

// //   const user = JSON.parse(localStorage.getItem("user") || "{}");
// //   const currentNickname = localStorage.getItem("nickname") || "";
// //   const originalPhone = user.phoneNumber || "";

// //   if (cancelBtn) {
// //     cancelBtn.addEventListener("click", () => {
// //       document.getElementById("phonePopupOverlay").style.display = "none";
// //       document.getElementById("phoneForm").reset();
// //       document.getElementById("phoneMessage").textContent = "";
// //     });
// //   }
// //   // ✅ 자동 하이픈 처리
// //   newPhoneInput.addEventListener("input", () => {
// //     let digits = newPhoneInput.value.replace(/[^\d]/g, "").slice(0, 11);
// //     if (digits.length >= 3 && digits.length <= 7) {
// //       newPhoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3);
// //     } else if (digits.length > 7) {
// //       newPhoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
// //     } else {
// //       newPhoneInput.value = digits;
// //     }
// //   });

// //   // ✅ 제출 처리
// //   form.addEventListener("submit", async (e) => {
// //     e.preventDefault();
// //     const currentPhone = currentPhoneInput.value.trim();
// //     const newPhone = newPhoneInput.value.trim();
// //     const carrier = carrierSelect.value;

// //     message.textContent = "";

// //     if (!newPhone) {
// //       message.textContent = "전화번호를 입력해주세요.";
// //       return;
// //     }

// //     if (!/^010-\d{4}-\d{4}$/.test(newPhone)) {
// //       message.textContent = "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)";
// //       return;
// //     }

// //     if (newPhone === originalPhone) {
// //       message.textContent = "같은 전화번호입니다.";
// //       return;
// //     }

// //     if (!carrier) {
// //       message.textContent = "통신사를 선택해주세요.";
// //       return;
// //     }

// //     try {
// //       const res = await fetch("http://100.74.28.37:8081/api/user/phone", {
// //         method: "PATCH",
// //         headers: {
// //           "Content-Type": "application/json",
// //         },
// //         body: JSON.stringify({
// //           nickname: currentNickname,
// //           newPhoneNumber: newPhone,
// //           mobileCarrier: carrier,
// //         }),
// //       });

// //       if (!res.ok) {
// //         message.textContent = "전화번호 변경 실패";
// //         return;
// //       }

// //       alert("전화번호가 성공적으로 변경되었습니다.");
// //       const updatedUser = { ...user, phoneNumber: newPhone, mobileCarrier: carrier };
// //       localStorage.setItem("user", JSON.stringify(updatedUser));
// //       location.reload();
// //     } catch (err) {
// //       console.error("❌ 전화번호 변경 오류:", err);
// //       message.textContent = "변경 중 오류 발생";
// //     }
// //   });

// //   // ✅ 취소
// //   cancelBtn.addEventListener("click", () => {
// //     document.getElementById("phonePopupOverlay").style.display = "none";
// //     form.reset();
// //     message.textContent = "";
// //   });
// // });

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("📦 phoneNumber.js loaded");

//   const currentPhoneInput = document.getElementById("currentPhoneNumber");
//   const newPhoneInput = document.getElementById("newPhoneNumber");
//   const carrierSelect = document.getElementById("mobileCarrier");
//   const cancelBtn = document.getElementById("cancelPhone");
//   const message = document.getElementById("phoneMessage");
//   const form = document.getElementById("phoneForm");

//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   const currentNickname = localStorage.getItem("nickname") || "";
//   const originalPhone = user.phoneNumber || "";

//   // ✅ 취소 버튼 이벤트
//   if (cancelBtn) {
//     cancelBtn.addEventListener("click", () => {
//       console.log("❌ 취소 버튼 클릭됨");
//       document.getElementById("phonePopupOverlay").style.display = "none";
//       form?.reset();
//       if (message) message.textContent = "";
//     });
//   } else {
//     console.log("⚠️ cancelPhone 버튼 없음");
//   }

//   // ✅ 전화번호 자동 하이픈 처리
//   if (newPhoneInput) {
//     newPhoneInput.addEventListener("input", () => {
//       console.log("📞 전화번호 입력 중");
//       let digits = newPhoneInput.value.replace(/\D/g, "").slice(0, 11);

//       if (digits.length > 3 && digits.length <= 7) {
//         newPhoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3);
//       } else if (digits.length > 7) {
//         newPhoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
//       } else {
//         newPhoneInput.value = digits;
//       }
//     });
//   } else {
//     console.log("⚠️ newPhoneNumber 요소 없음");
//   }

//   // ✅ 제출 처리
//   if (form) {
//     form.addEventListener("submit", async (e) => {
//       e.preventDefault();
//       console.log("📤 전화번호 변경 제출됨");

//       const newPhoneNumber = newPhoneInput?.value.trim() || "";
//       const newCarrier = carrierSelect?.value;

//       if (message) message.textContent = "";

//       if (!newPhoneNumber) {
//         message.textContent = "전화번호를 입력해주세요.";
//         return;
//       }

//       const phoneRegex = /^010-\d{4}-\d{4}$/;
//       if (!phoneRegex.test(newPhoneNumber)) {
//         message.textContent = "전화번호 형식이 올바르지 않습니다.";
//         return;
//       }

//       if (newPhoneNumber === originalPhone) {
//         message.textContent = "같은 전화번호입니다.";
//         return;
//       }

//       if (!newCarrier) {
//         message.textContent = "통신사를 선택해주세요.";
//         return;
//       }

//       try {
//         const res = await fetch("http://100.74.28.37:8081/api/user/phone", {
//           method: "PATCH",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             nickname: currentNickname,
//             newPhoneNumber,
//             mobileCarrier: newCarrier,
//           }),
//         });

//         if (!res.ok) {
//           console.log("❌ 변경 실패: 서버 응답 문제");
//           message.textContent = "변경 실패. 다시 시도해주세요.";
//           return;
//         }

//         alert("전화번호가 성공적으로 변경되었습니다.");
//         console.log("✅ 전화번호 변경 성공");

//         localStorage.setItem(
//           "user",
//           JSON.stringify({
//             ...user,
//             phoneNumber: newPhoneNumber,
//             mobileCarrier: newCarrier,
//           })
//         );
//         localStorage.setItem("nickname", currentNickname);
//         location.reload();
//       } catch (err) {
//         console.error("❌ 전화번호 변경 오류:", err);
//         message.textContent = "서버 오류 발생. 다시 시도해주세요.";
//       }
//     });
//   } else {
//     console.log("⚠️ phoneForm 요소 없음");
//   }
// });

document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 phoneNumber.js loaded");

  const phoneInput = document.getElementById("phoneNumber");
  const carrierSelect = document.getElementById("mobileCarrier");
  const cancelBtn = document.getElementById("cancelPhone");
  const message = document.getElementById("phoneMessage");
  const form = document.getElementById("phoneForm");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentNickname = localStorage.getItem("nickname") || "";
  const originalPhone = user.phoneNumber || "";

  // ✅ 취소 버튼
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      console.log("❌ 취소 버튼 클릭됨");
      document.getElementById("phonePopupOverlay").style.display = "none";
      form?.reset();
      if (message) message.textContent = "";
    });
  }

  // ✅ 자동 하이픈 처리
  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      let digits = phoneInput.value.replace(/\D/g, "").slice(0, 11);
      if (digits.length > 3 && digits.length <= 7) {
        phoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3);
      } else if (digits.length > 7) {
        phoneInput.value = digits.slice(0, 3) + "-" + digits.slice(3, 7) + "-" + digits.slice(7);
      } else {
        phoneInput.value = digits;
      }
    });
  }

  // ✅ 제출
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const phoneNumber = phoneInput?.value.trim() || "";
      const mobileCarrier = carrierSelect?.value;
      if (message) message.textContent = "";

      if (!phoneNumber) {
        message.textContent = "전화번호를 입력해주세요.";
        return;
      }

      if (!/^010-\d{4}-\d{4}$/.test(phoneNumber)) {
        message.textContent = "전화번호 형식이 올바르지 않습니다.";
        return;
      }

      if (phoneNumber === originalPhone) {
        message.textContent = "같은 전화번호입니다.";
        return;
      }

      if (!mobileCarrier) {
        message.textContent = "통신사를 선택해주세요.";
        return;
      }

      try {
        const res = await fetch("http://100.74.28.37:8081/api/changephone", {
          //수정
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nickname: currentNickname,
            phoneNumber: phoneNumber,
            mobileCarrier: mobileCarrier,
          }),
        });

        if (!res.ok) {
          message.textContent = "변경 실패. 다시 시도해주세요.";
          return;
        }

        alert("전화번호가 성공적으로 변경되었습니다.");
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            phoneNumber,
            mobileCarrier,
          })
        );
        location.reload();
      } catch (err) {
        console.error("❌ 전화번호 변경 오류:", err);
        message.textContent = "서버 오류 발생. 다시 시도해주세요.";
      }
    });
  }
});
