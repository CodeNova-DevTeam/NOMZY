// search_input.js 또는 index.html <script> 태그 안
document.addEventListener('DOMContentLoaded', () => {
    // 1. 필요한 HTML 요소 가져오기
    // 검색어 입력 필드 (HTML에서 id="searchInput" 인 요소)
    const searchInput = document.getElementById('searchInput');
    // 검색 버튼 (HTML에서 id="searchButton" 인 요소)
    const searchButton = document.getElementById('searchButton');

    // 2. 검색 결과 페이지로 이동하는 함수 정의
    const redirectToSearchResults = () => {
        // 2.1. 사용자가 입력한 검색어 가져오기
        // .value: input 태그의 현재 입력된 텍스트를 가져옵니다.
        // .trim(): 문자열의 양 끝에 있는 공백(스페이스, 탭, 줄바꿈 등)을 제거합니다.
        const searchTerm = searchInput.value.trim();

        // 2.2. 검색어 유효성 검사 (선택 사항이지만 권장)
        // 검색어가 비어 있으면 사용자에게 경고하고 함수를 종료합니다.
        if (searchTerm === '') {
            alert('검색어를 입력해주세요!'); // 사용자에게 간단한 알림을 띄웁니다.
            return; // 함수 실행을 여기서 중단합니다.
        }

        // 2.3. 검색어를 URL에 안전한 형태로 인코딩
        // encodeURIComponent(): URL에 사용될 수 없는 특수 문자(예: 공백, &, =, ?)를
        // %xx 형태로 변환하여 URL이 올바르게 구성되도록 합니다.
        // 예를 들어, "치킨 추천" -> "치킨%20추천" 으로 변환됩니다.
        const encodedSearchTerm = encodeURIComponent(searchTerm);

        // 2.4. 검색 결과 페이지 URL 생성 및 페이지 이동
        // window.location.href: 현재 브라우저 탭의 URL을 설정하거나 가져오는 속성입니다.
        // 이 속성에 새 URL을 할당하면 브라우저가 해당 URL로 이동합니다.
        // `search_results.html?q=${encodedSearchTerm}`:
        //   - `search_results.html`: 검색 결과를 보여줄 HTML 파일의 경로입니다.
        //   - `?q=${encodedSearchTerm}`: URL의 쿼리 파라미터 부분입니다.
        //     '?' 뒤에 오는 부분이 쿼리 문자열이며, 'q'는 파라미터의 이름(키)이고,
        //     `${encodedSearchTerm}`는 그 파라미터의 값입니다.
        //     이 방식으로 검색어를 다음 페이지로 "전달"합니다.
        //     예시: http://yourdomain.com/search_results.html?q=치킨
        window.location.href = `search_results.html?q=${encodedSearchTerm}`;
    };

    // 3. 이벤트 리스너 등록
    // 3.1. 검색 버튼 클릭 시 함수 실행
    // searchButton 요소에 'click' 이벤트가 발생하면 redirectToSearchResults 함수를 호출합니다.
    searchButton.addEventListener('click', redirectToSearchResults);

    // 3.2. 검색 입력 필드에서 'Enter' 키 눌림 시 함수 실행
    // searchInput 요소에 'keypress' 이벤트가 발생하면 (키가 눌렸을 때)
    // 이벤트 객체(event)의 key 속성이 'Enter' 인지 확인합니다.
    searchInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            redirectToSearchResults(); // 'Enter' 키가 눌렸다면 페이지 이동 함수를 호출합니다.
        }
    });
});