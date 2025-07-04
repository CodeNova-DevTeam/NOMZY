import {
    isValidName,
    isValidEmail,
    isValidPassword,
} from "../jsUtil/jsUtil.js";

// 추후 JWT토큰으로 로그인시 주석해제
// const token = localStorage.getItem("accessToken");
// if (!token) {
//   alert("토큰 없음. 로그인 필요");
//   return;
// }

const passwordSearchForm = document.getElementById("passwordSearchForm");
const userSearchName = document.getElementById('userSearchName');
const searchNameError = document.getElementById('searchNameError');
const userSearchEmail = document.getElementById('userSearchEmail');
const searchEmailError = document.getElementById('searchEmailError');
const authenticationNumberButton = document.getElementById('authenticationNumberButton');
const authenticationNumberInput = document.getElementById('authenticationNumber');
const authenticationNumberError = document.getElementById('authenticationNumberError');
const newPasswordInput = document.getElementById('newPassword'); // 새 비밀번호 입력
const newPasswordError = document.getElementById('newPasswordError');
const newPasswordConfirmInput = document.getElementById('newPasswordConfirm'); // 새 비밀번호 확인 필드
const newPasswordConfirmError = document.getElementById('newPasswordConfirmError');
const verifyAuthButton = document.getElementById("verifyAuthButton");

let isAuthNumberSent = false;
let isAuthNumberVerified = false;
let isUserIdentified = false;
// 실패 횟수 카운터 변수
let authFailCount = 0;
let isAuthLocked = false;
let authLockTimer = null;

let authTimer = null;
let timeLeft = 180;

const validationStates = {
    name: false,
    email: false,
    authCode: false,
    newPassword: false,
    newPasswordConfirm: false,
};

verifyAuthButton.addEventListener("click", function() {
    authenticationNumberInput.dispatchEvent(new Event("blur"));
})

// 이름 입력 필드 유효성 검사
userSearchName.addEventListener("blur", function () {
    const name = userSearchName.value.trim();
    if (name === "") {
        searchNameError.textContent = "이름을 입력해주세요.";
        searchNameError.style.display = "block";
        validationStates.name = false;
    } else if (!isValidName(name)) {
        searchNameError.textContent = "이름은 한글과 영문만 입력이 가능합니다.";
        searchNameError.style.display = "block";
        validationStates.name = false;
    } else {
        searchNameError.style.display = "none";
        validationStates.name = true;
    }
});

// 이메일 입력 필드 유효성 검사
userSearchEmail.addEventListener("blur", function () {
    const email = userSearchEmail.value.trim();
    searchEmailError.style.display = "none";

    if (email === "") {
        searchEmailError.textContent = "이메일을 입력해주세요.";
        searchEmailError.style.display = "block";
        validationStates.email = false;
    } else if (!isValidEmail(email)) {
        searchEmailError.textContent = "올바른 이메일 형식을 입력해주세요.";
        searchEmailError.style.display = "block";
        validationStates.email = false;
    } else {
        searchEmailError.style.display = "none";
        validationStates.email = true;
    }
});

userSearchEmail.addEventListener("input", () => {
    isUserIdentified = false;
    isAuthNumberSent = false;
    isAuthNumberVerified = false;

    authenticationNumberInput.value = "";
    authenticationNumberInput.disabled = true;
    authenticationNumberError.textContent = "";
    authTimerDisplay.textContent = "";
    clearInterval(authTimer);
});

// 새 비밀번호 입력 필드 유효성 검사
newPasswordInput.addEventListener("blur", function () {
    const password = newPasswordInput.value.trim();
    if (password === "") {
        newPasswordError.textContent = "새 비밀번호를 입력해주세요.";
        newPasswordError.style.display = "block";
        validationStates.newPassword = false;
    } else if (!isValidPassword(password)) {
        newPasswordError.textContent = "비밀번호는 8~16자의 영문, 숫자, 특수문자 조합이어야 합니다.";
        newPasswordError.style.display = "block";
        validationStates.newPassword = false;
    } else {
        newPasswordError.style.display = "none";
        validationStates.newPassword = true;
    }
    if (newPasswordConfirmInput.value.trim() !== "") {
        newPasswordConfirmInput.dispatchEvent(new Event('blur'));
    }
});

// 새 비밀번호 확인 입력 필드 유효성 검사
newPasswordConfirmInput.addEventListener("blur", function () {
    const password = newPasswordInput.value.trim();
    const confirmPassword = newPasswordConfirmInput.value.trim();

    if (confirmPassword === "") {
        newPasswordConfirmError.textContent = "새 비밀번호를 다시 입력해주세요.";
        newPasswordConfirmError.style.display = "block";
        validationStates.newPasswordConfirm = false;
    } else if (password !== confirmPassword) {
        newPasswordConfirmError.textContent = "비밀번호가 일치하지 않습니다.";
        newPasswordConfirmError.style.display = "block";
        validationStates.newPasswordConfirm = false;
    } else {
        newPasswordConfirmError.style.display = "none";
        validationStates.newPasswordConfirm = true;
    }
});

// 인증번호 입력 필드 유효성 검사 (서버 연동 버전)
authenticationNumberInput.addEventListener("blur", async function () {

    if (isAuthLocked) {
        authenticationNumberError.textContent = "5회 이상 틀렸습니다. 3분 후 다시 시도해주세요.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        return;
    }
    const enteredAuthCode = authenticationNumberInput.value.trim();

    if (enteredAuthCode === "") { 
        authenticationNumberError.textContent = "인증번호를 입력해주세요.";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false;
        return;
    }
    // 인증시간 만료된 
    if (timeLeft <= 0) {
        authenticationNumberError.textContent = "⛔ 인증 시간이 만료되었습니다, 인증번호를 다시 요청해주세요."
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false;
        return;
    }

    if (isAuthNumberSent && isUserIdentified) {
        const verifyAuthUrl = "http://192.168.0.110:8080/nomzy/verifycode"; // 인증번호 발송 api 추후 삽입
        try {
            const response = await axios.post(verifyAuthUrl, {
                email: userSearchEmail.value.trim(),
                authCode: enteredAuthCode
            }, {
                headers : {
                    "Content-Type" : "application/json",
                        // Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = response.data;
            if (data.success) {
                authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
                authenticationNumberError.style.color = "green";
                authenticationNumberError.style.display = "block";
                isAuthNumberVerified = true;
                validationStates.authCode = true;

                authFailCount = 0;
            } else {
                authFailCount++;
                if (authFailCount >= 5) {
                    isAuthLocked = true;
                    authenticationNumberInput.disabled = true;
                    authenticationNumberInput.classList.add("locked");
                    authenticationNumberError.textContent = "5회 이상 실패하여 인증이 잠겼습니다. 3분 후 다시 시도해주세요.";
                    authenticationNumberError.style.color = "red";
                    authenticationNumberError.style.display = "block";

                    authLockTimer = setTimeout(() => {
                        isAuthLocked = false;
                        authFailCount = 0;
                        authenticationNumberInput.disabled = false;
                        authenticationNumberInput.classList.remove("locked");
                        authenticationNumberError.textContent = "인증 잠금이 해제되었습니다. 다시 입력해주세요.";
                        authenticationNumberError.style.color = "green";
                        authenticationNumberError.style.display = "block";
                    }, 180000);
                    return;
                }                    
                    authenticationNumberError.textContent = data.message || "인증번호가 일치하지 않습니다.";
                    authenticationNumberError.style.color = "red";
                    authenticationNumberError.style.display = "block";
                    isAuthNumberVerified = false;
                    validationStates.authCode = false;
            }
        } catch (error) {
            console.error("인증번호 확인 중 오류:", error);
            authenticationNumberError.textContent = "인증번호 확인 중 오류가 발생했습니다.";
            authenticationNumberError.style.color = "red";
            authenticationNumberError.style.display = "block";
            isAuthNumberVerified = false;
            validationStates.authCode = false;
        }
    } else {
        authenticationNumberError.textContent = "인증번호를 먼저 요청하거나, 입력된 정보가 올바른지 확인해주세요.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false;
    }
});

authenticationNumberInput.addEventListener("focus", function () {
    if (!isAuthNumberSent) {
        authenticationNumberError.textContent = "먼저 인증번호를 받아주세요.";
        authenticationNumberError.style.color = "gray";
        authenticationNumberError.style.display = "block";
    }
});

function startAuthTimer() {
    clearInterval(authTimer);
    timeLeft = 180;
    const display = document.getElementById("authTimerDisplay");
    display.style.display = "block";
    display.style.color = "gray";
    display.style.fontWeight = "normal";

    authenticationNumberButton.disabled = true; // 인증요청 버튼 비활성화

    authTimer = setInterval(() => {
        const min = Math.floor(timeLeft / 60);
        const sec = timeLeft % 60;
        display.textContent = `⏳ 남은 시간 : ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    
        if (--timeLeft < 0) {
            clearInterval(authTimer);

            display.textContent = "⛔ 인증 시간이 만료되었습니다. 인증번호를 다시 요청해주세요.";
            display.style.color = "red";
            display.style.fontWeight = "bold";
            
            authenticationNumberInput.disabled = true;
            authenticationNumberButton.disabled = false;
            isAuthNumberSent = false;
            isUserIdentified = false;
        }
    }, 1000);
}

// 인증번호 받기 버튼 클릭 이벤트 (서버 연동 버전)
authenticationNumberButton.addEventListener("click", async function (event) {

    event.preventDefault();

    if (!validationStates.name) {
        searchNameError.textContent = "유효한 이름을 입력해주세요.";
        searchNameError.style.display = "block";
        userSearchName.focus(); 
        return;
    }
    if (!validationStates.email) {
        searchEmailError.textContent = "유효한 이메일형식을 입력해주세요.";
        searchEmailError.style.display = "block";
        userSearchEmail.focus();
        return; 
    }
    const name = userSearchName.value.trim();
    const email = userSearchEmail.value.trim();
    const requestAuthNumberUrl = "http://192.168.0.110:8080/nomzy/verifycode"; // 인증번호 받기 api 추후 삽입

    try {
        const response = await axios.post(requestAuthNumberUrl, {
            name: name,
            email: email
        }, {
            headers : {
                "Content-Type" : "application/json",
                // Authorization: `Bearer ${localStorage.getItem("token")}`
           }
        });

        const data = response.data;
        if (data.success) {
            isUserIdentified = true;
            isAuthNumberSent = true;
            isAuthNumberVerified = false; 

            alert("인증번호가 성공적으로 발송되었습니다. 이메일을 확인해주세요.");
            authenticationNumberError.textContent = "인증번호가 발송되었습니다. 입력해주세요.";
            authenticationNumberError.style.color = "green";
            authenticationNumberError.style.display = "block";
            authenticationNumberInput.focus();

            authenticationNumberInput.disabled = false;

            // 기존타이머 정리 및 초기화
            clearInterval(authTimer);
            const timerDisplay = document.getElementById("authTimerDisplay");
            timerDisplay.textContent = "";
            timerDisplay.style.color = "gray";
            timerDisplay.style.fontWeight = "normal";

            startAuthTimer();
        } else {
            alert(`인증번호 발송 실패: ${data.message || '가입된 정보가 없거나 오류가 발생했습니다.'}`);
            authenticationNumberError.textContent = data.message || "인증번호 발송에 실패했습니다.";
            authenticationNumberError.style.color = "red";
            authenticationNumberError.style.display = "block";
            isAuthNumberSent = false;
            isAuthNumberVerified = false;
            isUserIdentified = false;
        }
    } catch (error) {
        console.error("인증번호 요청 중 오류 발생 : ", error);
        alert("네트워크 오류 또는 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        authenticationNumberError.textContent = "네트워크 오류로 인증번호 발송에 실패했습니다.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberSent = false;
        isAuthNumberVerified = false;
        isUserIdentified = false;
    }
});



// 최종 비밀번호 재설정 폼 제출 이벤트 (서버 연동 버전)
window.check = async function (event) {
    event.preventDefault();

    let isValidForm = true;

    for (const key in validationStates) {
        if (!validationStates[key]) {
            isValidForm = false;
            switch(key) {
                case 'name':
                    userSearchName.focus();
                    break;
                case 'email':
                    userSearchEmail.focus();
                    break;
                case 'authCode':
                    authenticationNumberInput.focus();
                    break;
                case 'newPassword':
                    newPasswordInput.focus();
                    break;
                case 'newPasswordConfirm':
                    newPasswordConfirmInput.focus();
                    break;
            }
            break; 
        }
    }

    if (!isAuthNumberSent) {
        authenticationNumberError.textContent = "인증번호 받기 버튼을 눌러주세요.";
        authenticationNumberError.style.display = "block";
        isValidForm = false;
        authenticationNumberButton.focus();
    } else if (!isUserIdentified) {
        authenticationNumberError.textContent = "이름과 전화번호로 사용자 인증을 먼저 진행해주세요.";
        authenticationNumberError.style.display = "block";
        isValidForm = false;
        userSearchName.focus();
    } else if (!isAuthNumberVerified) { // 인증번호가 아직 확인되지 않은 경우
        authenticationNumberError.textContent = "인증번호 확인을 완료해주세요.";
        authenticationNumberError.style.display = "block";
        isValidForm = false;
        authenticationNumberInput.focus();
    }

    if (isValidForm) {
        const resetPasswordUrl = "http://192.168.0.110:8080/nomzy/resetpassword"; // 서버연동 추후삽입
        const name = userSearchName.value.trim();
        const email = userSearchEmail.value.trim();
        const enteredAuthCode = authenticationNumberInput.value.trim();
        const newPassword = newPasswordInput.value.trim();

        try {
            const response = await axios.post(resetPasswordUrl, {                
                name: name,
                email: email,
                authCode: enteredAuthCode,
                newPassword: newPassword
            }, {
                headers : {
                    "Content-Type" : "application/json",
                     // Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });
            const data = response.data;
                if (data.success) {
                    alert("비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.");
                    console.log("비밀번호 재설정 성공");
                    passwordSearchForm.reset();
                    searchNameError.style.display = "none";
                    searchEmailError.style.display = "none";
                    authenticationNumberError.style.display = "none";
                    newPasswordError.style.display = "none";
                    newPasswordConfirmError.style.display = "none";
                    isAuthNumberSent = false;
                    isAuthNumberVerified = false;
                    isUserIdentified = false;

                    window.location.href = "/feature-login/login.html";

                    // validationStates도 초기화
                    for (const key in validationStates) {
                        validationStates[key] = false;
                    }
                    return true;
                } else {
                    alert(`비밀번호 재설정 실패: ${data.message || '입력하신 정보가 일치하지 않거나 오류가 발생했습니다.'}`);
                    return false;
                }
        } catch (error) {
            console.error("비밀번호 재설정 요청 중 오류 발생:", error);
            alert("네트워크 오류 또는 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
            return false;
        }
    } else {
        alert("입력한 정보를 다시 확인해주세요.");
        return false;
    }
};
passwordSearchForm.addEventListener("submit", check);

