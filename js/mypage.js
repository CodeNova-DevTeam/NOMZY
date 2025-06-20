// // window.addEventListener("DOMContentLoaded", async () => {
// //   // ✅ 무조건 강제로 저장할 기본 유저 정보 (카멜케이스로 정리)
// //   const defaultUser = {
// //     email: "hong@example.com",
// //     password: "qwer1234",
// //     nickname: "홍씨",
// //     name: "홍길동",
// //     birthDate: "2000-01-01",
// //     phoneNumber: "010-1234-5678",
// //     mobileCarrier: "SKT",
// //     gender: "남성",
// //   };

// //   // ✅ localStorage에 무조건 덮어쓰기
// //   localStorage.setItem("user", JSON.stringify(defaultUser));

// //   // ✅ URL 파라미터로 닉네임 받기 (없으면 기본값)
// //   const params = new URLSearchParams(window.location.search);
// //   const nicknameFromURL = params.get("nickname");
// //   const nickname = nicknameFromURL || defaultUser.nickname;

// //   localStorage.setItem("nickname", nickname);

// //   // ✅ 유저 정보 불러오기
// //   try {
// //     const res = await fetch(`http://100.74.28.37:8081/api/mypage?nickname=${nickname}`);
// //     if (!res.ok) throw new Error("서버에서 유저 정보를 불러오지 못했습니다.");

// //     const user = await res.json();

// //     // ✅ HTML 요소에 반영
// //     document.getElementById("info-nickname").textContent = user.nickname || "-";
// //     document.getElementById("info-email").textContent = user.email || "-";
// //     document.getElementById("info-name").textContent = user.name || "-";
// //     document.getElementById("info-birthDate").textContent = user.birthDate || "-";
// //     document.getElementById("info-phoneNumber").textContent = user.phoneNumber || "-";
// //     document.getElementById("info-mobileCarrier").textContent = user.mobileCarrier || "-";
// //     document.getElementById("info-gender").textContent = user.gender || "-";

// //     // ✅ 리뷰 개수도 표시 가능하면 추후 fetch 로직 추가
// //   } catch (err) {
// //     console.error("❌ 사용자 정보 로딩 실패:", err);
// //   }

// //   // ✅ 리뷰 페이지 이동
// //   document.getElementById("fetchReviewBtn")?.addEventListener("click", () => {
// //     window.location.href = `../review/review.html?nickname=${nickname}`;
// //   });

// //   // ✅ 팝업 열기 트리거들
// //   document.getElementById("editNicknameBtn")?.addEventListener("click", () => {
// //     document.getElementById("nicknamePopupOverlay").style.display = "flex";
// //   });
// //   document.getElementById("editEmailBtn")?.addEventListener("click", () => {
// //     document.getElementById("emailPopupOverlay").style.display = "flex";
// //   });
// //   document.getElementById("editPhoneBtn")?.addEventListener("click", () => {
// //     document.getElementById("phonePopupOverlay").style.display = "flex";
// //   });
// //   document.getElementById("openChangePasswordPopup")?.addEventListener("click", () => {
// //     document.getElementById("passwordPopupOverlay").style.display = "flex";
// //   });

// //   // ✅ 회원 탈퇴 팝업 열기
// //   document.getElementById("openDeletePopup")?.addEventListener("click", () => {
// //     const userInfoText = `닉네임: ${document.getElementById("info-nickname").textContent}
// // 이메일: ${document.getElementById("info-email").textContent}
// // 전화번호: ${document.getElementById("info-phoneNumber").textContent}`;

// //     const infoBox = document.createElement("pre");
// //     infoBox.textContent = userInfoText;

// //     const popup = document.getElementById("deletePopupOverlay");
// //     const title = popup.querySelector(".popup-title");

// //     const existing = popup.querySelector("pre");
// //     if (existing) existing.remove();
// //     title.insertAdjacentElement("afterend", infoBox);

// //     popup.style.display = "flex";
// //   });

// //   // ✅ 탈퇴 확정
// //   document.getElementById("confirmDelete")?.addEventListener("click", async () => {
// //     if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 사이트를 사용할 수 없습니다.")) return;

// //     try {
// //       const res = await fetch(`http://100.74.28.37:8081/api/delete?nickname=${nickname}`, {
// //         method: "POST",
// //       });

// //       if (res.ok) {
// //         alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
// //         localStorage.clear();
// //         window.location.href = "../main.html";
// //       } else {
// //         alert("탈퇴 실패. 다시 시도해주세요.");
// //       }
// //     } catch (err) {
// //       console.error("❌ 탈퇴 요청 실패:", err);
// //     }
// //   });

// //   // ✅ 탈퇴 취소
// //   document.getElementById("cancelDelete")?.addEventListener("click", () => {
// //     document.getElementById("deletePopupOverlay").style.display = "none";
// //   });
// // });

// window.addEventListener("DOMContentLoaded", async () => {
//   // ✅ 기본 유저 정보 (카멜케이스 적용)
//   const defaultUser = {
//     email: "hong@example.com",
//     password: "qwer1234",
//     nickname: "홍씨",
//     name: "홍길동",
//     birthDate: "2000-01-01",
//     phoneNumber: "010-1234-5678",
//     mobileCarrier: "SKT",
//     gender: "남성",
//   };

//   // ✅ user가 없을 때만 저장 (처음 한 번만)
//   if (!localStorage.getItem("user")) {
//     localStorage.setItem("user", JSON.stringify(defaultUser));
//   }

//   // ✅ nickname이 없을 경우만 저장 (URL → fallback → 기본값)
//   if (!localStorage.getItem("nickname")) {
//     const params = new URLSearchParams(window.location.search);
//     const nicknameFromURL = params.get("nickname");
//     const nickname = nicknameFromURL || defaultUser.nickname;
//     localStorage.setItem("nickname", nickname);
//   }

//   // ✅ 저장된 nickname 불러오기
//   const nickname = localStorage.getItem("nickname") || defaultUser.nickname;

//   // ✅ 유저 정보 불러오기 (백엔드 API)
//   try {
//     const res = await fetch(`http://100.74.28.37:8081/api/mypage?nickname=${nickname}`);
//     if (!res.ok) throw new Error("서버에서 유저 정보를 불러오지 못했습니다.");

//     const user = await res.json();

//     // ✅ HTML 요소에 데이터 반영
//     document.getElementById("info-nickname").textContent = user.nickname || "-";
//     document.getElementById("info-email").textContent = user.email || "-";
//     document.getElementById("info-name").textContent = user.name || "-";
//     document.getElementById("info-birthDate").textContent = user.birthDate || "-";
//     document.getElementById("info-phoneNumber").textContent = user.phoneNumber || "-";
//     document.getElementById("info-mobileCarrier").textContent = user.mobileCarrier || "-";
//     document.getElementById("info-gender").textContent = user.gender || "-";

//     // ✅ 리뷰 개수 등은 추후 fetch로 추가 가능
//   } catch (err) {
//     console.error("❌ 사용자 정보 로딩 실패:", err);
//   }

//   // ✅ 리뷰 조회 버튼
//   document.getElementById("fetchReviewBtn")?.addEventListener("click", () => {
//     window.location.href = `../review/review.html?nickname=${nickname}`;
//   });

//   // ✅ 팝업 열기 버튼들
//   document.getElementById("editNicknameBtn")?.addEventListener("click", () => {
//     document.getElementById("nicknamePopupOverlay").style.display = "flex";
//   });
//   document.getElementById("editEmailBtn")?.addEventListener("click", () => {
//     document.getElementById("emailPopupOverlay").style.display = "flex";
//   });
//   document.getElementById("editPhoneBtn")?.addEventListener("click", () => {
//     document.getElementById("phonePopupOverlay").style.display = "flex";
//   });
//   document.getElementById("openChangePasswordPopup")?.addEventListener("click", () => {
//     document.getElementById("passwordPopupOverlay").style.display = "flex";
//   });

//   // ✅ 회원 탈퇴 팝업 열기
//   document.getElementById("openDeletePopup")?.addEventListener("click", () => {
//     const userInfoText = `닉네임: ${document.getElementById("info-nickname").textContent}
// 이메일: ${document.getElementById("info-email").textContent}
// 전화번호: ${document.getElementById("info-phoneNumber").textContent}`;

//     const infoBox = document.createElement("pre");
//     infoBox.textContent = userInfoText;

//     const popup = document.getElementById("deletePopupOverlay");
//     const title = popup.querySelector(".popup-title");

//     const existing = popup.querySelector("pre");
//     if (existing) existing.remove();
//     title.insertAdjacentElement("afterend", infoBox);

//     popup.style.display = "flex";
//   });

//   // ✅ 탈퇴 확정
//   document.getElementById("confirmDelete")?.addEventListener("click", async () => {
//     if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 사이트를 사용할 수 없습니다.")) return;

//     try {
//       const res = await fetch(`http://100.74.28.37:8081/api/delete?nickname=${nickname}`, {
//         method: "POST",
//       });

//       if (res.ok) {
//         alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
//         localStorage.clear();
//         window.location.href = "../main.html";
//       } else {
//         alert("탈퇴 실패. 다시 시도해주세요.");
//       }
//     } catch (err) {
//       console.error("❌ 탈퇴 요청 실패:", err);
//     }
//   });

//   // ✅ 탈퇴 취소
//   document.getElementById("cancelDelete")?.addEventListener("click", () => {
//     document.getElementById("deletePopupOverlay").style.display = "none";
//   });
// });

window.addEventListener("DOMContentLoaded", async () => {
  // ✅ 기본 유저 정보 (카멜케이스 적용)
  const defaultUser = {
    email: "ccc@naver.com",
    password: "Eogks123!@#",
    nickname: "되한",
    name: "양대한",
    birthDate: "2000-10-10",
    phoneNumber: "010-9841-6516",
    mobileCarrier: "KT",
    gender: "male",
  };

  if (!localStorage.getItem("user")) {
    localStorage.setItem("user", JSON.stringify(defaultUser));
  }

  if (!localStorage.getItem("nickname")) {
    const params = new URLSearchParams(window.location.search);
    const nicknameFromURL = params.get("nickname");
    const nickname = nicknameFromURL || defaultUser.nickname;
    localStorage.setItem("nickname", nickname);
  }

  const nickname = localStorage.getItem("nickname") || defaultUser.nickname;

  try {
    const res = await fetch(`http://100.74.28.37:8081/api/mypage?nickname=${nickname}`);
    if (!res.ok) throw new Error("서버에서 유저 정보를 불러오지 못했습니다.");
    const user = await res.json();

    document.getElementById("info-nickname").textContent = user.nickname || "-";
    document.getElementById("info-email").textContent = user.email || "-";
    document.getElementById("info-name").textContent = user.name || "-";
    document.getElementById("info-birthDate").textContent = user.birthDate || "-";
    document.getElementById("info-phoneNumber").textContent = user.phoneNumber || "-";
    document.getElementById("info-mobileCarrier").textContent = user.mobileCarrier || "-";
    document.getElementById("info-gender").textContent = user.gender || "-";
  } catch (err) {
    console.error("❌ 사용자 정보 로딩 실패:", err);
  }

  document.getElementById("fetchReviewBtn")?.addEventListener("click", () => {
    window.location.href = `../review/review.html?nickname=${nickname}`;
  });

  document.getElementById("editNicknameBtn")?.addEventListener("click", () => {
    document.getElementById("nicknamePopupOverlay").style.display = "flex";
  });
  document.getElementById("editEmailBtn")?.addEventListener("click", () => {
    document.getElementById("emailPopupOverlay").style.display = "flex";
  });
  document.getElementById("editPhoneBtn")?.addEventListener("click", () => {
    document.getElementById("phonePopupOverlay").style.display = "flex";
  });
  document.getElementById("openChangePasswordPopup")?.addEventListener("click", () => {
    document.getElementById("passwordPopupOverlay").style.display = "flex";
  });

  document.getElementById("openDeletePopup")?.addEventListener("click", () => {
    const userInfoText = `닉네임: ${document.getElementById("info-nickname").textContent}\n이메일: ${
      document.getElementById("info-email").textContent
    }\n전화번호: ${document.getElementById("info-phoneNumber").textContent}`;

    const infoBox = document.createElement("pre");
    infoBox.textContent = userInfoText;

    const popup = document.getElementById("deletePopupOverlay");
    const title = popup.querySelector(".popup-title");

    const existing = popup.querySelector("pre");
    if (existing) existing.remove();
    title.insertAdjacentElement("afterend", infoBox);

    popup.style.display = "flex";
  });

  document.getElementById("confirmDelete")?.addEventListener("click", async () => {
    if (!confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 사이트를 사용할 수 없습니다.")) return;

    try {
      const res = await fetch("http://100.74.28.37:8081/api/deleteuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname }),
      });

      if (res.ok) {
        alert("탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.");
        localStorage.clear();
        window.location.href = "../main.html";
      } else {
        alert("탈퇴 실패. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("❌ 탈퇴 요청 실패:", err);
    }
  });
});
