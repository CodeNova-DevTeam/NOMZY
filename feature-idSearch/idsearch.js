import {
    isValidName,
    isValidTel,
    isAvailableTel,
} from "../jsUtil/jsUtil.js";

const idSearchForm = document.getElementById("idSearchForm");
const searchName = document.getElementById('userSearchName');
const searchNameError = document.getElementById('searchNameError');

const searchTel = document.getElementById('userSearchTel'); // 전화번호입력
const searchTelError = document.getElementById('searchTelError'); // 전화번호입력에러

const authenticationNumberButton = document.getElementById('authenticationNumberButton');
const authenticationNumber = document.getElementById('authenticationNumber'); // 인증번호 입력 필드
const authenticationNumberError = document.getElementById('authenticationNumberError');

// 인증번호 발송 여부 및 일치 여부를 위한 전역 변수
let generatedAuthCode = ""; // 서버에서 발송될 또는 로컬에서 생성될 인증번호를 저장
let isAuthNumberSent = false; // 인증번호가 발송되었는지 여부를 체크하는 변수
let isAuthNumberVerified = false; // 인증번호가 올바르게 확인되었는지 체크하는 변수

// 각 입력 필드의 유효성 상태를 관리하는 객체
const validationStates = {
    name: false,
    tel: false,
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

// 4. 전화번호 입력 필드 유효성 검사
searchTel.addEventListener("blur", function () {
    const tel = searchTel.value.trim();
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

// 인증번호 받기 버튼 클릭 이벤트서버 연동 주석 해제해서 써야됌
// 서버에서는 이 이름과 전화번호로 가입된 회원이 있는지 확인하고, 있으면
// 인증번호를 생성하여 해당 전화번호로 SMS를 발송하는 API를 구현해야함
authenticationNumberButton.addEventListener("click", async function (event) {
    event.preventDefault(); // 폼 제출 방지

    // validationStates를 활용하여 이름과 전화번호 유효성 검사
    if (!validationStates.name) {
        searchNameError.textContent = "유효한 이름을 입력해주세요.";
        searchNameError.style.display = "block";
        searchName.focus();
        return;
    }

    if (!validationStates.tel) {
        searchTelError.textContent = "유효한 전화번호를 입력해주세요.";
        searchTelError.style.display = "block";
        searchTel.focus();
        return;
    }

    const name = searchName.value.trim();
    const tel = searchTel.value.trim();

    const requestAuthNumberUrl = "#"; // 인증번호 요청 서버 API 엔드포인트 , 나중에 api 삽입해야함

    try {
        const response = await fetch(requestAuthNumberUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: name, tel: tel }),
        });

        const data = await response.json();

        if (response.ok) { // 서버 응답이 2xx 성공 코드인 경우
            if (data.success) {
                alert("인증번호가 성공적으로 발송되었습니다. SMS를 확인해주세요.");
                isAuthNumberSent = true; // 인증번호 발송 상태로 변경
                isAuthNumberVerified = false; // 아직 확인되지 않음
                validationStates.authCode = false; // 인증번호 재발송 시 상태 초기화

                authenticationNumberError.textContent = "인증번호가 발송되었습니다. 입력해주세요.";
                authenticationNumberError.style.color = "green";
                authenticationNumberError.style.display = "block";
                authenticationNumber.focus(); // 인증번호 입력 필드로 포커스 이동

            } else {
                alert(`인증번호 발송 실패: ${data.message || '가입된 정보가 없거나 오류가 발생했습니다.'}`);
                authenticationNumberError.textContent = data.message || "인증번호 발송에 실패했습니다.";
                authenticationNumberError.style.color = "red";
                authenticationNumberError.style.display = "block";
                isAuthNumberSent = false;
                isAuthNumberVerified = false;
                validationStates.authCode = false; // 실패 시 상태 초기화
            }
        } else { // 서버 응답이 4xx, 5xx 등 에러 코드인 경우
            alert(`서버 오류: ${data.message || '인증번호 발송 중 서버 오류가 발생했습니다.'}`);
            authenticationNumberError.textContent = "서버 오류로 인증번호 발송에 실패했습니다.";
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
authenticationNumber.addEventListener("blur", function () {
    const enteredAuthCode = authenticationNumber.value.trim();
    if (enteredAuthCode === "") {
        authenticationNumberError.textContent = "인증번호를 입력해주세요.";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false; // validationStates 업데이트
        return;
    }

    // 로컬 스토리지 버전에서: generatedAuthCode와 비교
    if (isAuthNumberSent && enteredAuthCode === generatedAuthCode) {
        authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
        authenticationNumberError.style.color = "green";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = true;
        validationStates.authCode = true; // validationStates 업데이트
    }
    
    // 서버 연동 버전에서 서버에 인증번호 확인 요청을 보냄 (주석 해제하여 사용)
    else if (isAuthNumberSent) {
        async function verifyAuthCode() {
            const verifyAuthUrl = "#"; // 인증번호 확인 서버 API 엔드포인트 나중에 삽입해야함
            try {
                const response = await fetch(verifyAuthUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tel: searchTel.value.trim(), authCode: enteredAuthCode })
                });
                const data = await response.json();
                if (response.ok && data.success) {
                    authenticationNumberError.textContent = "인증번호가 확인되었습니다.";
                    authenticationNumberError.style.color = "green";
                    authenticationNumberError.style.display = "block";
                    isAuthNumberVerified = true;
                    validationStates.authCode = true; // validationStates 업데이트
                } else {
                    authenticationNumberError.textContent = data.message || "인증번호가 일치하지 않습니다.";
                    authenticationNumberError.style.color = "red";
                    authenticationNumberError.style.display = "block";
                    isAuthNumberVerified = false;
                    validationStates.authCode = false; // validationStates 업데이트
                }
            } catch (error) {
                console.error("인증번호 확인 중 오류:", error);
                authenticationNumberError.textContent = "인증번호 확인 중 오류가 발생했습니다.";
                authenticationNumberError.style.color = "red";
                authenticationNumberError.style.display = "block";
                isAuthNumberVerified = false;
                validationStates.authCode = false; // validationStates 업데이트
            }
        }
        verifyAuthCode(); // 함수 호출
    }
    
    else { // 인증번호가 발송되지 않았거나, 일치하지 않는 경우
        authenticationNumberError.textContent = "인증번호가 일치하지 않습니다.";
        authenticationNumberError.style.color = "red";
        authenticationNumberError.style.display = "block";
        isAuthNumberVerified = false;
        validationStates.authCode = false; // validationStates 업데이트
    }
});

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
                case 'tel':
                    searchTel.focus();
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
        const findIdUrl = "#"; // 아이디 찾기 서버 API 엔드포인트 백엔드 url 삽입
        const name = searchName.value.trim();
        const tel = searchTel.value.trim();
        const enteredAuthCode = authenticationNumber.value.trim();

        try {
            const response = await fetch(findIdUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name,
                    tel: tel,
                    authCode: enteredAuthCode // 서버가 인증번호도 함께 검증하도록 전송
                }),
            });

            const data = await response.json();

            if (response.ok) { // 서버 응답이 2xx 성공 코드인 경우
                if (data.success) {
                    alert(`회원님의 아이디는 ${data.email} 입니다.`);
                    console.log("아이디 찾기 성공:", data.email);
                    // 성공 후 로그인 페이지 등으로 이동
                    // window.location.href = '/templates/login.html';
                    idSearchForm.reset(); // 폼 필드 초기화
                    searchNameError.style.display = "none";
                    searchTelError.style.display = "none";
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
                    alert(`아이디 찾기 실패: ${data.message || '입력하신 정보와 일치하는 아이디를 찾을 수 없습니다.'}`);
                    return false;
                }
            } else { // 서버 응답이 4xx, 5xx 등 에러 코드인 경우
                alert(`서버 오류: ${data.message || '아이디 찾기 중 서버 오류가 발생했습니다.'}`);
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
