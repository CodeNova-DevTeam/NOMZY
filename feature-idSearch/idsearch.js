import {
    isValidName,
    isValidEmail,
} from "../jsUtil/jsUtil.js";

const idSearchForm = document.getElementById("idSearchForm");
const searchName = document.getElementById('userSearchName');
const searchNameError = document.getElementById('searchNameError');
const searchEmail  = document.getElementById('userSearchEmail');
const searchEmailError  = document.getElementById('searchEmailError');
const authenticationNumberButton = document.getElementById('authenticationNumberButton');
const authenticationNumber = document.getElementById('authenticationNumber'); // 인증번호 입력 필드
const authenticationNumberError = document.getElementById('authenticationNumberError');
const verifyAuthCodeButton = document.getElementById('verifyAuthCodeButton');

// 인증번호 발송 여부 및 일치 여부를 위한 전역 변수
let isAuthNumberSent = false; // 인증번호가 발송되었는지 여부를 체크하는 변수
let isAuthNumberVerified = false; // 인증번호가 올바르게 확인되었는지 체크하는 변수
let resendTimer = null;
let resendCooldown = 60;
// 실패 카운트 추적
let authFailCount = 0;
const MAX_AUTH_FAILS = 5;
// 잠금 여부 상태 변수
let isLocked = false;
let lockTimer = null;
const LOCK_DURATION_MS = 3 * 60 * 1000; // 3분
// 잠금 남은시간 갱신 타이머
let lockInterval = null;

// 각 입력 필드의 유효성 상태를 관리하는 객체
const validationStates = {
    name: false,
    email: false,
    authCode: false,
};

// 3. 이름 입력 필드 유효성 검사
searchName.addEventListener("blur", function () {
    const name = searchName.value.trim();
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

// 4. 이메일 입력 필드 유효성 검사
searchEmail.addEventListener("blur", function () {
    const email = searchEmail.value.trim();
    searchEmailError.style.display = "none";
    if (email === "") {
        searchEmailError.textContent = "이메일을 입력해주세요.";
        searchEmailError.style.display = "block";
        validationStates.email = false;
    } else if (!isValidEmail(email)) {
        searchEmailError.textContent = "올바른 이메일 형식이 아닙니다.";
        searchEmailError.style.display = "block";
        validationStates.email = false;
    } else {
        searchEmailError.style.display = "none";
        validationStates.email = true;
    }
});

// 인증번호 받기 버튼 클릭 이벤트서버 연동 주석 해제해서 써야됌
// 서버에서는 이 이름과 전화번호로 가입된 회원이 있는지 확인하고, 있으면
// 인증번호를 생성하여 해당 전화번호로 SMS를 발송하는 API를 구현해야함
authenticationNumberButton.addEventListener("click", async function (event) {
    event.preventDefault(); // 폼 제출 방지

    // validationStates를 활용하여 이름과 전화번호 유효성 검사
    if (!validationStates.name || !validationStates.email) {
        if (!validationStates.name) {
            searchNameError.textContent = "유효한 이름을 입력해주세요.";
            searchNameError.style.display = "block";
            searchName.focus();
        } else if (!validationStates.email) {
            searchEmailError.textContent = "유효한 이메일을 입력해주세요.";
            searchEmailError.style.display = "block";
            searchEmail.focus();
        }
        return;
    }

    if (authenticationNumberButton.disabled) return;

    const name = searchName.value.trim();
    const email = searchEmail.value.trim();
    const requestAuthNumberUrl = "http://192.168.0.110:8080/nomzy/#"; // 인증번호 요청 서버 API 엔드포인트 , 나중에 api 삽입해야함

    try {
        const response = await axios.post(requestAuthNumberUrl, {
            name: name,
            email: email
        }, {
            headers : {
            "Content-Type" : "application/json"
            // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
        const data = response.data;
        
            if (data.success) {
                alert("인증번호가 성공적으로 발송되었습니다. 이메일을 확인해주세요.");
                isAuthNumberSent = true; // 인증번호 발송 상태로 변경
                isAuthNumberVerified = false; // 아직 확인되지 않음
                validationStates.authCode = false; // 인증번호 재발송 시 상태 초기화

                authenticationNumberError.textContent = "인증번호가 발송되었습니다. 입력해주세요.";
                authenticationNumberError.style.color = "green";
                authenticationNumberError.style.display = "block";
                authenticationNumber.focus(); // 인증번호 입력 필드로 포커스 이동

                // 타이머 시작 (60초 재요청 방지)
                authenticationNumberButton.disabled = true;
                let timeLeft = resendCooldown;
                authenticationNumberButton.textContent = `${timeLeft}초 후 재요청 가능합니다.`;

                resendTimer = setInterval(() => {
                    timeLeft --;
                    if (timeLeft <= 0) {
                        clearInterval(resendTimer);
                        authenticationNumberButton.disabled = false;
                        authenticationNumberButton.textContent = "인증번호 받기";
                    } else {
                        authenticationNumberButton.textContent = `${timeLeft}초 후 재요청 가능합니다.`;
                    }
                }, 1000);
            } else {
                alert(`인증번호 발송 실패: ${data.message || '가입된 정보가 없거나 오류가 발생했습니다.'}`);
                authenticationNumberError.textContent = data.message || "인증번호 발송에 실패했습니다.";
                authenticationNumberError.style.color = "red";
                authenticationNumberError.style.display = "block";
                isAuthNumberSent = false;
                isAuthNumberVerified = false;
                validationStates.authCode = false; // 실패 시 상태 초기화
            }
    } catch (error) {
        console.error("인증번호 요청 중 오류 발생:", error);
        alert("네트워크 오류 또는 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        authenticationNumberError.textContent = "네트워크 오류로 인증번호 발송에 실패했습니다.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberSent = false;
        isAuthNumberVerified = false;
        validationStates.authCode = false; // 실패 시 상태 초기화
    }
});

// 인증번호 입력 필드 유효성 검사 로컬 스토리지 및 서버 연동 공통
// 사용자가 입력한 인증번호와 발송된 인증번호(또는 서버가 검증할 인증번호)를 비교
verifyAuthCodeButton.addEventListener("click", async function () {

    if (isLocked) {
        authenticationNumberButton.textContent = `5회 이상 인증 실패로 3분간 잠금되었습니다..`;
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        return;
    }

    const enteredAuthCode = authenticationNumber.value.trim();
    if (enteredAuthCode === "") {
        authenticationNumberError.textContent = "인증번호를 입력해주세요.";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false; // validationStates 업데이트
        return;
    }
    if (!isAuthNumberSent) {
        authenticationNumberError.textContent = "먼저 인증번호를 요청해주세요.";
        authenticationNumberError.style.display ="block";
        return;
    }
    // 서버 연동 버전에서 서버에 인증번호 확인 요청을 보냄 (주석 해제하여 사용)
    const verifyAuthUrl = "http://192.168.0.110:8080/nomzy/#"; // 인증번호 확인 서버 API 엔드포인트 나중에 삽입해야함
    try {
        const response = await axios.post(verifyAuthUrl, {
            email: searchEmail.value.trim(),
            authCode: enteredAuthCode
        }, {
            headers : {
            "Content-Type" : "application/json"
            // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
    });
        const data = response.data;
        if (data.success) {
            authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
            authenticationNumberError.style.color = "green";
            authenticationNumberError.style.display = "block";
            isAuthNumberVerified = true;
            validationStates.authCode = true; // validationStates 업데이트
            // 인증 성공시 실패 카운트 초기화
            authFailCount = 0;
        } else {
            authFailCount++;
            authenticationNumberError.textContent = data.message || "인증번호가 일치하지 않습니다.";
            authenticationNumberError.style.color = "red";
            authenticationNumberError.style.display = "block";
            isAuthNumberVerified = false;
            validationStates.authCode = false; // validationStates 업데이트
            // 5회 초과 시 잠금 처리
            if (authFailCount >= MAX_AUTH_FAILS) {
                isLocked = true;
                authenticationNumberError.textContent = "5회 이상 인증 실패로 3분간 잠금되었습니다.";
                authenticationNumberError.style.color = "red";
                authenticationNumberError.style.display = "block";
                // 버튼 잠금도 선택 가능
                verifyAuthCodeButton.disabled = true;

                let lockTimeLeft = LOCK_DURATION_MS / 1000; // 초단위
                showLockCountdown(lockTimeLeft);

                lockInterval = setInterval(() => {
                    lockTimeLeft--;
                    if (lockTimeLeft <= 0) {
                        clearInterval(lockInterval);
                        authenticationNumberError.textContent = "";
                    } else {
                        showLockCountdown(lockTimeLeft);
                    }
                }, 1000);

                lockTimer = setTimeout(() => {
                    isLocked = false;
                    verifyAuthCodeButton.disabled = false;
                    clearInterval(lockInterval);
                    authenticationNumberError.textContent = "";
                    authFailCount = 0;
                }, LOCK_DURATION_MS);                
            }           
        }
    } catch (error) {
        console.error("인증번호 확인 중 오류:", error);
        authenticationNumberError.textContent = "인증번호 확인 중 오류가 발생했습니다.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false; // validationStates 업데이트
    }
});

function showLockCountdown(seconds) {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    authenticationNumberError.textContent = `잠금 상태입니다. ${min}:${sec} 후 재시도 가능`;
}

// 최종 아이디 찾기 폼 제출 서버 연동 나중에 주석 해제
window.check = async function (event) {
    event.preventDefault(); // 폼 제출의 기본 동작 방지

    let isValidForm = true;

    // validationStates를 순회하며 모든 필드의 유효성 검사
    for (const key in validationStates) {
        if (!validationStates[key]) {
            isValidForm = false;
            // 유효하지 않은 첫 번째 필드로 스크롤 및 포커스
            switch(key) {
                case 'name':
                    searchName.focus();
                    break;
                case 'email':
                    searchEmail.focus();
                    break;
                case 'authCode':
                    authenticationNumber.focus();
                    break;
            }
            break; // 첫 번째 유효하지 않은 필드에서 중단
        }
    }

    // 추가적으로 인증번호가 발송되었는지, 인증번호가 확인되었는지 확인
    if (!isAuthNumberSent) {
        authenticationNumberError.textContent = "인증번호 받기 버튼을 눌러주세요.";
        authenticationNumberError.style.display = "block";
        isValidForm = false;
        authenticationNumberButton.focus();
    } else if (!isAuthNumberVerified) {
        authenticationNumberError.textContent = "인증번호 확인을 완료해주세요.";
        authenticationNumberError.style.display = "block";
        isValidForm = false;
        authenticationNumber.focus();
    }

    if (isValidForm) {
        // --- 서버에 아이디 찾기 요청 ---
        const findIdUrl = "http://192.168.0.110:8080/nomzy/#"; // 아이디 찾기 서버 API 엔드포인트 백엔드 url 삽입
        const name = searchName.value.trim();
        const email = searchEmail.value.trim();
        const enteredAuthCode = authenticationNumber.value.trim();

        try {
            const response = await axios.post(findIdUrl, {
                name: name,
                email: email,
                authCode: enteredAuthCode // 서버가 인증번호도 함께 검증하도록 전송
                
            }, {
                headers :{
                "Content-Type" : "application/json"
                // Authorization: `Bearer ${localStorage.getItem("token")}`                
            }});
            const data = response.data;

                if (data.success) {
                    alert(`회원님의 아이디는 ${data.email} 입니다.`);
                    console.log("아이디 찾기 성공:", data.email);
                    // 성공 후 로그인 페이지 등으로 이동
                    // window.location.href = '/templates/login.html';
                    idSearchForm.reset(); // 폼 필드 초기화
                    searchNameError.style.display = "none";
                    searchEmailError.style.display = "none";
                    authenticationNumberError.style.display = "none";
                    isAuthNumberSent = false;
                    isAuthNumberVerified = false;

                    window.location.href = "/feature-login/login";

                    // validationStates도 초기화
                    for (const key in validationStates) {
                        validationStates[key] = false;
                    }
                    return true;
                } else {
                    searchEmailError.textContent = data.message || '입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.';
                    return false;
                }
        } catch (error) {
            console.error("아이디 찾기 요청 중 오류 발생:", error);
            alert("네트워크 오류 또는 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
            return false;
        }
    } else {
        alert("입력한 정보를 다시 확인해주세요.");
        return false;
    }
};
idSearchForm.addEventListener("submit", check);