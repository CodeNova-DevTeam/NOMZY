import {
    isValidName,
    isValidTel,
    isAvailableTel,
    isValidPassword,
} from "../jsUtil/jsUtil.js";

const passwordSearchForm = document.getElementById("passwordSearchForm");

const userSearchName = document.getElementById('userSearchName');
const searchNameError = document.getElementById('searchNameError');

const userSearchTel = document.getElementById('userSearchTel');
const searchTelError = document.getElementById('searchTelError');

const authenticationNumberButton = document.getElementById('authenticationNumberButton');
const authenticationNumberInput = document.getElementById('authenticationNumber');
const authenticationNumberError = document.getElementById('authenticationNumberError');

const newPasswordInput = document.getElementById('newPassword'); // 새 비밀번호 입력
const newPasswordError = document.getElementById('newPasswordError');
const newPasswordConfirmInput = document.getElementById('newPasswordConfirm'); // 새 비밀번호 확인 필드
const newPasswordConfirmError = document.getElementById('newPasswordConfirmError');


let generatedAuthCode = "";
let isAuthNumberSent = false;
let isAuthNumberVerified = false;
let isUserIdentified = false;

const validationStates = {
    name: false,
    tel: false,
    authCode: false,
    newPassword: false,
    newPasswordConfirm: false,
};

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

// 전화번호 입력 필드 유효성 검사
userSearchTel.addEventListener("blur", function () {
    const tel = userSearchTel.value.trim();
    searchTelError.style.display = "none";

    if (tel === "") {
        searchTelError.textContent = "전화번호를 입력해주세요.";
        searchTelError.style.display = "block";
        validationStates.tel = false;
    } else if (!isValidTel(tel)) {
        searchTelError.textContent = "전화번호는 숫자만 입력이 가능합니다.";
        searchTelError.style.display = "block";
        validationStates.tel = false;
    } else if (!isAvailableTel(tel)) {
        searchTelError.textContent = "전화번호는 숫자 10자리 또는 11자리로 입력해야 합니다.";
        searchTelError.style.display = "block";
        validationStates.tel = false;
    } else {
        searchTelError.style.display = "none";
        validationStates.tel = true;
    }
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

// 인증번호 받기 버튼 클릭 이벤트 (서버 연동 버전)
authenticationNumberButton.addEventListener("click", async function (event) {
    event.preventDefault();

    if (!validationStates.name) {
        searchNameError.textContent = "유효한 이름을 입력해주세요.";
        searchNameError.style.display = "block";
        userSearchName.focus(); 
        return;
    }

    if (!validationStates.tel) {
        searchTelError.textContent = "유효한 전화번호를 입력해주세요.";
        searchTelError.style.display = "block";
        userSearchTel.focus();
        return; 
    }

    const name = userSearchName.value.trim();
    const tel = userSearchTel.value.trim();
    const requestAuthNumberUrl = "#"; // 인증번호 받기 api 추후 삽입

    try {
        const response = await fetch(requestAuthNumberUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name, tel: tel }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.success) {
                isUserIdentified = true;
                isAuthNumberSent = true;
                isAuthNumberVerified = false; 

                alert("인증번호가 성공적으로 발송되었습니다. SMS를 확인해주세요.");
                authenticationNumberError.textContent = "인증번호가 발송되었습니다. 입력해주세요.";
                authenticationNumberError.style.color = "green";
                authenticationNumberError.style.display = "block";
                authenticationNumberInput.focus();

            } else {
                alert(`인증번호 발송 실패: ${data.message || '가입된 정보가 없거나 오류가 발생했습니다.'}`);
                authenticationNumberError.textContent = data.message || "인증번호 발송에 실패했습니다.";
                authenticationNumberError.style.color = "red";
                authenticationNumberError.style.display = "block";
                isAuthNumberSent = false;
                isAuthNumberVerified = false;
                isUserIdentified = false;
            }
        } else {
            alert(`서버 오류: ${data.message || '인증번호 발송 중 서버 오류가 발생했습니다.'}`);
            authenticationNumberError.textContent = "서버 오류로 인증번호 발송에 실패했습니다.";
            authenticationNumberError.style.color = "red";
            authenticationNumberError.style.display = "block";
            isAuthNumberSent = false;
            isAuthNumberVerified = false;
            isUserIdentified = false;
        }
    } catch (error) {
        console.error("인증번호 요청 중 오류 발생:", error);
        alert("네트워크 오류 또는 서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.");
        authenticationNumberError.textContent = "네트워크 오류로 인증번호 발송에 실패했습니다.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberSent = false;
        isAuthNumberVerified = false;
        isUserIdentified = false;
    }
});


// 인증번호 입력 필드 유효성 검사
authenticationNumberInput.addEventListener("blur", function () {
    const enteredAuthCode = authenticationNumberInput.value.trim();
    if (enteredAuthCode === "") {
        authenticationNumberError.textContent = "인증번호를 입력해주세요.";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false;
        return;
    }
    
    if (isAuthNumberSent && isUserIdentified) {
        if (enteredAuthCode === generatedAuthCode) {
            authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
            authenticationNumberError.style.color = "green";
            authenticationNumberError.style.display = "block";
            isAuthNumberVerified = true;
            validationStates.authCode = true;

        } else {
            authenticationNumberError.textContent = "인증번호가 일치하지 않습니다.";
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

// 인증번호 입력 필드 유효성 검사 (서버 연동 버전)
authenticationNumberInput.addEventListener("blur", async function () {
    const enteredAuthCode = authenticationNumberInput.value.trim();

    if (enteredAuthCode === "") { 
        authenticationNumberError.textContent = "인증번호를 입력해주세요.";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false;
        return;
    }

    if (isAuthNumberSent && isUserIdentified) {
        const verifyAuthUrl = "#"; // 인증번호 발송 api 추후 삽입
        try {
            const response = await fetch(verifyAuthUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tel: userSearchTel.value.trim(),
                    authCode: enteredAuthCode
                })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
                authenticationNumberError.style.color = "green";
                authenticationNumberError.style.display = "block";
                isAuthNumberVerified = true;
                validationStates.authCode = true;
            } else {
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
                case 'tel':
                    userSearchTel.focus();
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
        const resetPasswordUrl = "#"; // 서버연동 추후삽입
        const name = userSearchName.value.trim();
        const tel = userSearchTel.value.trim();
        const enteredAuthCode = authenticationNumberInput.value.trim();
        const newPassword = newPasswordInput.value.trim();

        try {
            const response = await fetch(resetPasswordUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    tel: tel,
                    authCode: enteredAuthCode,
                    newPassword: newPassword
                }),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.success) {
                    alert("비밀번호가 성공적으로 재설정되었습니다. 새 비밀번호로 로그인해주세요.");
                    console.log("비밀번호 재설정 성공");
                    passwordSearchForm.reset();
                    searchNameError.style.display = "none";
                    searchTelError.style.display = "none";
                    authenticationNumberError.style.display = "none";
                    newPasswordError.style.display = "none";
                    newPasswordConfirmError.style.display = "none";
                    generatedAuthCode = "";
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
            } else {
                alert(`서버 오류: ${data.message || '비밀번호 재설정 중 서버 오류가 발생했습니다.'}`);
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
