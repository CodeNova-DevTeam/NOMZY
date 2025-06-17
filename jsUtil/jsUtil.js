export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
export function isValidPassword(password) {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
  return passwordRegex.test(password);
}

export function isValidNickname(nickname) {
  const nicknameRegex = /^[a-zA-Z0-9가-힣]{1,12}$/;
  return nicknameRegex.test(nickname);
}

export function isValidName(name) {
  const nameRegex = /^[가-힣a-zA-Z]+$/;
  return nameRegex.test(name);
}

export function isValidBirth(birth) {
  const birthRegex = /^\d{8}$/;
  return birthRegex.test(birth);
}

export function isValidTel(tel) {
  const telRegex = /^\d+$/;
  return telRegex.test(tel);
}

export function isAvailableTel(tel) {
  // 간단한 전화번호 형식 검사 (숫자로만 이루어져 있는지, 특정 자리수 충족 여부 등)
  // 실제 사용 가능한 전화번호인지 확인하는 로직은 서버 측에서 이루어져야 합니다.
  return tel.length === 10 || tel.length === 11;
}