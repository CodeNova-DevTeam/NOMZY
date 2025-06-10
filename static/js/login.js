import {
    isValidEmail,
} from "../jsUtil/jsUtil.js";


const userIdInput = document.getElementById("userId");
const emailErrorMessageLog = document.getElementById("idError");

const userPasswordInput = document.getElementById("userPassword");
const passwordErrorMessageLog = document.getElementById("passwordError");

const loginErrorMsg = document.getElementById("loginError");

// 각 입력 필드의 유효성 상태를 관리하는 객체
const validationStates = {
    email: false,
    password: false,
};

userIdInput.addEventListener("blur", function () {
    const email = userIdInput.value.trim();

    if (email === "") {
        emailErrorMessageLog.textContent = "아이디(이메일)를 입력해주세요.";
        emailErrorMessageLog.style.display = "block";
        validationStates.email = false;
    } else if (!isValidEmail(email)) {
        emailErrorMessageLog.textContent = "올바른 이메일 형식이 아닙니다.";
        emailErrorMessageLog.style.display = "block";
        validationStates.email = false;
    } else {
        emailErrorMessageLog.style.display = "none";
        validationStates.email = true; 
    }
});

userPasswordInput.addEventListener("blur", function () {
    const password = userPasswordInput.value.trim();

    if (password === "") {
        passwordErrorMessageLog.textContent = "비밀번호를 입력해주세요.";
        passwordErrorMessageLog.style.display = "block";
        validationStates.password = false;
    } else {
        passwordErrorMessageLog.style.display = "none";
        validationStates.password = true;
    }
});

window.check = async function (event) { // onsubmit="return check(event)" 형태로 호출되도록 'event' 객체를 받을수있게함
    event.preventDefault(); // 폼 제출의 기본 동작을 막기

    if (!validationStates.email) {
        if (userIdInput.value.trim() === "") {
            emailErrorMessageLog.textContent = "아이디(이메일)를 입력해주세요.";
        } else {
            emailErrorMessageLog.textContent = "올바른 이메일 형식이 아닙니다.";
        }
        emailErrorMessageLog.style.display = "block";
        userIdInput.focus();
        return false;
    } else {
        emailErrorMessageLog.style.display = "none";
    }

    if (!validationStates.password) {
        passwordErrorMessageLog.textContent = "비밀번호를 입력해주세요.";
        passwordErrorMessageLog.style.display = "block";
        userPasswordInput.focus();
        return false;
    } else {
        passwordErrorMessageLog.style.display = "none";
    }

    // 모든 클라이언트 측 유효성 검사를 통과했을 경우에만 서버로 전송
    const email = userIdInput.value.trim();
    const password = userPasswordInput.value.trim();
    const serverLoginUrl = "#"; // 여기( # )에 빽엔드 로그인 url 넣기

    try {
        const response = await fetch(serverLoginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.success) {
                alert(`로그인 성공! 환영합니다, ${data.user.nickname}님!`);
                console.log("로그인한 사용자 정보:", data.user);

                // 로그인 성공 시 폼 필드 초기화 및 에러 메시지 숨김
                userIdInput.value = "";
                userPasswordInput.value = "";
                emailErrorMessageLog.style.display = "none";
                passwordErrorMessageLog.style.display = "none";
                // validationStates도 초기화
                validationStates.email = false;
                validationStates.password = false;

                // window.location.href = "#"; = # 안에 메인홈페이지 url
                return true; // 폼 제출 논리적 허용 (실제 제출은 막았음)
            } else {
                alert(`로그인 실패: ${data.message || '아이디 또는 비밀번호를 다시 확인해주세요.'}`);
                userPasswordInput.value = ""; // 보안을 위해 비밀번호 필드만 비우는 것이 일반적
                validationStates.password = false; // 비밀번호 유효성 상태 초기화
                userPasswordInput.focus(); // 비밀번호 필드에 포커스
                return false; // 폼 제출 차단
            }
        } else { // 서버가 4xx 또는 5xx와 같은 에러 응답을 보낸 경우
            alert(`로그인 실패: ${data.message || '서버 오류가 발생했습니다.'}`);
            userPasswordInput.value = "";
            validationStates.password = false; // 비밀번호 유효성 상태 초기화
            userPasswordInput.focus(); // 비밀번호 필드에 포커스
            return false; // 폼 제출 차단
        }

    } catch (error) {
        console.error("로그인 요청 중 심각한 오류 발생:", error);
        alert("로그인 요청 중 문제가 발생했습니다. 네트워크 상태를 확인하거나 잠시 후 다시 시도해주세요. ");
        userPasswordInput.value = "";
        validationStates.password = false; // 비밀번호 유효성 상태 초기화
        userPasswordInput.focus(); // 비밀번호 필드에 포커스
        return false; // 폼 제출 차단
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const errorMessages = document.querySelectorAll('[name="errorMessage"]');
    errorMessages.forEach(errorSpan => {
        errorSpan.style.display = 'none';
    });
});




/*
// 비밀번호 5회 틀렸을시 잠금걸기기
// 로컬 스토리지에서 사용자 데이터를 가져오는 함수
function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

// 로컬 스토리지에 사용자 데이터를 저장하는 함수
function setUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

// 비밀번호 오류 횟수 및 잠금 상태를 관리하는 객체를 로컬 스토리지에서 가져오는 함수
function getLoginAttempts() {
  return JSON.parse(localStorage.getItem("loginAttempts")) || {};
}

// 비밀번호 오류 횟수 및 잠금 상태 객체를 로컬 스토리지에 저장하는 함수
function setLoginAttempts(attemptsData) {
  localStorage.setItem("loginAttempts", JSON.stringify(attemptsData));
}

// --- 로그인 처리 함수 (HTML의 onsubmit="return check(event)"에 맞춰 window.check로 변경) ---
window.check = function (event) { // 함수 이름이 window.check로 변경됨
  event.preventDefault(); // 폼 제출 시 페이지 새로고침 방지

  const email = userIdInput.value.trim(); // userIdInput 사용
  const password = userPasswordInput.value.trim(); // userPasswordInput 사용

  // 이메일 유효성 검사
  if (email === "") {
    loginErrorMsg.textContent = "이메일을 입력해주세요.";
    loginErrorMsg.style.display = "block";
    return false; // 로그인 실패 시 false 반환
  }
  if (!isValidEmail(email)) {
    loginErrorMsg.textContent = "유효하지 않은 이메일 형식입니다.";
    loginErrorMsg.style.display = "block";
    return false; // 로그인 실패 시 false 반환
  }

  // 비밀번호 유효성 검사
  if (password === "") {
    loginErrorMsg.textContent = "비밀번호를 입력해주세요.";
    loginErrorMsg.style.display = "block";
    return false; // 로그인 실패 시 false 반환
  }

  //계정 잠금 관련
  let loginAttempts = getLoginAttempts();
  const userAttempts = loginAttempts[email] || { attempts: 0, lockUntil: 0 };
  const currentTime = new Date().getTime(); // 현재 시간을 밀리초로 가져옴

  // 계정 잠금 여부 확인
  if (userAttempts.lockUntil > currentTime) {
    const remainingTime = Math.ceil((userAttempts.lockUntil - currentTime) / 1000 / 60); // 남은 시간 (분) 계산
    loginErrorMsg.textContent = `비밀번호 5회 오류로 인해 ${remainingTime}분 후에 다시 시도해주세요.`;
    loginErrorMsg.style.display = "block";
    return false; // 잠금 상태이므로 로그인 시도를 중단하고 false 반환
  }

  const users = getUsers(); // 모든 사용자 데이터 가져오기
  // 이메일과 비밀번호가 모두 일치하는 사용자 찾기
  const foundUser = users.find(
    (user) => user.email === email && user.password === password
  );

  if (foundUser) {
    // 로그인 성공
    loginErrorMsg.style.display = "none";
    alert("로그인 성공!");
    console.log("로그인 성공:", foundUser);

    // 로그인 성공 시 해당 사용자의 비밀번호 오류 횟수 및 잠금 상태 초기화
    if (loginAttempts[email]) {
      delete loginAttempts[email]; // 해당 이메일의 기록을 loginAttempts에서 삭제
      setLoginAttempts(loginAttempts); // 로컬 스토리지에 업데이트
    }

    // 로그인 상태 업데이트 (예: isLogin 속성을 true로 변경)
    const updatedUsers = users.map(user => {
      if (user.email === email) {
        return { ...user, isLogin: true }; // 로그인 상태를 true로 변경
      }
      return user;
    });
    setUsers(updatedUsers); // 변경된 사용자 데이터를 로컬 스토리지에 저장

    // 로그인 후 페이지 이동 (예: 메인 페이지)
    // window.location.href = '/main.html';
    return true; // 로그인 성공 시 true 반환
  } else {
    // 로그인 실패 (비밀번호 오류)

    // 비밀번호 오류 횟수 증가
    userAttempts.attempts = (userAttempts.attempts || 0) + 1;

    if (userAttempts.attempts >= 5) {
      // 5회 이상 틀렸을 경우 계정 잠금 (예: 5분)
      const lockDuration = 5 * 60 * 1000; // 5분 (밀리초)
      userAttempts.lockUntil = currentTime + lockDuration; // 잠금 해제 시간 설정
      loginErrorMsg.textContent = `비밀번호 5회 오류로 인해 5분 동안 로그인이 잠금됩니다.`;
    } else {
      loginErrorMsg.textContent = `이메일 또는 비밀번호가 일치하지 않습니다. (오류 ${userAttempts.attempts}회)`;
    }
    loginAttempts[email] = userAttempts; // 업데이트된 시도 기록을 loginAttempts에 저장
    setLoginAttempts(loginAttempts); // 로컬 스토리지에 업데이트

    loginErrorMsg.style.display = "block"; // 오류 메시지 표시
    return false; // 로그인 실패 시 false 반환
  }
};
*/