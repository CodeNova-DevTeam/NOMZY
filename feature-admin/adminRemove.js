// 관리자 로그인 확인
// localStorage.getItem("isAdmin")은 웹 브라우저에 저장된 데이터를 불러오는 코드.
// 여기서 'isAdmin'이라는 이름의 데이터가 "true"가 아닌 경우, 즉 관리자가 아니라면 로그인 페이지로 이동.
if (localStorage.getItem("isAdmin") !== "true") {
  alert("관리자만 접근할 수 있습니다.");
  window.location.href = "/feature-login/login.html";
}

// HTML 요소 가져오기
// 웹페이지 안에 있는 요소들을 JavaScript로 가져옴.
// getElementById는 HTML 문서에서 특정 ID를 가진 요소를 찾기.
const userTableBody = document.getElementById("userTableBody");
const paginationContainer = document.getElementById("paginationContainer");
const sortSelect = document.getElementById("sort");

// 현재 상태를 저장하는 변수들
let currentPage = 1; // 현재 페이지 번호
const pageSize = 20; // 한 페이지당 보여줄 유저 수
let allUsers = [];   // 서버에서 받아온 모든 유저 데이터를 저장할 배열

// 유저 정렬 함수
// 이 함수는 유저 배열을 정렬 기준(criterion)에 따라 정렬.
function sortUsers(users, criterion) {
  switch (criterion) {
    case "nickname":
      // 문자열을 비교하여 정렬. localeCompare는 사전 순 비교 함수.
      // 예: "가".localeCompare("나")는 -1 반환, 즉 "가"가 "나"보다 앞에 옴.
      return users.sort((a, b) => a.nickname.localeCompare(b.nickname));

    case "region":
      return users.sort((a, b) => a.region.localeCompare(b.region));

    case "reviewCount":
      // 숫자를 큰 순서대로 정렬하려면 b - a를 사용.
      return users.sort((a, b) => b.reviewCount - a.reviewCount);

    default:
      // 정렬 기준이 명시되지 않은 경우 원래 배열을 그대로 반환
      return users;
  }
}

// 유저 목록을 표에 출력하는 함수
function renderTable(users) {
  userTableBody.innerHTML = ""; // 표 내부 초기화 (이전 내용 삭제)

  // slice(start, end)는 배열에서 start부터 end 직전까지 잘라내는 함수.
  // 예: [1, 2, 3, 4, 5].slice(1, 3) → [2, 3]
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageUsers = users.slice(start, end); // 현재 페이지에 보여줄 유저만 추출

  pageUsers.forEach((user) => {
    const row = document.createElement("tr"); // tr은 표의 한 줄

    const nicknameTd = document.createElement("td");
    nicknameTd.textContent = user.nickname; // 유저 닉네임을 셀에 넣기
    row.appendChild(nicknameTd);

    const deleteTd = document.createElement("td");
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "삭제"; // 버튼 안에 표시될 텍스트

    // addEventListener는 이벤트(예: 클릭)가 발생했을 때 실행할 동작을 지정.
    deleteBtn.addEventListener("click", () => deleteUser(user.userId));

    deleteTd.appendChild(deleteBtn);
    row.appendChild(deleteTd);

    userTableBody.appendChild(row); // 완성된 행을 표에 추가
  });

  renderPagination(users.length); // 페이지 버튼 새로 그리기
}

// 페이지네이션 생성 함수
function renderPagination(totalItems) {
  paginationContainer.innerHTML = ""; // 기존 버튼 제거
  const totalPages = Math.ceil(totalItems / pageSize); // 총 페이지 수 계산
  // Math.ceil은 올림 함수. 예: 3.2 → 4

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i; // 버튼에 페이지 숫자 표시

    // 현재 페이지일 경우 'active'라는 CSS 클래스 적용
    btn.className = i === currentPage ? "active" : "";

    btn.addEventListener("click", () => {
      currentPage = i;
      renderTable(sortUsers(allUsers, sortSelect.value)); // 페이지 바뀔 때마다 다시 출력
    });

    paginationContainer.appendChild(btn); // 버튼을 페이지 영역에 추가
  }
}

// 유저 삭제 함수
async function deleteUser(userId) {
  // confirm은 사용자에게 "정말 삭제할까요?" 같은 확인 창을 띄움.
  if (!confirm("정말 이 유저를 삭제하시겠습니까?")) return;

  try {
    // fetch는 서버에 데이터를 요청하거나 보낼 때 사용하는 함수.
    const response = await fetch(`http://100.74.28.37:8081/api/admin/deleteUser/${userId}`, {
      method: "DELETE"
    });

    // 삭제 성공 시 화면에서도 해당 유저 제거
    if (response.ok) {
      alert("삭제 성공!");
      allUsers = allUsers.filter((u) => u.userId !== userId);
      renderTable(sortUsers(allUsers, sortSelect.value));
    } else {
      throw new Error("삭제 실패");
    }
  } catch (error) {
    alert("오류 발생: " + error.message);
  }
}

// 서버에서 유저 목록을 가져오는 함수
async function fetchUsers() {
  try {
    const response = await fetch("#"); // 유저 목록 요청
    if (!response.ok) throw new Error("유저 목록 불러오기 실패");

    allUsers = await response.json(); // JSON 형식의 응답을 자바스크립트 객체로 변환
    renderTable(sortUsers(allUsers, sortSelect.value));
  } catch (error) {
    alert("서버 오류: " + error.message);
  }
}

// 정렬 기준 변경 시
// select 드롭다운에서 정렬 기준이 바뀌면 테이블을 새로 정렬해서 보여줌.
sortSelect.addEventListener("change", () => {
  currentPage = 1; // 첫 페이지로 이동
  renderTable(sortUsers(allUsers, sortSelect.value));
});

// 페이지 처음 열렸을 때 실행되는 부분
window.addEventListener("DOMContentLoaded", fetchUsers); // HTML이 완전히 로드되면 실행
