import {
    isValidEmail,
} from "../jsUtil/jsUtil.js";

const login = document.getElementById("login");
const userIdInput = document.getElementById("userId");
const emailErrorMessageLog = document.getElementById("idError");
const userPasswordInput = document.getElementById("userPassword");
const passwordErrorMessageLog = document.getElementById("passwordError");
const loginErrorMsg = document.getElementById("loginError");

function displayError(element, message, isValid) {
    if (isValid) {
        element.style.display = "none";
        element.textContent = ""; // 메시지도 비워주는 것이 깔끔합니다.
    } else {
        element.textContent = message;
        element.style.color = "red";
        element.style.display = "block";
    }
}

// 각 입력 필드의 유효성 상태를 관리하는 객체
const validationStates = {
    email: false,
    password: false,
};

// 이메일 유효성 검사
userIdInput.addEventListener("blur", function () {
    const email = userIdInput.value.trim();
    if (email === "") {
        displayError(emailErrorMessageLog, "아이디(이메일)를 입력해주세요.", false);
        validationStates.email = false;
    } else if (!isValidEmail(email)) {
        displayError(emailErrorMessageLog, "올바른 이메일 형식이 아닙니다.", false);
        validationStates.email = false;
    } else {
        displayError(emailErrorMessageLog, "", true); // 유효하면 에러 메시지 숨김
        validationStates.email = true;
    }
});
// 비밀번호 유효성 검사
userPasswordInput.addEventListener("blur", function () {
    const password = userPasswordInput.value.trim();
    if (password === "") {
        displayError(passwordErrorMessageLog, "비밀번호를 입력해주세요.", false);
        validationStates.password = false;
    } else if (password.length < 8 || password.length > 16) {
      displayError(passwordErrorMessageLog, "비밀번호는 8~16자여야 합니다.", false);
      validationStates.password = false;
    } else {
        displayError(passwordErrorMessageLog, "", true); // 유효하면 에러 메시지 숨김
        validationStates.password = true;
    }
});

// 최종 폼 제출
window.check = async function (event) { // onsubmit="return check(event)" 형태로 호출되도록 'event' 객체를 받을수있게함
    event.preventDefault(); // 폼 제출의 기본 동작을 막기

    // 모든 클라이언트 측 유효성 검사를 통과했을 경우에만 서버로 전송
    const email = userIdInput.value.trim();
    const password = userPasswordInput.value.trim();
    const serverLoginUrl = "http://192.168.0.110:8080/nomzy/login"; // 여기( # )에 빽엔드 로그인 url 넣기
    
    // 로그인 에러 메시지 초기화
    displayError(loginErrorMsg, "", true);

    // blur 이벤트 강제 발생 (사용자가 필드를 건드리지 않고 바로 제출할 경우 대비)
    userIdInput.dispatchEvent(new Event('blur'));
    userPasswordInput.dispatchEvent(new Event('blur'));
    if (email === ""){
        userIdInput.focus();
        return false;
    }

    if (!validationStates.email) {
        // 이미 blur 이벤트에서 적절한 메시지가 설정되었을 것이므로 추가 설정 불필요
        userIdInput.focus();
        return false;
    }
    // 2. 비밀번호 유효성 검사
    if (!validationStates.password) {
        // 이미 blur 이벤트에서 적절한 메시지가 설정되었을 것이므로 추가 설정 불필요
        userPasswordInput.focus();
        return false;
    }

    // 잠금 상태 확인
    const loginAttempts = getLoginAttempts();
    const userAttempts = loginAttempts[email] || { attempts : 0, lockUntil : 0 };
    const currentTime = new Date().getTime();

    if (userAttempts.lockUntil > currentTime) {
      const remainingTime = Math.ceil((userAttempts.lockUntil - currentTime) / 1000 / 60) 
      displayError(loginErrorMsg, `비밀번호 5회 오류로 인해 ${remainingTime}분 후에 다시 시도해주세요.`, false);
      return false;
    }

    try {
        const response = await axios.post(serverLoginUrl, {
          email: email, password: password
        })
        const data = response.data;
        
          if (data.isLoggedIn) {
            // 로컬스트로지에 "isLoggedIn"(key), "true"(값)로 저장시킴
            localStorage.setItem("isLoggedIn", "true");
            // "nickname"키로 data.nickname값을 저장
            localStorage.setItem("nickname",data.nickname);

            localStorage.setItem("accessToken", data.token);

             if (loginAttempts[email]) {
              delete loginAttempts[email];
              setLoginAttempts(loginAttempts);
             }
                alert(`로그인 성공! 환영합니다, ${data.nickname}님!`);
                console.log("성공");

                window.location.href = "/feature-main/main.html"; // = # 안에 메인홈페이지 url
                return true; // 폼 제출 논리적 허용 (실제 제출은 막았음)
            } else {
              console.log("실패")
              // alert(`로그인 실패: ${data.message || '아이디 또는 비밀번호를 다시 확인해주세요.'}`);
              displayError(loginErrorMsg, data.message || "아이디 또는 비밀번호를 다시 확인해주세요.", false);
              userIdInput.value = "";
              userPasswordInput.value = ""; // 보안을 위해 비밀번호 필드만 비우는 것이 일반적
              validationStates.email = false;
              validationStates.password = false; // 비밀번호 유효성 상태 초기화
              userPasswordInput.focus(); // 비밀번호 필드에 포커스
              handleLoginFail(email, loginAttempts, userAttempts);
              return false; // 폼 제출 차단
            }
        } catch (error) {
        console.log("실패")
        console.error("로그인 요청 중 심각한 오류 발생:", error);
        alert("로그인 요청 중 문제가 발생했습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요. ");
        userPasswordInput.value = "";
        validationStates.password = false; // 비밀번호 유효성 상태 초기화
        userPasswordInput.focus(); // 비밀번호 필드에 포커스
        handleLoginFail(email, loginAttempts, userAttempts);
        return false; // 폼 제출 차단
    }
};

function getLoginAttempts() {
  return JSON.parse(localStorage.getItem("loginAttempts")) || {};
}

function setLoginAttempts(attemptsData) {
  localStorage.setItem("loginAttempts", JSON.stringify(attemptsData));
}

function handleLoginFail(email, loginAttempts, userAttempts) {
  const currentTime = new Date().getTime();
  userAttempts.attempts = (userAttempts.attempts || 0) + 1;

  if (userAttempts.attempts >= 5) {
    const lockDuration = 5 * 60 * 1000; // 5분
    userAttempts.lockUntil = currentTime + lockDuration;
    displayError(loginErrorMsg, `비밀번호 5회 오류로 인해 5분간 로그인이 잠금됩니다.`, false);
  } else {
    displayError(loginErrorMsg, `아이디 또는 비밀번호가 일치하지 않습니다. (오류 ${userAttempts.attempts}회)`, false);
  }

  loginAttempts[email] = userAttempts;
  setLoginAttempts(loginAttempts);

  userPasswordInput.value = "";
  userPasswordInput.focus();
}

document.addEventListener('DOMContentLoaded', () => {
    // 모든 에러 메시지 초기화 및 숨김
        document.getElementById("idError").style.display = 'none';
        document.getElementById("passwordError").style.display = 'none';
        document.getElementById("loginError").style.display = 'none';
    
         errorMessages.forEach(errorSpan => {
            errorSpan.style.display = 'none';
            errorSpan.textContent = ''; // 텍스트도 비워줍니다.
        });
    
    // validationStates도 초기화
    validationStates.email = false;
    validationStates.password = false;
    
    login.addEventListener("submit", check);
});