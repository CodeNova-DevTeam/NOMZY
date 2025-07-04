import {
    isValidEmail,
    isValidPassword,
    isValidNickname,
    isValidName,
    isValidBirth,
    isValidTel,
    isAvailableTel,
    isAuthCodeFormatValid,
} from "../jsUtil/jsUtil.js";

// 1. DOM(Document Object Model) 요소들을 가져오는 부분
const joinForm = document.getElementById("joinForm");
const userIdInput = document.getElementById("userId");
const emailErrorMessageLog = document.getElementById("duplicateEmailAuthenticationError");
const userPasswordInput = document.getElementById("userPassword");
const passwordErrorMessageLog = document.getElementById("passwordError");
const userTruePasswordCheck = document.getElementById("userTruePassword");
const passwordMismatchErrorLog = document.getElementById("passwordMismatchError");
const userNicknameCheck = document.getElementById("userNickname");
const duplicateNicknameCheck = document.getElementById("duplicateNicknameAuthentication");
const duplicateNicknameAuthenticationErrorCheck = document.getElementById("duplicateNicknameAuthenticationError");
const userNameCheck = document.getElementById("userName");
const userNameErrorCheck = document.getElementById("userNicknameError");
const userBirthCheck = document.getElementById("userBirth");
const userBirthFormatErrorCheck = document.getElementById("birthFormatError");
const userTelCheck = document.getElementById("userTel");
const telFormatErrorCheck = document.getElementById("telFormatError");
const telInvalidErrorCheck = document.getElementById("telInvalidError");
const maleCheck = document.getElementById("male");
const femaleCheck = document.getElementById("female");
const genderErrorCheck = document.getElementById("genderError");
const telecomCheck = document.getElementById("telecom");
const telecomErrorCheck = document.getElementById("telecomError");

const emailAuthCodeInput = document.getElementById("emailAuthCode");
const emailAuthCodeErrorLog = document.getElementById("emailAuthCodeError");
const verifyEmailAuthCodeButton = document.getElementById("verifyEmailAuthCode");

// [추가] 이메일 인증 타이머 및 재요청 버튼 관련 DOM 요소
const emailAuthTimerDisplay = document.getElementById("emailAuthTimer"); // 타이머 표시용 요소
const requestAuthCodeButton = document.getElementById("requestAuthCode"); // 인증번호 재요청 버튼 (이메일 중복확인 버튼과 분리)

let emailAuthAttemptCount = 0; // 인증 요청 횟수 카운터
const MAX_AUTH_ATTEMPTS = 5; // 최대 허용 횟수
const AUTH_LOCK_DURATION = 5 * 60 * 1000;
let emailAuthLockedUntil = null;

// 필드별 유효성 상태를 관리하는 객체 (새로 추가)
// 모든 검사할 항목을 하나의 배열에 담아서 일시로 검사시킴
// 기본값을 false로 둬서 검사전 or 실패상태로 둠
// 모든 입력값이 true가 돼서 최종제출 검사 통과시 제출되게 함
// validationStates : 검증상태
const validationStates = {
    email: false,
    emailDuplicated: false, // 이메일 중복확인 완료 여부
    password: false,
    passwordMatch: false, // 비밀번호 확인 일치 여부
    nickname: false,
    nicknameDuplicated: false, // 닉네임 중복확인 완료 여부
    name: false,
    birth: false,
    tel: false,
    gender: false,
    telecom: false,
    emailCodeVerified: false,
    // 각 입력 항목이 기본 false값이라 전부 true로 통과해야 최종제출 가능.
};

// 이메일 인증 관련 전역 변수수
let authTimer = null;
let timeLeft = 0;

// 에러 메시지를 표시하는 범용 함수 , 이러면 함수하나만 호출해서 에러메세지 출력 할 수 있음
// element : 에러 메세지를 넣을 HTML요소( 보통은 <span> )
// message : 에러 메세지
// isValid : true, false를 비교
function displayError(element, message, isValid , color) {
    if (isValid) { // 성공시 에러메세지 초기화 , true로 설정시 에러메세지 숨김
            element.textContent = message || "";
            element.style.color = color || "";
            element.style.display = message ? "block" : "none";
        } else { // 실패시 에러메세지 출력 , false로 설정시 에러메세지 출력
            // element( sapn ) 요소에 message를 띄움.
            element.textContent = message;
            element.style.color = color || "red";
            element.style.display = "block";
    }
}
function focusWithError(inputElement, errorElement, message) {
    displayError(errorElement, message, false, "red");
    inputElement.focus();
}

// [추가] 이메일 인증 관련 UI 상태 설정 함수
function setEmailAuthUIState(isEmailValidAndDuplicated = false, isCodeSent = false, isCodeVerified = false) {
    // 이메일 중복 확인 버튼 (requestAuthCodeButton으로 역할 변경)
    requestAuthCodeButton.disabled = isCodeSent && !isCodeVerified; // 인증번호 발송 후, 인증 완료 전까지 비활성화
    // 인증번호 입력 필드
    emailAuthCodeInput.disabled = !isCodeSent || isCodeVerified; // 인증번호 발송 전, 인증 완료 후에 비활성화
    // 인증번호 확인 버튼
    verifyEmailAuthCodeButton.disabled = !isCodeSent || isCodeVerified; // 인증번호 발송 전, 인증 완료 후에 비활성화

    if (isCodeVerified) {
        displayError(emailAuthCodeErrorLog, "이메일 인증이 완료되었습니다.", true, "green");
        emailAuthTimerDisplay.style.display = "none"; // 타이머 숨김
        requestAuthCodeButton.textContent = "인증 완료"; // 버튼 텍스트 변경
        requestAuthCodeButton.disabled = true; // 인증 완료 시 버튼 비활성화
    } else if (isCodeSent) {
        displayError(emailErrorMessageLog, "인증번호를 확인해주세요.", false, "green"); // 인증번호 발송 메시지
        emailAuthTimerDisplay.style.display = "block"; // 타이머 표시
    } else if (isEmailValidAndDuplicated) {
        displayError(emailErrorMessageLog, "이메일 중복확인 완료. 인증번호 요청이 필요합니다.", true, "green");
        requestAuthCodeButton.disabled = false; // 중복 확인 완료 후 인증번호 요청 가능
    } else {
        displayError(emailErrorMessageLog, "이메일 중복확인이 필요합니다.", false, "red");
        emailAuthTimerDisplay.style.display = "none";
        requestAuthCodeButton.disabled = false;
    }
}

// [추가] 타이머 시작 함수
function startAuthTimer() {
    clearInterval(authTimer); // 기존 타이머가 있다면 중지
    timeLeft = 180; // 3분 = 180초
    emailAuthTimerDisplay.style.display = "block"; // 타이머 표시

    authTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        emailAuthTimerDisplay.textContent = `남은 시간: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (timeLeft <= 0) {
            clearInterval(authTimer);

            authTimer = null;
            timeLeft = 180;

            displayError(emailAuthCodeErrorLog, "인증 시간이 만료되었습니다. 다시 요청해주세요.", false, "red");
            setEmailAuthUIState(true, false, false); // 재요청 버튼 활성화 (이메일 중복 확인은 유효한 상태)
            validationStates.emailCodeVerified = false; // 인증 상태 초기화
            emailAuthCodeInput.value = ""; // 입력된 인증번호 초기화
            emailAuthTimerDisplay.textContent = ""; // 타이머 텍스트 초기화

            requestAuthCodeButton.textContent = "다시 요청하기";
            emailAuthCodeInput.focus();
        }
        timeLeft--;
    }, 1000);
}


// --- 이메일 유효성 검사 및 중복 확인 ---
userIdInput.addEventListener("blur", () => {
    const email = userIdInput.value.trim();
    if (email === "") { // email 이 공백 ( "" ) 이면 실행
        displayError(emailErrorMessageLog, "이메일을 입력해주세요.", false, "red");
        validationStates.email = false;
    } else if (!isValidEmail(email)) { // !isValidEmail(email) : 미리 설정해둔 이메일 유효성 검사의 양식이 아니면
        displayError(emailErrorMessageLog, "올바른 이메일 형식이 아닙니다.", false, "red");
        validationStates.email = false;
    } else {
        displayError(emailErrorMessageLog, "이메일 중복확인이 필요합니다.", false , "red"); // 중복확인 필요 메시지는 빨간색
        validationStates.email = true;
    }
    // [추가]
    setEmailAuthUIState(validationStates.email && validationStates.emailDuplicated, false, validationStates.emailCodeVerified);
});
userIdInput.addEventListener("input", () => {
    const email = userIdInput.value.trim();
    if (email === "") { // email 이 공백 ( "" ) 이면 실행
        displayError(emailErrorMessageLog, "이메일을 입력해주세요.", false, "red");
        validationStates.email = false;
    } else if (!isValidEmail(email)) { // !isValidEmail(email) : 미리 설정해둔 이메일 유효성 검사의 양식이 아니면
        displayError(emailErrorMessageLog, "올바른 이메일 형식이 아닙니다.", false, "red");
        validationStates.email = false;
    } else {
        displayError(emailErrorMessageLog, "이메일 중복확인이 필요합니다.", false , "red"); // 중복확인 필요 메시지는 빨간색
        validationStates.email = true;
    }
    // [추가]
    setEmailAuthUIState(validationStates.email && validationStates.emailDuplicated, false, validationStates.emailCodeVerified);
});


// 이메일을 입력 중일 때 (문자 하나라도 바뀌면)
// 이전에 중복확인은 무효 처리
userIdInput.addEventListener("input", () => {
    validationStates.emailDuplicated = false;
    // [밑에 전부 추가]
    validationStates.emailCodeVerified = false;
    clearInterval(authTimer); // 이메일 변경 시 타이머 중지
    emailAuthTimerDisplay.textContent = "";
    emailAuthCodeInput.value = "";
    setEmailAuthUIState(false, false, false); // UI 초기화
    displayError(emailAuthCodeErrorLog, "", true);
    // 까지
});


// 이메일 중복 확인 서버 통신 버전
requestAuthCodeButton.addEventListener('click', async function () {

    const email = userIdInput.value.trim();
    // const infoSpan = document.getElementById("emailRequestInfo");
    // const blockedEmail = JSON.parse(localStorage.getItem("blockedEmailList") || "[]");

    // // 해당 이메일이 차단되었는지 검사
    // if (email && blockedEmail.includes(email)) {
    //     infoSpan.textContent = "이 이메일은 차단되어 있습니다. 관리자에게 문의하세요.";
    //     infoSpan.style.color = "red";
    //     return;
    // }

    // // 인증 시도 횟수 6회 초과 시 이메일 차단
    // if (emailAuthAttemptCount >= MAX_AUTH_ATTEMPTS) {
    //     if (!blockedList.includes(email)) {
    //         blockedList.push(email);
    //         localStorage.setItem("blockedEmail", userIdInput.value.trim());
    //     }
    //     infoSpan.textContent = "인증 요청이 5회를 초과하여 이 이메일은 차단되었습니다.";
    //     infoSpan.style.color = "red";
    //     return;
    // }

    // 이미 인증번호 발송된경우
    if (authTimer && timeLeft > 0) {
        const infoSpan = document.getElementById("emailRequestInfo");
        infoSpan.textContent = `이미 인증번호가 발송되었습니다. 남은 시간: ${Math.floor(timeLeft / 60)}분 ${timeLeft % 60}초`;
        return;
    }
    
    // 이메일 유효성 먼저 확인
    if (email === "") {
        focusWithError(userIdInput, emailErrorMessageLog, "이메일을 입력해주세요.", false, "red");
        // 유저가 이메일을 입력하지 않앗거나 잘못 입력했을때 자동으로 이동(focus)시켜줌
        // 모든 검사가 필요한 입력칸에 해주면 편의성 개선
        validationStates.email = false;
        validationStates.emailDuplicated = false;
        setEmailAuthUIState(false, false, false); // 추가
        return;
    } else if (!isValidEmail(email)) {
        focusWithError(userIdInput, emailErrorMessageLog, "유효한 이메일 형식이 아닙니다.", false, "red");
        validationStates.email = false;
        validationStates.emailDuplicated = false;
        setEmailAuthUIState(false, false, false); // 추가
        return;
    }

    const allowedDomains = ["@gmail.com", "@naver.com", "@daum.net", "@kakao.com", "@nate.com"];
    const isDomainAllowed = allowedDomains.some(domain =>
        email.toLowerCase().endsWith(domain));
    if (!isDomainAllowed) {
        displayError(emailErrorMessageLog, "구글/네이버/다음/카카오/네이트 이메일만 사용 가능합니다", false, "red")
        // 밑에 추가가
        validationStates.email = false;
        validationStates.emailDuplicated = false;
        setEmailAuthUIState(false, false, false);
        return;
    }

    // [추가] 인증번호 재요청 시 타이머 초기화 및 버튼 비활성화
    if (authTimer) {
        clearInterval(authTimer);
    }
    requestAuthCodeButton.disabled = true; // 요청 중 버튼 비활성화
    displayError(emailErrorMessageLog, "인증번호 발송 중...", true, "blue"); // 여기까지 추가

    const checkUrl = `http://192.168.0.110:8080/nomzy/checkemail?email=${encodeURIComponent(email)}`;
    try {
        const response = await axios.get(checkUrl,{
            // headers: {
            // Authorization: `Bearer ${localStorage.getItem("token")}`
            // }
        });
        const data = response.data;

            if (data?.isDuplicate) {
                displayError(emailErrorMessageLog, "이미 사용중인 이메일 입니다.", false, "red");
                // 여기부터터 추가
                validationStates.emailDuplicated = false;
                requestAuthCodeButton.disabled = false; // 실패 시 버튼 재활성화
                setEmailAuthUIState(false, false, false);
                // 여기까지 추가
                return;
            } else {
                displayError(emailErrorMessageLog, "사용 가능한 이메일입니다. 인증번호를 발송합니다.", true, "green");
                validationStates.emailDuplicated = true;

                // 증번호 자동 요청
                const sendCodeUrl = `http://192.168.0.110:8080/nomzy/sendcode`;
                const sendCodeRes = await axios.post(sendCodeUrl, { email }, {
                    // headers: {
                    // Authorization: `Bearer ${localStorage.getItem("token")}`
                    // }
                });

                const sendCodeData = sendCodeRes.data;
            
                if (sendCodeData.success) {
                    emailAuthAttemptCount++;
                    alert("인증번호가 발송되었습니다. 메일함을 확인해주세요.");
                    // 추가
                    setEmailAuthUIState(true, true, false); // 인증번호 발송 상태로 UI 업데이트
                    startAuthTimer(); // 타이머 시작
                    // 여기까지
                } else {
                    displayError(emailErrorMessageLog, sendCodeData.message || "인증번호 발송에 실패했습니다.", false, "red");
                    // 추가
                    requestAuthCodeButton.disabled = false; // 실패 시 버튼 재활성화
                    setEmailAuthUIState(true, false, false); // 이메일 중복은 확인되었지만 인증번호 발송 실패 상태
                    // 까지지
                }
            }
    } catch (error) {
        console.error("이메일 중복 확인 또는 인증번호 요청 중 오류 발생 : ", error);
        displayError(emailErrorMessageLog, "네트워크 오류 또는 서버에 연결할 수 없습니다.", false, "red");
        validationStates.emailDuplicated = false;
        // 여기부터 추가
        requestAuthCodeButton.disabled = false; // 실패 시 버튼 재활성화
        setEmailAuthUIState(false, false, false);
        // 까지
    }
});


// 인증번호 확인 기능
verifyEmailAuthCodeButton.addEventListener("click", async () => {

    const email = userIdInput.value.trim();
    const authCode = emailAuthCodeInput.value.trim();

    // [추가] 이미 인증 완료 상태라면 더 이상 진행하지 않음
    if (validationStates.emailCodeVerified) {
        alert("이미 이메일 인증이 완료되었습니다.");
        return;
    }

    // 빈값검사
    if (authCode === "") {
        displayError(emailAuthCodeErrorLog, "인증번호를 입력해주세요.", false, "red")
        validationStates.emailCodeVerified = false;
        return;
    }
    // 형식검사
    if (!isAuthCodeFormatValid(authCode)) {
        displayError(emailAuthCodeErrorLog, "인증번호는 6자리 숫자여야 합니다.", false, "red");
        validationStates.emailCodeVerified = false;
        return;
    }

    const verifyUrl = `http://192.168.0.110:8080/nomzy/verifycode`;
    try {
        const response = await axios.post(verifyUrl, {
            email,
            code : authCode
        }
        // , {
        //     headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`
        //     }
        // }
    );
        const data = response.data;

        if (data?.success) {
            // console.log(data)
            emailAuthAttemptCount = 0; // 인증 성공 시 횟수 초기화
            displayError(emailAuthCodeErrorLog, "이메일 인증이 완료되었습니다.", true, "green");
            validationStates.emailCodeVerified = true;
            // 추가
            clearInterval(authTimer); // 인증 성공 시 타이머 중지
            emailAuthTimerDisplay.style.display = "none"; // 타이머 숨김
            setEmailAuthUIState(true, true, true); // 인증 완료 상태로 UI 업데이트
            // 까지
            userIdInput.disabled = true; // 이메일 입력창 비활성화
        } else {
            displayError(emailAuthCodeErrorLog, data.message || "인증번호가 일치하지 않습니다.", false, "red");

            emailAuthCodeErrorLog.classList.add("shake");
            setTimeout(() => emailAuthCodeErrorLog.classList.remove("shake"), 300);
            emailAuthCodeInput.focus();
            validationStates.emailCodeVerified = false;
            // 추가
            setEmailAuthUIState(true, true, false); // 인증 실패 상태로 UI 업데이트
        }
    } catch(error) {
        console.error("이메일 인증번호 확인 중 오류 : ",error);
        displayError(emailAuthCodeErrorLog, "서버 오류 또는 네트워크 문제입니다.", false, "red");
        validationStates.emailCodeVerified = false;
        // 추가
        setEmailAuthUIState(true, true, false); // 인증 실패 상태로 UI 업데이트
    }
});


// --- 비밀번호 유효성 검사 ---
userPasswordInput.addEventListener("blur", function () {

    const password = userPasswordInput.value.trim();

    if (password === "") {
        displayError(passwordErrorMessageLog, "비밀번호를 입력해주세요.", false, "red");
        validationStates.password = false;
    } else if (!isValidPassword(password)) {
        displayError(passwordErrorMessageLog,
            "비밀번호는 8~16자 사이의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.(공백불가)", false, "red");
        validationStates.password = false;
    } else {
        // 형식이 올바른 경우 에러메세지 숨김
        displayError(passwordErrorMessageLog, "", true);
        validationStates.password = true;
    }
    checkPasswordMatch(); // 비밀번호 입력이 끝나면 비밀번호 확인도 체크
});
userPasswordInput.addEventListener("input", function () {

    const password = userPasswordInput.value.trim();

    if (password === "") {
        displayError(passwordErrorMessageLog, "비밀번호를 입력해주세요.", false, "red");
        validationStates.password = false;
    } else if (!isValidPassword(password)) {
        displayError(passwordErrorMessageLog,
            "비밀번호는 8~16자 사이의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.(공백불가)", false, "red");
        validationStates.password = false;
    } else {
        // 형식이 올바른 경우 에러메세지 숨김
        displayError(passwordErrorMessageLog, "", true);
        validationStates.password = true;
    }
    checkPasswordMatch(); // 비밀번호 입력이 끝나면 비밀번호 확인도 체크
});
userPasswordInput.addEventListener("input", function () {
    // 비밀번호를 입력 할 때마다 확인창도 같이 blur 이벤트 발생시켜서 두개를 동시에 비교
    userTruePasswordCheck.dispatchEvent(new Event("blur"));
});

userTruePasswordCheck.addEventListener("blur", function () {
    // 포커스를 잃으면 비밀번호 일치 여부 확인
    checkPasswordMatch();
});
// 비밀번호 입력과 입력한 비밀번호가 일치하는지 비교하는 함수
function checkPasswordMatch() {
    const confirmPassword = userTruePasswordCheck.value.trim();
    const password = userPasswordInput.value.trim();
    // console.log(password);
    if (confirmPassword === "") {
        displayError(passwordMismatchErrorLog, "비밀번호 확인을 입력해주세요.", false, "red");
        validationStates.passwordMatch = false;
        return false;
        // 입력한 비밀번호와 같은지 같지않은지 비교
    } else if (password !== confirmPassword) {
        displayError(passwordMismatchErrorLog, "비밀번호가 일치하지 않습니다.", false, "red");
        validationStates.passwordMatch = false;
        return false;
    } else {
        displayError(passwordMismatchErrorLog, "", true);
        validationStates.passwordMatch = true;
        return true;
    }
}


// --- 닉네임 유효성 검사 및 중복 확인 ---
userNicknameCheck.addEventListener("blur", function () {
    const nickname = userNicknameCheck.value.trim();
    if (nickname === "") {
        displayError(userNicknameErrorCheck, "닉네임을 입력해주세요.", false, "red");
        validationStates.nickname = false;
    } else if (!isValidNickname(nickname)) {
        displayError(userNicknameErrorCheck, "닉네임은 12자리 이하 영문대/소문자,숫자.한글만 가능합니다.", false, "red");
        validationStates.nickname = false;
    } else {
        // displayError(userNicknameErrorCheck, "", true);
        displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인이 필요합니다.", false, "red");
        validationStates.nickname = true;
    }
});
userNicknameCheck.addEventListener("input", function () {
    const nickname = userNicknameCheck.value.trim();
    if (nickname === "") {
        displayError(userNicknameErrorCheck, "닉네임을 입력해주세요.", false, "red");
        validationStates.nickname = false;
    } else if (!isValidNickname(nickname)) {
        displayError(userNicknameErrorCheck, "닉네임은 12자리 이하 영문대/소문자,숫자.한글만 가능합니다.", false, "red");
        validationStates.nickname = false;
    } else {
        // displayError(userNicknameErrorCheck, "", true);
        displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인이 필요합니다.", false, "red");
        validationStates.nickname = true;
    }
});
userNicknameCheck.addEventListener("input", () => {
    // 사용자가 먼저 입력한 닉네임을 변경시 이전 중복확인 결과는 무효화.
    validationStates.nicknameDuplicated = false;
    displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인이 필요합니다.", false, "red");
});


// 닉네임 중복 확인 서버 통신 버전
duplicateNicknameCheck.addEventListener("click", async function () {

    const nickname = userNicknameCheck.value.trim();

    // 닉네임 유효성 먼저 확인
    if (nickname === "") {
        focusWithError(userNicknameCheck, duplicateNicknameAuthenticationErrorCheck, "닉네임을 입력해주세요.");
        validationStates.nickname = false;
        validationStates.nicknameDuplicated = false;
        return;
    } else if (!isValidNickname(nickname)) {
        focusWithError(userNicknameCheck, duplicateNicknameAuthenticationErrorCheck, "닉네임은 12자리 이하 영문대/소문자,숫자.한글만 가능합니다.");
        validationStates.nickname = false;
        validationStates.nicknameDuplicated = false;
        return;
    }

    const params = new URLSearchParams({ nickname }); // 2개 이상의 객체로 넘길시 nickname : nickname 등으로 붙여야함
    const checkNicknameUrl = `http://192.168.0.110:8080/nomzy/checknickname?${params}`;

    try {
        const response = await axios.get(checkNicknameUrl , {
            // headers: {
            // Authorization: `Bearer ${localStorage.getItem("token")}`
            // }
        });
        const data = response.data;
            if (data?.isDuplicate) {
                displayError(duplicateNicknameAuthenticationErrorCheck, "이미 사용중인 닉네임 입니다.", false, "red");
                validationStates.nicknameDuplicated = false;
            } else {
                displayError(duplicateNicknameAuthenticationErrorCheck, "사용 가능한 닉네임 입니다.", true , "green");
                validationStates.nicknameDuplicated = true;
                // console.log(nickname);
            }
    } catch (error) {
        console.error("닉네임 중복 확인 요청 중 오류 발생:", error);
        displayError(duplicateNicknameAuthenticationErrorCheck, "네트워크 오류 또는 서버에 연결할 수 없습니다.", false, "red");
        validationStates.nicknameDuplicated = false;
    }
});


// --- 이름 유효성 검사 ---
userNameCheck.addEventListener("blur", function () {
    const name = userNameCheck.value.trim();
    if (name === "") {
        displayError(userNameErrorCheck, "이름을 입력해주세요.", false, "red");
        validationStates.name = false;
    } else if (!isValidName(name)) {
        displayError(userNameErrorCheck, "이름은 한글과 영문만 가능합니다", false, "red");
        validationStates.name = false;
    } else {
        displayError(userNameErrorCheck, "", true);
        validationStates.name = true;
    }
});
userNameCheck.addEventListener("input", function () {
    const name = userNameCheck.value.trim();
    if (name === "") {
        displayError(userNameErrorCheck, "이름을 입력해주세요.", false, "red");
        validationStates.name = false;
    } else if (!isValidName(name)) {
        displayError(userNameErrorCheck, "이름은 한글과 영문만 가능합니다", false, "red");
        validationStates.name = false;
    } else {
        displayError(userNameErrorCheck, "", true);
        validationStates.name = true;
    }
});


// --- 생년월일 유효성 검사 ---
userBirthCheck.addEventListener("blur", function () {
    const birth = userBirthCheck.value.trim();
    if (birth === "") {
        displayError(userBirthFormatErrorCheck, "생년월일을 입력해주세요.", false, "red");
        validationStates.birth = false;
    } else if (!isValidBirth(birth)) {
        displayError(userBirthFormatErrorCheck, "올바른 생년월일 형식이 아닙니다. (예: 19900101)", false, "red");
        validationStates.birth = false;
    } else {
        displayError(userBirthFormatErrorCheck, "", true);
        validationStates.birth = true;
    }
});
userBirthCheck.addEventListener("input", function () {
    const birth = userBirthCheck.value.trim();
    if (birth === "") {
        displayError(userBirthFormatErrorCheck, "생년월일을 입력해주세요.", false, "red");
        validationStates.birth = false;
    } else if (!isValidBirth(birth)) {
        displayError(userBirthFormatErrorCheck, "올바른 생년월일 형식이 아닙니다. (예: 19900101)", false, "red");
        validationStates.birth = false;
    } else {
        displayError(userBirthFormatErrorCheck, "", true);
        validationStates.birth = true;
    }
});


// 사용자가 전화번호 입력시 자동으로 하이폰 삽입
userTelCheck.addEventListener("input", function(){
    // 현재 입력된 값에서 숫자만 남기고 모든 특수문자 제거(하이폰 포함)
    // replace : 문자열에서 특정 부분을 바꿔주는 함수
    // / ... / = 정규식 시작과 끝
    // [^0-9] 대괄호 안의 ^는 부정(not)의 뜻 = 0-9를 제외한 문자
    // g = global 옵션 전체 문자열을 대상으로 반복 검색해 바꿈 (한 번만이 아니라 전부)
    // /[^0-9]/g,"" = 0-9를 제외한 모든 문자들을 ""(공백으로) 바꾸라는뜻
    let input = userTelCheck.value.replace(/[^0-9]/g,"");
    if (input.length <= 3) { // 만약에 입력한 숫자가 3이하일 경우
        userTelCheck.value = input; // 입력 값 그대로 유지
    } else if (input.length <= 7){ // 만약에 입력한 숫자가 7 이하일 경우

        // \d : 숫자 1개를 의미
        // {3} 숫자 3개를 묶음 = \d{3} 숫자 3개
        // () 안의 내용물을 1개로 묶으란뜻 $1, $2 등으로 개수에 맞게 $숫자 로 불러옴
        // (\d{3}) === 숫자 3개 $1 로 기억함
        // (\d{4}) === 숫자 4개 $2 로 기억
        // $1 - === -는 자동 하이폰 뭘 넣느냐에 따라 자동삽입 되는게 다름 .이나 ,를 넣으면 010,1234 or 010.1234 이런식으로도 변경 가능
        userTelCheck.value = input.replace(/(\d{3})(\d{1,4})/,"$1-$2");
    } else {
        // (\d{1,4}) === 숫자 1~4개 $3로 기억함
        userTelCheck.value = input.replace(/(\d{3})(\d{4})(\d{1,4})/,"$1-$2-$3");
        // 최종적으로 01012345678 입력시 010-1234-5678 형식으로 변환시켜줌
    }
});

// 사용자가 전화번호를 입력하다가 백스페이스로 지울 때
// 하이폰이 선택된 위치에 자동 포커스 이동
userTelCheck.addEventListener("keydown", function(e){ // keydown === 키보드를 누를때

    const value = userTelCheck.value;
    const key = e.key; // 사용자가 누른 키를 반복적으로 확인 ㅁㄴㅇ 를 입력하면 ㅁㄴㅇ를 반복적으로 확인함
    if(key === "Backspace"){ // 만약 사용자가 백스페이스를 눌럿으면
        const pos = userTelCheck.selectionStart; // 커서(입력위치)의 현재 인덱스 위치를 가져옴
                                                 //  ㄴ selectionStart === input/textarea 전용 내장 속성
        if(value[pos - 1] === "-"){ // 커서 바로앞의 문자가 하이폰(-) 이면 === 010- 이면
            userTelCheck.setSelectionRange(pos - 1, pos - 1); // 하이폰 앞으로 커서를 한 칸 더 이동시켜서 백스페이스로 하이폰도 지우게함 010 (- 삭제)
        }
    }
});


// --- 전화번호 유효성 검사 ---
userTelCheck.addEventListener("blur", function () {
    const tel = userTelCheck.value.replace(/-/g, "").trim();
    
    if (tel === "") {
        displayError(telFormatErrorCheck, "전화번호를 입력해주세요.", false, "red");
        validationStates.tel = false;
    } else if (!isValidTel(tel)) {
        displayError(telFormatErrorCheck, "전화번호는 숫자만 입력이 가능합니다.", false, "red");
        validationStates.tel = false;
    } else if (!isAvailableTel(tel)) {
        displayError(telInvalidErrorCheck, "전화번호는 10자리 또는 11자리 숫자만 가능합니다.", false, "red");
        validationStates.tel = false;
    } else {
        displayError(telFormatErrorCheck, "", true); // 기존 에러 메시지 초기화
        displayError(telInvalidErrorCheck, "", true); // 기존 에러 메시지 초기화
        validationStates.tel = true;
    }
});
userTelCheck.addEventListener("input", function () {
    const tel = userTelCheck.value.replace(/-/g, "").trim();
    
    if (tel === "") {
        displayError(telFormatErrorCheck, "전화번호를 입력해주세요.", false, "red");
        validationStates.tel = false;
    } else if (!isValidTel(tel)) {
        displayError(telFormatErrorCheck, "전화번호는 숫자만 입력이 가능합니다.", false, "red");
        validationStates.tel = false;
    } else if (!isAvailableTel(tel)) {
        displayError(telInvalidErrorCheck, "전화번호는 10자리 또는 11자리 숫자만 가능합니다.", false, "red");
        validationStates.tel = false;
    } else {
        displayError(telFormatErrorCheck, "", true); // 기존 에러 메시지 초기화
        displayError(telInvalidErrorCheck, "", true); // 기존 에러 메시지 초기화
        validationStates.tel = true;
    }
});


// --- 성별 선택 유효성 검사 ---
// 라디오 버튼 변경 시 유효성 검사
[maleCheck, femaleCheck].forEach(radio => {
    radio.addEventListener("change", checkGenderSelection);
});

function checkGenderSelection() {
    const selectedGender = maleCheck.checked || femaleCheck.checked;
    if (!selectedGender) {
        displayError(genderErrorCheck, "성별을 선택해주세요.", false, "red");
        validationStates.gender = false;
    } else {
        displayError(genderErrorCheck, "", true);
        validationStates.gender = true;
    }
}


// --- 통신사 선택 유효성 검사 ---
telecomCheck.addEventListener("change", () => {
    const selected = telecomCheck.value; // 현재 선택된 통신사 값을 가져옴

    if (selected === "" || selected === "선택") {
        // 1. "선택" 또는 공백일 경우: 아직 선택 안 된 상태로 처리
        displayError(telecomErrorCheck, "통신사를 선택해주세요.", false, "red");
        validationStates.telecom = false;
    } else {
        // 2. 정식 통신사 선택 완료 시 에러 제거 및 상태 true
        displayError(telecomErrorCheck, "", true);
        validationStates.telecom = true;
    }
});


// 최종 유효성 체크 및 서버 통신 버전
window.check = async function (event) {
    event.preventDefault(); 
    
    let isValidForm = true; // ture면 전부 통과한 상태
                            //  ㄴ 하나라도 실패하면 false로 바꾸고 전송을 막음
                            //  ㄴ firstInvalidField === 포커스를 어디로 줄지 추적용
    let firstInvalidField = null; // 첫 번째 유효하지 않은 필드를 저장

    // 사용자가 직접 입력하지 않아도 강제로 blur나 change 이벤트를 발생시켜 유효성 검사 실행
    //   ㄴ 상단에 있는 이메일이나 비밀번호등을 건너뛰고 입력시 건너 뛴 입력칸을 추적해서 알려줌
    // 각 필드의유효성 검사 로직은 blur나 change 이벤트에 연결되어 있기 때문
    userIdInput.dispatchEvent(new Event('blur'));
    userPasswordInput.dispatchEvent(new Event('blur'));
    userTruePasswordCheck.dispatchEvent(new Event('blur'));
    userNicknameCheck.dispatchEvent(new Event('blur'));
    userNameCheck.dispatchEvent(new Event('blur'));
    userBirthCheck.dispatchEvent(new Event('blur'));
    userTelCheck.dispatchEvent(new Event('blur'));
    checkGenderSelection(); // 성별 유효성 검사 함수 호출
    telecomCheck.dispatchEvent(new Event('change')); // 통신사 유효성 검사 강제 실행

    if (!validationStates.emailDuplicated && validationStates.email) {
        displayError(emailErrorMessageLog, "이메일 중복확인을 완료해야 합니다.", false, "red");
        userIdInput.focus();
        isValidForm = false;
        return false;
    }
    if (!validationStates.emailCodeVerified) {
        displayError(emailAuthCodeErrorLog, "이메일 인증번호 확인이 필요합니다.", false, "red");
        emailAuthCodeInput.focus();
        isValidForm = false;
        return false;
    }
    if (!validationStates.nicknameDuplicated && validationStates.nickname) {
            displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인을 완료해야 합니다.", false, "red");
            userNicknameCheck.focus();
            isValidForm = false;
            return false; // 더 이상 진행하지 않고 바로 리턴
        }

    // validationStates 객체의 모든 값들이 true인지 확인하여 폼 전체의 유효성을 검사
    for (const key in validationStates) {
        // validationStates 객체에 담긴 모든 필드(key)에 대해 검사 === 저장된 email이나 password등 key로 일괄 검사
        if (!validationStates[key]) {
            isValidForm = false;
            // 첫 번째 유효하지 않은 필드를 찾아서 포커스를 이동
            if (!firstInvalidField) {
                switch (key) {
                    case 'email':
                    case 'emailDuplicated': // 이메일 필드와 관련된 에러
                        firstInvalidField = userIdInput;
                        break;
                    case 'password':
                        firstInvalidField = userPasswordInput;
                        break;
                    case 'passwordMatch':
                        firstInvalidField = userTruePasswordCheck;
                        break;
                    case 'nickname':
                    case 'nicknameDuplicated': // 닉네임 필드와 관련된 에러
                        firstInvalidField = userNicknameCheck;
                        break;
                    case 'name':
                        firstInvalidField = userNameCheck;
                        break;
                    case 'birth':
                        firstInvalidField = userBirthCheck;
                        break;
                    case 'tel':
                        firstInvalidField = userTelCheck;
                        break;
                    case 'gender':
                        firstInvalidField = maleCheck; // 라디오 버튼 중 하나에 포커스
                        break;
                    case 'telecom':
                        firstInvalidField = telecomCheck;
                        break;
                }
            }
        }
    }

    if (!isValidForm) {
        alert("회원가입 실패. 입력 내용을 다시 확인해주세요.");
        if (firstInvalidField) {
            firstInvalidField.focus(); // 첫 번째 유효하지 않은 필드로 포커스 이동
        }
        return false;
    }

    const selectedGender = maleCheck.checked ? "male" : femaleCheck.checked ? "female" : "";

    // 모든 필드가 유효하면 서버로 데이터 전송
    const registerUrl = "http://192.168.0.110:8080/nomzy/signup"; // 가상 서버 URL 예시 (실제 서버 URL로 변경 필요)

    const newUserData = {
        email: userIdInput.value.trim(),
        password: userPasswordInput.value.trim(), // 실제 서비스에서는 비밀번호를 서버에서 해싱해야 합니다!
        nickname: userNicknameCheck.value.trim(),
        name: userNameCheck.value.trim(),
        birthDate: userBirthCheck.value.trim(),
        phoneNumber: userTelCheck.value.trim(),
        gender: selectedGender,
        mobileCarrier: telecomCheck.value,
    };
    // console.log(newUserData);
    try {
        const response = await axios.post(registerUrl, newUserData, {
            // headers: {
            // Authorization: `Bearer ${localStorage.getItem("token")}`
            // }
        });

        const data = response.data;
            if (data?.success === true) {
                
                alert("회원가입 성공!");

                // 폼 필드 초기화 및 에러 메시지 숨김
                joinForm.reset(); // 모든 에러메세지를 숨김
                // 모든 에러 메시지 초기화
                document.querySelectorAll('[name="errorMessage"]').forEach(errorSpan => {
                    errorSpan.style.display = 'none';
                    errorSpan.textContent = ''; // 텍스트도 비워줌.
                });

                // 회원가입 성공 후에는 모두 false로 초기화해서
                // 다음 사용자가 입력 할 시 다시 유효성 검사를 처음부터 시작하도록 만듬
                // validationStates도 초기화
                for (const key in validationStates) {
                    validationStates[key] = false;
                }
                // 추가
                clearInterval(authTimer); // 성공 시 타이머 중지
                setEmailAuthUIState(false, false, false); // UI 상태 초기화
                emailAuthTimerDisplay.textContent = ""; // 타이머 텍스트 초기화
                // 까지
                window.location.href = '/feature-login/login.html'; // 로그인 페이지로 리다이렉트
                return true;
            } else {
                alert(`회원가입 실패: ${data.message || "다시 시도해주세요."}`);
                return false;
            }
    } catch (error) {
        console.error("회원가입 요청 중 심각한 오류 발생:", error);
        alert("회원가입 요청 중 문제가 발생했습니다. 네트워크 상태를 확인해주세요.");
        return false;
    }
};

// 페이지 로드 시 모든 에러 메시지 숨김 및 validationStates 초기화
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[name="errorMessage"]').forEach(errorSpan => {
        errorSpan.style.display = 'none';
    });
    emailAuthCodeInput.value = "";
    emailAuthTimerDisplay.textContent = "";

    // 초기 validationStates 설정 (필요에 따라 일부는 true로 시작할 수도 있음)
    for (const key in validationStates) {
        validationStates[key] = false;
    }
    // [추가] 초기 UI 상태 설정
    setEmailAuthUIState(false, false, false);
 
    joinForm.addEventListener("submit", check);
});
