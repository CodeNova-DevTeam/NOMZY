import {
    isValidEmail,
    isValidPassword,
    isValidNickname,
    isValidName,
    isValidBirth,
    isValidTel,
    isAvailableTel,
} from "../jsUtil/jsUtil.js";

// 1. DOM(Document Object Model) 요소들을 가져오는 부분
const joinFormInput = document.getElementById("joinForm");
const userIdInput = document.getElementById("userId");
const duplicateEmailButtonCheck = document.getElementById("duplicateEmailAuthentication");
const emailErrorMessageLog = document.getElementById("duplicateEmailAuthenticationError");
const userPasswordInput = document.getElementById("userPassword");
const passwordErrorMessageLog = document.getElementById("passwordError");
const userTruePasswordCheck = document.getElementById("userTruePassword");
const passwordMismatchErrorLog = document.getElementById("passwordMismatchError");
const userNicknameCheck = document.getElementById("userNickname");
const duplicateNicknameCheck = document.getElementById("duplicateNicknameAuthentication");
const userNicknameErrorCheck = document.getElementById("nicknameError");
const duplicateNicknameAuthenticationErrorCheck = document.getElementById("duplicateNicknameAuthenticationError");
const userNameCheck = document.getElementById("userName");
const userNameErrorCheck = document.getElementById("nameFormatError");
const userBirthCheck = document.getElementById("userBirth");
const userBirthFormatErrorCheck = document.getElementById("birthFormatError");
const userTelCheck = document.getElementById("userTel");
const telFormatErrorCheck = document.getElementById("telFormatError");
const telInvalidErrorCheck = document.getElementById("telInvalidError");
const maleCheck = document.getElementById("male");
const femaleCheck = document.getElementById("female");
const genderErrorCheck = document.getElementById("genderError");
const telcomCheck = document.getElementById("telecom");
const telecomErrorCheck = document.getElementById("telecomError");


// 필드별 유효성 상태를 관리하는 객체 (새로 추가)
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
};


// 에러 메시지를 표시하는 범용 함수
function displayError(element, message, isValid) {
    if (isValid) {
        element.style.display = "none";
    } else {
        element.textContent = message;
        element.style.color = "red";
        element.style.display = "block";
    }
}


// --- 이메일 유효성 검사 및 중복 확인 ---
userIdInput.addEventListener("blur", function () {
    const email = userIdInput.value.trim();
    if (email === "") {
        displayError(emailErrorMessageLog, "이메일을 입력해주세요.", false);
        validationStates.email = false;
    } else if (!isValidEmail(email)) {
        displayError(emailErrorMessageLog, "올바른 이메일 형식이 아닙니다.", false);
        validationStates.email = false;
    } else {
        displayError(emailErrorMessageLog, "이메일 중복확인이 필요합니다.", false); // 중복확인 필요 메시지는 빨간색
        emailErrorMessageLog.style.color = "red"; // 중복확인 필요 메시지는 빨간색으로 유지
        validationStates.email = true;
    }
    validationStates.emailDuplicated = false; // 이메일 값 변경 시 중복확인 다시 필요
});

// 이메일 중복 확인 서버 통신 버전
duplicateEmailButtonCheck.addEventListener('click', async function () {
    const email = userIdInput.value.trim();

    // 이메일 유효성 먼저 확인
    if (email === "") {
        displayError(emailErrorMessageLog, "이메일을 입력해주세요.", false);
        userIdInput.focus();
        validationStates.email = false;
        validationStates.emailDuplicated = false;
        return;
    } else if (!isValidEmail(email)) {
        displayError(emailErrorMessageLog, "유효한 이메일 형식이 아닙니다.", false);
        userIdInput.focus();
        validationStates.email = false;
        validationStates.emailDuplicated = false;
        return;
    }

    // const emailUrl = "http://100.74.28.37:8080/api/checkEmail"; // 나중에 서버로 보낼 url
    const emailUrl = `http://100.74.28.37:8080/api/checkEmail?email=${encodeURIComponent(email)}`; // 나중에 서버로 보낼 url

    

    try {
        const response = await fetch(emailUrl, {
            method: "GET",
            credentials: "include",
            // headers: {
            //     "Content-Type": "application/json",
            // },
            // body: JSON.stringify({ email: email }),
        });

        
        

        const data = await response.json();

        if (response.ok) { // 서버 응답이 2xx 성공 코드인 경우
            if (data.isDuplicate) { // 서버가 중복이라고 응답

                //    showError("이미 사용 중인 이메일입니다.");
                //     validationStates["emailDuplicated"] = false;
                // } else {
                //     showSuccess("사용 가능한 이메일입니다.");
                //     validationStates["emailDuplicated"] = true;
                // }
                displayError(emailErrorMessageLog, "이미 사용중인 이메일 입니다.", false);
                validationStates.emailDuplicated = false;
            } else { // 서버가 사용 가능하다고 응답
                emailErrorMessageLog.textContent = "사용 가능한 이메일입니다.";
                emailErrorMessageLog.style.color = "green";
                emailErrorMessageLog.style.display = "block";
                validationStates.emailDuplicated = true;
                console.log(email);
            }
        } else { // 서버 응답이 4xx, 5xx 등 에러 코드인 경우
            displayError(emailErrorMessageLog, `오류: ${data.message || '이메일 중복 확인 중 서버 오류가 발생했습니다.'}`, false);
            validationStates.emailDuplicated = false;
        }
    } catch (error) {
        console.error("이메일 중복 확인 요청 중 오류 발생:", error);
        displayError(emailErrorMessageLog, "네트워크 오류 또는 서버에 연결할 수 없습니다.", false);
        validationStates.emailDuplicated = false;
    }
});


// --- 비밀번호 유효성 검사 ---
userPasswordInput.addEventListener("blur", function () {
    const password = userPasswordInput.value.trim();
    if (password === "") {
        displayError(passwordErrorMessageLog, "비밀번호를 입력해주세요.", false);
        validationStates.password = false;
    } else if (!isValidPassword(password)) {
        displayError(passwordErrorMessageLog,
            "비밀번호는 8~16자 사이의 영문 대/소문자, 숫자, 특수문자를 포함해야 합니다.(공백불가)", false);
        validationStates.password = false;
    } else {
        displayError(passwordErrorMessageLog, "", true);
        validationStates.password = true;
    }
    checkPasswordMatch(); // 비밀번호 입력 후 비밀번호 확인도 체크
});

userTruePasswordCheck.addEventListener("blur", function () {
    checkPasswordMatch();
});

function checkPasswordMatch() {
    const confirmPassword = userTruePasswordCheck.value.trim();
    const password = userPasswordInput.value.trim();
    
    console.log(password);

    if (confirmPassword === "") {
        displayError(passwordMismatchErrorLog, "비밀번호 확인을 입력해주세요.", false);
        validationStates.passwordMatch = false;
        return false;
    } else if (password !== confirmPassword) {
        displayError(passwordMismatchErrorLog, "비밀번호가 일치하지 않습니다.", false);
        validationStates.passwordMatch = false;
        return false;
    } else {
        displayError(passwordMismatchErrorLog, "", true);
        validationStates.passwordMatch = true;
        return true;
    }
}
// console.log(password);
// --- 닉네임 유효성 검사 및 중복 확인 ---
userNicknameCheck.addEventListener("blur", function () {
    const nickname = userNicknameCheck.value.trim();
    if (nickname === "") {
        displayError(userNicknameErrorCheck, "닉네임을 입력해주세요.", false);
        validationStates.nickname = false;
    } else if (!isValidNickname(nickname)) {
        displayError(userNicknameErrorCheck, "닉네임은 12자 이하 공백/특수문자 사용불가", false);
        validationStates.nickname = false;
    } else {
        displayError(userNicknameErrorCheck, "", true);
        displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인이 필요합니다.", false); // 중복확인 필요 메시지는 빨간색
        duplicateNicknameAuthenticationErrorCheck.style.color = "red"; // 중복확인 필요 메시지는 빨간색으로 유지
        validationStates.nickname = true;
    }
    validationStates.nicknameDuplicated = false; // 닉네임 값 변경 시 중복확인 다시 필요
});

// 닉네임 중복 확인 서버 통신 버전
duplicateNicknameCheck.addEventListener("click", async function () {
    const nickname = userNicknameCheck.value.trim();

    // 닉네임 유효성 먼저 확인
    if (nickname === "") {
        displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임을 입력해주세요.", false);
        userNicknameCheck.focus();
        validationStates.nickname = false;
        validationStates.nicknameDuplicated = false;
        return;
    } else if (!isValidNickname(nickname)) {
        displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임은 12자리 이하 영문대/소문자,숫자.한글만 가능합니다.", false);
        userNicknameCheck.focus();
        validationStates.nickname = false;
        validationStates.nicknameDuplicated = false;
        return;
    }


    // const checkNicknameUrl = "http://100.74.28.37:8080/api/checkNickname"; // 가상 서버 URL 예시
    const checkNicknameUrl = `http://100.74.28.37:8080/api/checkNickname?nickname=${encodeURIComponent(nickname)}`; // 나중에 서버로 보낼 url

    try {
        const response = await fetch(checkNicknameUrl, {
            method: "GET",
            credentials: "include",
            // headers: {
            //     "Content-Type": "application/json",
            // },
            // body: JSON.stringify({ nickname: nickname }),
        });

        const data = await response.json();

        if (response.ok) {
            if (data.isDuplicate) {
                displayError(duplicateNicknameAuthenticationErrorCheck, "이미 사용중인 닉네임 입니다.", false);
                validationStates.nicknameDuplicated = false;
            } else {
                duplicateNicknameAuthenticationErrorCheck.textContent = "사용 가능한 닉네임 입니다.";
                duplicateNicknameAuthenticationErrorCheck.style.color = "green";
                duplicateNicknameAuthenticationErrorCheck.style.display = "block";
                validationStates.nicknameDuplicated = true;
                console.log(nickname);
            }
        } else {
            displayError(duplicateNicknameAuthenticationErrorCheck, `오류: ${data.message || "닉네임 중복 확인 중 서버 오류가 발생했습니다."}`, false);
            validationStates.nicknameDuplicated = false;
        }
    } catch (error) {
        console.error("닉네임 중복 확인 요청 중 오류 발생:", error);
        displayError(duplicateNicknameAuthenticationErrorCheck, "네트워크 오류 또는 서버에 연결할 수 없습니다.", false);
        validationStates.nicknameDuplicated = false;
    }
});

// --- 이름 유효성 검사 ---
userNameCheck.addEventListener("blur", function () {
    const name = userNameCheck.value.trim();
    if (name === "") {
        displayError(userNameErrorCheck, "이름을 입력해주세요.", false);
        validationStates.name = false;
    } else if (!isValidName(name)) {
        displayError(userNameErrorCheck, "이름은 한글과 영문만 가능합니다", false);
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
        displayError(userBirthFormatErrorCheck, "생년월일을 입력해주세요.", false);
        validationStates.birth = false;
    } else if (!isValidBirth(birth)) {
        displayError(userBirthFormatErrorCheck, "생년월일은 숫자8자리만 가능합니다.", false);
        validationStates.birth = false;
    } else {
        displayError(userBirthFormatErrorCheck, "", true);
        validationStates.birth = true;
    }
});

// --- 전화번호 유효성 검사 ---
userTelCheck.addEventListener("blur", function () {
    const tel = userTelCheck.value.trim();
    displayError(telFormatErrorCheck, "", true); // 기존 에러 메시지 초기화
    displayError(telInvalidErrorCheck, "", true); // 기존 에러 메시지 초기화

    if (tel === "") {
        displayError(telFormatErrorCheck, "전화번호를 입력해주세요.", false);
        validationStates.tel = false;
    } else if (!isValidTel(tel)) {
        displayError(telFormatErrorCheck, "전화번호는 숫자만 입력이 가능합니다.", false);
        validationStates.tel = false;
    } else if (!isAvailableTel(tel)) {
        displayError(telInvalidErrorCheck, "전화번호는 10자리 또는 11자리 숫자만 가능합니다.", false);
        validationStates.tel = false;
    } else {
        validationStates.tel = true;
    }
});

// --- 성별 선택 유효성 검사 ---
// 라디오 버튼 변경 시 유효성 검사
maleCheck.addEventListener('change', checkGenderSelection);
femaleCheck.addEventListener('change', checkGenderSelection);

function checkGenderSelection() {
    const selectedGender = maleCheck.checked || femaleCheck.checked;
    if (!selectedGender) {
        displayError(genderErrorCheck, "성별을 선택해주세요.", false);
        validationStates.gender = false;
    } else {
        displayError(genderErrorCheck, "", true);
        validationStates.gender = true;
    }
}

// --- 통신사 선택 유효성 검사 ---
telcomCheck.addEventListener('change', function() {
    if (telcomCheck.value === "") {
        displayError(telecomErrorCheck, "통신사를 선택해주세요.", false);
        validationStates.telecom = false;
    } else {
        displayError(telecomErrorCheck, "", true);
        validationStates.telecom = true;
    }
});


// 최종 유효성 체크 및 서버 통신 버전
window.check = async function (event) {
    event.preventDefault(); 
    
    let isValidForm = true;
    let firstInvalidField = null; // 첫 번째 유효하지 않은 필드를 저장

    console.log(isValidForm);

    // userIdInput.dispatchEvent(new Event('blur'));
    // userPasswordInput.dispatchEvent(new Event('blur'));
    // userTruePasswordCheck.dispatchEvent(new Event('blur'));
    // userNicknameCheck.dispatchEvent(new Event('blur'));
    // userNameCheck.dispatchEvent(new Event('blur'));
    // userBirthCheck.dispatchEvent(new Event('blur'));
    // userTelCheck.dispatchEvent(new Event('blur'));
    // checkGenderSelection(); // 성별 유효성 검사 함수 호출
    // telcomCheck.dispatchEvent(new Event('change')); // 통신사 유효성 검사 강제 실행


// console.log('email',email.value);
// console.log("회원가입 버튼 클릭 시 최종 validationStates:", validationStates);

// if(!validationStates.emailDuplicated && validationStates.email) {
//     displayError(emailErrorMessageLog, "이메일 중복확인을 완료해야 합니다.", false);
//     userIdInput.focus();
//     isValidForm = false;
//     return false;
// }
//  if (!validationStates.nicknameDuplicated && validationStates.nickname) {
//         displayError(duplicateNicknameAuthenticationErrorCheck, "닉네임 중복확인을 완료해야 합니다.", false);
//         userNicknameCheck.focus();
//         isValidForm = false;
//         return false; // 더 이상 진행하지 않고 바로 리턴
//     }

    // validationStates 객체의 모든 값들이 true인지 확인하여 폼 전체의 유효성을 검사

    // let isValidForm = true;
    // let firstInvalidField = null; // 첫 번째 유효하지 않은 필드를 저장

    for (const key in validationStates) {
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
                        firstInvalidField = telcomCheck;
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
    const registerUrl = "http://100.74.28.37:8080/api/joinMembership"; // 가상 서버 URL 예시 (실제 서버 URL로 변경 필요)
    
    // const checkNicknameUrl = `http://100.74.28.37:8080/api/checkNickname?nickname=${encodeURIComponent(nickname)}`;

    const newUserData = {
        email: userIdInput.value.trim(),
        password: userPasswordInput.value.trim(), // 실제 서비스에서는 비밀번호를 서버에서 해싱해야 합니다!
        nickname: userNicknameCheck.value.trim(),
        name: userNameCheck.value.trim(),
        birthdate: userBirthCheck.value.trim(),
        phonenumber: userTelCheck.value.trim(),
        gender: selectedGender,
        mobilecarrier: telcomCheck.value,
    };

    console.log(newUserData);

    try {
        const response = await fetch(registerUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(newUserData),
        });


    console.log("응답 status:", response.status);
        const data = await response.json();

        if (response.ok) {
            if (data.success) {
                
    console.log("응답 데이터:", data);
                alert("회원가입 성공!");
                console.log("회원가입 성공:", data);

                // 폼 필드 초기화 및 에러 메시지 숨김
                joinFormInput.reset(); // 모든 폼 필드를 초기 상태로 되돌립니다.
                // 모든 에러 메시지 초기화
                document.querySelectorAll('[name="errorMessage"]').forEach(errorSpan => {
                    errorSpan.style.display = 'none';
                    errorSpan.textContent = ''; // 텍스트도 비워줍니다.
                });
                // validationStates도 초기화
                for (const key in validationStates) {
                    validationStates[key] = false;
                }

                window.location.href = '/login.html'; // 로그인 페이지로 리다이렉트
                return true;
            } else {
                alert(`회원가입 실패: ${data.message || "다시 시도해주세요."}`);
                return false;
            }
        } else {
            alert(`회원가입 실패: ${data.message || "서버 오류가 발생했습니다."}`);
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
    // 초기 validationStates 설정 (필요에 따라 일부는 true로 시작할 수도 있음)
    for (const key in validationStates) {
        validationStates[key] = false;
    }
});
