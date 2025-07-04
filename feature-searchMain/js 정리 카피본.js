const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
// 브라우저 저장소 (로컬스트로지)에서 "isLoggenIn" 이라는 항목의 값을 불러옴
// 로컬스트로지에 "isLoggedIn"이 "true"로 저장돼 있으면 로그인한 상태로 판단
const nickname = localStorage.getItem("nickname") || "GUEST";
// 브라우저 저장소에서 "nickname" 이라는 항목을 불러옴
// 예 : "대한" , "때한" 같은 사용자의 닉네임을 불러옴
// 만약 위에서 가져온 값이 null 또는 "" ( 없을경우 ) "GUEST" 라는 기본값을 대신 넣어줌
const itemsPerPage = 20;
// 한 페이지에 보여줄 가게 개수 , 고정값으로 20개씩 보여주겠다는 뜻
// 페이지네이션 계산 시 몇 개씩 잘라서 보여줄지 기준이 되는숫자
let currentStores = [];
// currentStores 는 화면에 현재 ㅂ여지는 가게 목록을 담을 배열
// 초기에는 빈 배열로 시작하고, 이후 검색 결과나 정렬 결과가 여기에 담김
// let을 사용한 이유는 이 값이 나중에 계속 변경될 수 있기 때문
let currentSortKey = "rating";

document.addEventListener('DOMContentLoaded', async () => {
  
  // HTML 문서가 완전히 로드되고 DOM이 생성된 후 실행되는 이벤트 리스너
  // 즉, HTML이 다 로딩된 다음에 안의 스크립트를 실행하겠다는 뜻임
  // (DOMContentLoaded 전에 실행하면 HTML 요소들을 찾지 못하는 문제가 생길 수 있어서 이렇게 보장함)
  const storeListContainer = document.querySelector('.store-list-container');
  // class="store-list-container"인 HTML 요소를 가져옴
  // 검색 결과로 렌더링되는 가게 카드들을 이 div 안에 넣을 예정
  const searchQueryDisplay = document.getElementById('searchQueryDisplay');
  // id="searchQueryDisplay"인 요소 가져옴
  // 검색한 키워드를 상단에 표시할 때 사용됨 ('삼겹살' 검색 결과 이런 형태로 출력됨)
  const sortOption = document.getElementById('sortOption');
  // id="sortOption"인 select 박스를 가져옴
  // 사용자 정렬 옵션을 감지하기 위해 사용 (별점순, 조회수순 등)
  const params = new URLSearchParams(window.location.search);
  // 현재 URL의 쿼리스트링 부분 (?keyword=삼겹살 이런 형태)을 객체로 파싱함
  // => get("keyword")로 원하는 값만 추출 가능
  const rawKeyword = params.get("keyword") || "";
  // URL 주소창에서 keyword 라는 값을 가져와서 rawKeyword 에 저장하되
  // 값이 없으면 빈 문자열 "" 로 대신 처리
  const keyword = rawKeyword.replace(/:\d+$/, "");
  // 쿼리스트링에서 "keyword" 값을 추출, 없으면 빈 문자열
  // 예: ?keyword=삼겹살 → keyword = "삼겹살"
  // 예: URL에 keyword 없음 → keyword = ""
  const sortKey = params.get("sortKey") || "rating";
  currentSortKey = sortKey;
  // 브라우저 localStorage에서 nickname 값을 불러옴
  // 없으면 기본값으로 "GUEST" 사용
  // 주로 사용자 개인화 검색(즐겨찾기 포함)에 사용될 수 있음
  searchQueryDisplay.textContent = `'${keyword}' 검색 결과`;
  // 실제 검색 키워드를 화면 상단에 출력
  // 예: '삼겹살' 검색 결과 ← 이런 형태로 표시됨
  const useDummy = true;
  // useDummy 가 true 면 더미데이터 사용 false면 실제 데이터 사용
  // 지금은 false기 때문에 실제 데이터를 사용
  sortOption.value = sortKey;
  // 현재 URL에 있는 sortKey 값을 <select> 박스에 적용시키는 코드
  // 사용자가 URL에 sortKey=rating 이라고 붙여서 들어왔다면
  // 그걸 <select> 박스에서 자동으로 선택되도록 만들어주는 설정


  const stores = useDummy
    ? await fetchStoresDataDummy(keyword)
    // useDummy 가 true일 경우 실행됌. keyword에 해당하는 더미 데이터를 필터링 하여 가져옴
    // : await fetchStoresDataReal(keyword, nickname);
    : await fetchStoresDataReal(keyword, sortKey);
    // useDummy가 false일 경우 실행 , 실제 서버데이터의 keyword를 불러옴
    const fullStores = [...stores];
    // stores 는 서버나 더미에서 불러온 가게 목록 배열
    // ...은 전개 연산자 ( 배열을 "펼쳐서" 복사함 )
    // [...]에 담으면 새로운 배열을 만들어서 기존 stores의 원본을 훼손하지 않고 복사함.
  currentStores = stores;
  // 지금 화면에서 보여줄 가게 리스트는 stores 전체 데이터를 기준으로 하겠다는 뜻
  let currentPage = 1;
  // 사용자가 현재 보고 있는 페이지 번호를 1로 설정
  // 초기 검색결과가 어떻든 무조건 1페이지부터 시작하게
  const totalPages = Math.ceil(currentStores.length / itemsPerPage);
  // 전체 결과 수에 따라 총 몇 페이지가  필요한지 계산
  // currentStores.length : 지금 보여줄 전체 가게 수 , 63개면 63개의 결과
  // itemsPerPage : 한 페이지당 보여줄 가게 수 ( 전역변수로 최상단에 20으로 설정)
  // Math.ceil(...) : 소수점 올림 함수 = 페이지가 63개라면 63 / 20 = 3.15 가 되므로
  //               ㄴ 3.15 -> 4페이지로 계산됌 
  


  sortOption?.addEventListener('change', () => {
    // ? 가 붙은이유 = sortOption 요소가 존재하지 않으면 이벤트 안 걸고 그냥 무시
    // 안전하게 실행하기 위한 장치 ( null 에러 방지 )
    const selectedSort = sortOption.value;
    // 셀렉트 박스에서 사용자가 선택한 정렬 기준 값을 꺼냄
    // "rating", "views", "alphabet", "reviews", "favorite" 중 하나가 나옴
    const sorted = sortAndFilter(fullStores, selectedSort);
    // 전체 가게 목록(fullStores)을 selectedSort 기준으로 정렬하거나 필터링해서
    // 새로운 정렬된 목록을 만들어냄
    // selectedSort = "rating" -> 별점 높은순으로 정렬
    //              = "favorite" -> 즐겨찾기만 필터링
    currentStores = sorted;
    // 이제 화면에 보여줄 데이터는 정렬된 목록으로 갱신하겠다는 뜻
    // currentStores 는 render 함수들이 계속 참조하는 핵심 배열.
    currentPage = 1;
    // 정렬이 바뀌면 무조건 다시 1페이지부터 보여줌
    // 5페이지를 보던중 "리뷰순" 으로 바꿧을때 정렬순서가 바뀌었으므로 1페이지부터 시작
    
    
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("sortKey",selectedSort);
    history.replaceState(null, "",newUrl);
    
    
    renderStoreCards(paginate(currentStores, 1));
    // 새로 정렬된 목록 중에서, 1페이지에 해당하는 가게들만 잘라서
    // HTML 카드 형태로 화면에 그려줌
    renderPagination(1, Math.ceil(currentStores.length / itemsPerPage))
    // 페이지 번호 버튼을 새로 다시 그려줌
    // 새로 정렬된 결과에 따라 총 페이지 수가 바뀔 수도 있으니 다시 계산해서 반영
    updateSortStatusText(selectedSort);
  });
  renderStoreCards(paginate(currentStores, currentPage));
  // paginate(...) 함수는 1페이지에 보여줄 가게들만 "자르기" 하는 함수 ex ) 1~20번 가게 추출
  // renderSotreCards(...) 는 그 자른 데이터를 HTML 카드로 만들어 화면에 그려주는 함수
  renderPagination(currentPage, totalPages)
  // 전체 페이지 수에 따라, 아래쪽 페이지 버튼들을 생성해 화면에 보여줌
  // 총 4페이지라면 [1], [2], [3], [4] ... 버튼 생성
  // 지금 페이지는 1이므로 [1] 버튼만 활성화 (class="acvive")에 붙음
  updateSortStatusText(currentSortKey);
  renderTop5Ranking(true);
});

async function fetchStoresDataReal(keyword = '', sortKey = '') {

  try{
  // 실제 백엔드 API 서버로부터 검색 결과 데이터를 가져오는 함수
  // query는 검색어, nickname은 사용자 닉네임 (현재는 'GUEST' 로 기본값 지정)
    const response = await axios.get(`http://100.123.221.61:8082/api/search?keyword=${encodeURIComponent(keyword)}&sortKey=${encodeURIComponent(sortKey)}`, {
   // 현재 사용 중인 실제 백엔드 API주소 (포트8082)
   // encodeURIComponent(query)로 검색어를 URL 인코딩 ( 예 : 공백, 한글 등 안전하게 처리)
   // nickname은 지금은 사용 안 하고 있지만 향후 즐겨찾기 필터 등에 활용 가능 추후 추가
    params : {
      keyword : keyword,
      sortKey : sortKey
    },
  });
  const rawData = await response.json();
  // 백엔드에서 받은 JSON 데이터를 파싱하여 JavaScript 객체로 변환
  // 예: [ { restaurantId: 1, title: '삼겹살집', tagNames: ..., regionName: ... }, ... ]

  // 매핑 처리 (프론트에서 기대하는 필드로 가공)
  console.log("rawData : ",rawData)
  const mappedData = rawData.results.map(item => {
    const fullRegion = item.regionName || "";
    // 전체 주소 문자열이 존재하면 그대로 사용, 없으면 빈 문자열
    // 예 : '서울 특별시 강남구 역삼동'
    const regionDo = fullRegion.split(" ")[0] || "";  // undefined 방지
    // 전체 지역명에서 첫 번째 단어(도/시)를 추출
    // 예 : '서울 특별시 강남구' -> '서울특별시'

    return {
      restaurantId: item.restaurantId,
      // 백엔드에서 받은 가게 ID를 그대로 사용
      title: item.title || "이름없음",
      // 가게 이름이 없으면 '이름없음'으로 기본값 설정
      // category: item.tagNames || "기타",
      menuNames: item.menuNames || "기타",
      // 태그 이름을 catagory로 사용 (없으면 '기타')
      regionName: regionDo,  // ⬅ 이 필드를 HTML에서 출력할 때 사용
      // 추출한 '서울특별시' 같은 지역 상위 명칭을 저장
      // HTML 카드에 표시 할 지역 정보로 사용됨
      isFavorite: item.bookmarked || false,
      // 즐겨찾기 등록 상태
      rating: item.rating,
      reviewCount: item.reviews,
      // reviews: reviews,
      // 리뷰수
      viewCount: item.viewCount,
      // 조회수
      images: ["/images/store1.jpg", "/images/store2.jpg"],
      // 가게 더미이미지 2장 ( 추후 동적변경 or 정적삽입)
      openingHours: [
        { day: 1, open: "10:00", close: "22:00" },
        { day: 2, open: "10:00", close: "22:00" }
      ]
      // 가게 운영시간 더미데이터 ( 추후 서버에서 불러오기 )

      
      // tagNames : item.tagNames 추가
      // 즐겨찾기 많이 등록된 순 따로 추가 정렬 기능 포함
    };
  });
  return mappedData;
  // 최종적으로 가공된 데이터 배열을 반환함 -> 이게 화면에 렌더링됌
  } catch(error) {
    console.error("실제 서버 데이터 불러오기 실패 : ", error)
    return [];
  }
}

/* ====================================== */
function createStoreCard(store) {
  const card = document.createElement("div");
  // div 박스를 생성하기 위해 변수에 저장
  card.className = "store-card";
  // 하나의 가게를 표현을 <div></div> 엘리먼트를 생성하고 클래스명을 "store-card"로 설정
  /* ========================== */
  /* Array.isArray(store.openingHours) = store.openingHouers 가 배열인지 확인하는 조건
      ㄴ () 안의 store.openingHours 가 배열인지 아닌지 체크
      ㄴ Array.isArray( ? ) = 자바스크립트 내장함수 , true / false 를 반환 */
  /*
    getStoreStatus(store.openingHours) === '영업 중'
    ㄴ 가게가 지금 영업 중인지 확인하는 조건
    ㄴ 시간이 몇 시인지 보고 "영업 중" 인지 "영업 전" 인지 판단해주는 함수
    ㄴ === "영업 중" 은 말 그대로 이 가게가 영업 중이면 true, 아니면 false
  */
  // 즉 가게의 운영시간 정보가 배열로 존재하고,
  // 그 시간 정보를 기준으로 봤을 때 지금 이 가게가 '영업 중'이면 true, 아니면 false
  // 
  const isOpen = Array.isArray(store.openingHours) && getStoreStatus(store.openingHours) === '영업 중';
  // 가게가 현재 "영업 중" 인지 확인
  // 1. openingHours가 배열인지 확인
  // 2. getStoreStatus() 함수로 현재 시간이 open-close 사이인지 검사
  const rating = isNaN(store.rating) ? "0.0" : store.rating.toFixed(1);
  // 별점
  const reviewCount = store.reviewCount > 999 ? '999+' : store.reviewCount;
  // 리뷰 수는 999 초과 시 "999+" 로 표시 ( 너무 큰 숫자 방지 )

  // card 엘리먼트 내부에 들어갈 HTML 구조를 작성
  // 가게 이름, 카테고리, 지역, 즐겨찾기 버튼, 상태, 별점, 리뷰 수, 이미지 포함
  // 동적인 HTML 생성은 HTML로 먼저 만들고 복사붙여넣기로 생성하는게 편함
  card.innerHTML = `
    <div class="store-info">
      <div class="store-header">
        <h3 class="store-name">
          <span class="store-link" data-id="${store.restaurantId}">${store.title}</span>
        </h3>
        <span class="store-category">${store.menuNames}</span>
        <span class="store-region">${store.regionName}</span>

        <button class="like-button" aria-label="좋아요">❤️</button>

        <button class="favorite-button ${store.isFavorite ? 'active' : ''}" aria-label="즐겨찾기">☆</button>
      <!-- ☆버튼은 즐겨찾기 토글용, active 클래스가 있으면 색이 채워진 상태-->
        </div>
      <div class="store-details">
        <span class="status ${isOpen ? 'open' : ''}">${isOpen ? '영업 중' : '영업 전'}</span>
        <!-- 영업 상태 표시 : 현재 영업 중이면 '영업 중', 아니면 '영업 전' -->
        <span class="rating">★ ${rating}</span>
        <span class="reviews">리뷰 ${reviewCount}</span>
      </div>
    </div>
   <div class="store-images">
    ${(store.images || []).slice(0, 4).map(src => `
      <img src="${src}" alt="${store.title} 이미지" loading="lazy">
    `).join('')}
  </div>
      <!-- 이미지가 여러 개인 경우 <img> 태그로 반복 렌더링, lazy 로딩 적용 -->
      `;
  const link = card.querySelector(".store-link");
  // 클릭할 가게 이름의 링크를 저장할 변수
  link.addEventListener("click", () => {
    window.location.href = `/feature-searchinfo/searchinfo.html?id=${store.restaurantId || store.id}`;
    // 가게 이름을 클릭했을 때 해당 가게의 상세 페이지로 이동
    // URL에 ?id = 숫자 형태로 전달됨
  });
  const favBtn = card.querySelector(".favorite-button");
  // card 는 지금 만들고 있는 가게 카드 한 개이고
  // 그 안에서 .favorite-button 클래스를 가진 즐겨찾기 버튼 요소를 하나 가져옴
  // 결과는 favBtn 변수에 저장되어 이후 클릭 이벤트를 연결하거나 상태를 변경할 때 사용
  favBtn.addEventListener("click", async () => {
    // favBtn 버튼을 클릭했을때의 이벤트
    if (localStorage.getItem("isLoggedIn") !== "true") {
      alert("로그인이 필요합니다.");
      return;
      // 로그인한 사용자만 즐겨찾기 버튼을 사용 할 수 있도록 제한
      // 지금은 로컬스트로지에 저장된 데이터를 기반으로 로그인 추후 변경해야함
    }
    const newStatus = !favBtn.classList.contains("active");
    // 현재 버튼에 "active" 클래스가 있는지를 검사
    // 이 클래스가 있다면 즐겨찾기 상태 없으면 비활성화 상태
    // ! 를 붙여 현재 상태를 반전시켜 newStatus에 저장
    favBtn.classList.toggle("active", newStatus);
    // newStatus 의 값에 따라 버튼을 "active" 클래스를 토글
    // 즉, 버튼의 스타일이 즐겨찾기 상태로 즉시 시각적으로 반영함
    try {
      await axios.post("http://100.123.221.61:8082/api/favorite/toggle", {
        restaurantId : store.id || store.restaurantId, // 어떤 가게인지
        favorite : newStatus, // true면 즐겨찾기 추가 , false면 즐겨찾기 해제
        nickname : nickname // 어떤 사용자인지 ( 로컬에 저장된 닉네임)
        });
    } catch(error) {
      favBtn.classList.toggle("active", !newStatus);
      // 서버 요청이 실패했으므로 UI 변경도 원래대로 되돌림
      // 사용자는 즐겨찾기 토글을 눌렀지만 요청이 실패했기 때문에 다시 원상복구
      console.error(error);
    }
  });


  // 좋아요 토글 함수
  const likeButton = card.querySelector(".like-button");

  likeButton.addEventListener("click", async () => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      alert("로그인을 하세용가리.");
      return;
    }

    const newLiked = !likeButton.classList.contains("active");
    likeButton.classList.toggle("active", newLiked);

    try {
      await axios.post("http://100.123.221.61:8082/api/like/toggle", {
        restaurantId : store.id || store.restaurantId,
        liked : newLiked,
        nickname : nickname
        })
    } catch(error) {
      likeButton.classList.toggle("active", !newLiked);
      console.error(error);
    }
  });
  return card;
  // 지금까지 설정한 버튼 이벤트 등 모든 요소를 포함한 가게 카드 DOM을 최종적으로 반환
  // 이 값은 renderStoreCards() 등에서 사용되어 화면에 삽입
}

// 검색된 가게 카드 렌더링
function renderStoreCards(stores) {
  const storeListContainer = document.querySelector('.store-list-container');
  // HTML 에서 class = "store-list-container" 요소를 가져옴
  // 여기 안에 가게 카드들을 하나씩 추가해서 목록처럼 보여줄 예정
  storeListContainer.innerHTML = '';
  // 기존에 있던 가게 카드들을 모두 제거
  // 새로 검색하거나 정렬했을 때 화면을 새로 갱신하기 위해 초기화함.
  const summaryBox = document.getElementById("searchResultSummary");
  if (!stores.pageItems || stores.pageItems.length === 0) {
    storeListContainer.innerHTML = '<p style="text-align:center">검색 결과가 없습니다.</p>';
    if (summaryBox) summaryBox.textContent = '';
    return;
  }

  if (summaryBox) {
    summaryBox.textContent = `총 ${stores.totalItems}개의 결과 중 ${stores.startIndex}~${stores.endIndex}번 표시 중입니다.`;
  }
  stores.forEach(store => {
    storeListContainer.appendChild(createStoreCard(store));
    // stoers 배열을 순회하면서
    // 각 가게(store)마다 createStoreCard()를 호출해 카드 DOM을 만들고
    // 그걸 storeListContainer에 추가함 ( 즉, 화면에 렌더링됨 )
  });
  filtered = sortAndFilter(filtered, currentSortKey);
  updateSortStatusText(currentSortKey);
}


function getStoreStatus(openingHours) {
if (!Array.isArray(openingHours)) return '영업 전';
/* openingHours가 배열이 아니면 잘못된 데이터이므로 그냥 "영업 전"이라고 판단하고 종료
    ㄴ Array.isArray(openingHours) 가 아니라면 영업전으로 return */
  const now = new Date();
  // 현재 시각을 now(지금)에 담아서 불러옴 ( 브라우저 기준 시간 )
  // 예 2025년 6월 24일 14시 30분이면 이 객체가 그 정보를 다 담고 있음.
  const day = now.getDay();
  // 오늘이 무슨 요일인지 숫자로 구함
  // 일(0), 월(1), 화(2), 수(3), 목(4), 금(5), 토(6)
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  /* 지금 시각이 14시 30분이라면 now.getHours() = 14
                               now.getMinutes() = 30
                               14 * 60 + 30 = 870 (분)
     현재 시각을 "분 단위"로 계산 ( 예 : 14시 30분 -> 870분 )
     이렇게 해야 시간 비교가 쉬워짐 ( 문자열보다 훨씬 편리 ) */
  const today = openingHours.find(h => h.day === day);
  /*  .find = 배열에서 조건을 만족하는 첫 번째 요소를 찾아줌
            ㄴ openingHours 에 들어있는 배열중 첫번째 조건을 만족하는 요소를 찾아줌 
            ㄴ find()의 기본 구조 = const item = array.find(el => el조건 === 내가찾는값)
      h.day === day 를 만족하는 오늘 요일의 시간표를 찾음
      ㄴ 오늘이 월요일 ( day = 1 ) 이고
      ㄴ openingHours 에 { day: 1, open: "10:00", close: "22:00" }가 있으면 그걸 today로 가져옴
      ㄴ
      오늘 요일(day)과 일치하는 운영시간 정보를 찾음
      예 : openingHours에 [{ day: 1, open: "10:00", close: "22:00" }]이 있으면
      월요일(1)일 때 이 항목을 today로 저장 */
  if (!today) return '영업 전';
  // 오늘에 해당하는 영업시간 정보가 없다면 -> 그냥 "영업 전"
  const [oh, om] = today.open.split(":").map(Number);
  /*       ㄴ 계산을 쉽게 하기위해 구조분해 할당이란 문법을 사용
           ㄴ today.open = "10:00"
           ㄴ "10:00".split(":") = 문자열을 : 기준으로 나눠서 배열로 만듬 = ["10", "00"]
              -> 이제 시(hour)와 분(minute)이 문자열로 분리된 상태
           ㄴ .map(Number) = 배열의 각 요소(문자열)를 숫자로 변환
              -> ["10", "00"].map(Number) = [10, 0] 숫자로 변환
           ㄴ [oh, om] = [10, 0] === 구조 분해 할당
              -> 배열의 첫 번째 값(10)을 oh에, 두 번째 값(0)을 om에 저장
    -> today.open 이 "10:00"일 때
       그걸 : 기준으로 나눠서 -> ["10", "00"] 문자열로 첫번째 변환후
       숫자로 바꿔서 [10, 0] 각각 oh = 10, om = 0 으로 저장
  */
  // oh = openhour , om = openminute
  // today.open 은 "10:00" 같은 문자열
  // .split(":") -> "10:00" -> ["10", "00"]
  // .map(Number) -> ["10", "00"] -> [10, 0]
  const [ch, cm] = today.close.split(":").map(Number);
  // ch = closehour , cm = closemiunte
  // open/close 시간을 "시:분" 형태에서 분 단위 숫자로 분리
  // 예 : "10:00" -> [10, 0], "22:00" -> [22, 0]
  let open = oh * 60 + om;
  let close = ch * 60 + cm;
  // 위에서 분리한 시/분을 합쳐서 "분 단위" 숫자로 변환
  // 비교 연산을 쉽게 하기 위해서 필요
  if (close < open) {
    // 영업 종료 시간이 시작 시간보다 빠른 경우( 예: 밤 10시 -> 다음날 새벽 2시까지 )
    // 이건 '야간 영업'을 의미함
    return nowMinutes >= open || nowMinutes < close ? '영업 중' : '영업 전';
    // 예 : 지금 시간이 밤11시 ( 23:00 -> 1380 )고 open = 1320( 22:00 ), close = 120(02:00)
    // open보다 크거나 close보다 작으면 '영업 중'
  }
  return (nowMinutes >= open && nowMinutes < close) ? '영업 중' : '영업 전';
  // 일반적인 경우( open < close )
  // 지금 시간이 영업 시간 범위에 포함되면 '영업 중', 아니면 '영업 전'
}


// 전체가게 데이터를 정렬 + 즐겨찾기 필터 적용하는 함수
// baseList : 전체 검색 결과 배열
// sortKey : 정렬 기준 값 (rating, viewsm alphabet, reviews, favarite)
// 내부에서 즐겨찾기 전용인지 판단하여 필터링
function sortAndFilter(baseList, sortKey){
  let filtered = [...baseList];
  // baseList( 전체 가게 목록 )을 목사해서 filtered 라는 새 배열을 만듬
  // 원본 배열을 보호하기 위해 복사본을 만듬
  // 이후 정렬이나 필터링은 이 filtered 배열을 대상으로 수행함
  const isFavoriteOnly = sortKey === 'favorite';
  // 현재 정렬 기준이 "favorite"인지 확인
  // "즐겨찾기만 보기" 모드를 판단하기 위한 조건
  if (isFavoriteOnly) {
    // 만약 "favorite" 모드라면
    filtered = filtered.filter((store) => store.isFavorite === true);
    // 가게 목록중에서 store.isFavorite === true 인 항목만 걸러냄
    // 즉 즐겨찾기 된 가게만 남김, 이때는 정렬이 아니라 필터링만 수행하고 그대로 반환
  }
  switch(sortKey) {
    case 'rating':
      return filtered.sort((a,b) => b.rating - a.rating);
      /* sort(...) : 정렬함수 기본적으로는 문자열 유니코드 기준 오름차순으로 정렬.
                   ㄴ filtered.sort(...) 배열을 정렬
                   ㄴ (a, b) => b.rating - a.rating
                      ㄴ 배열의 두 요소 (a, b)를 비교 */
    case 'views':
      return filtered.sort((a,b) => b.viewCount - a.viewCount);
    case 'alphabet':
      return filtered.sort((a,b) => a.title.localeCompare(b.title));
      // localeCompare 는 다국어 비교에도 안정적으로 작동하는 문자열 비교 메서드.
    case 'reviewCount':
      return filtered.sort((a,b) => b.reviewCount - a.reviewCount);
    case 'likes':
      return filtered.sort((a,b) => b.likes - a.likes);
    case 'favorite':
      return filtered
      .filter(store => store.isFavorite === true)
      .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
    default:
      return filtered;
  }
}


function updateSortStatusText(sortKey) {
  const sortNameMap = {
    "rating": "평점순",
    "alphabet": "가나다순",
    "views": "조회수순",
    "favorite": "즐겨찾기순",
    "reviewCount": "리뷰 많은 순",
    "likes": "좋아요 많은 순"
  };
  const text = sortNameMap[sortKey] || "기본";
  const sortStatusEl = document.getElementById("sort-status");
  if (sortStatusEl) {
    sortStatusEl.textContent = `정렬 기준: ${text}`;
  }
}


async function renderTop5Ranking(useDummy = true) {
  // useDummy 가 true 때 실행 ( true면 더미용 , false면 실제 서버용 )
  const topRankingList = document.getElementById("topRankingList");
  if (!topRankingList) return;
  // id = "topRankingList" 요소를 찾아서, 없으면 그냥 종료
  // 사이드바 영역이 존재하지 않으면 오류 없이 무시됨

  // 탑5를 저장할 빈배열
  let top5 = [];

  if (useDummy) {
    console.log("ss")
    // 더미데이터를 사용하는경우
    top5 = dummyStoresData
      .map(store => {
        const userLikeSet = new Set(store.likeUsers || []);
        const userCommentSet = new Set(store.commentUsers || []);
        const userFavoriteSet = new Set(store.favoriteUsers || []);

        const uniqueLikeCount =  userLikeSet.size;
        const uniqueCommentCount = userCommentSet.size;
        const uniqueFavoriteCount = userFavoriteSet.size;
        const ratingCount = store.ratingCount || 0;

        const score = (uniqueLikeCount + uniqueCommentCount + uniqueFavoriteCount + ratingCount) / 4;
        return { ...store, compositeScore: score };
      })
      .sort((a, b) => b.compositeScore - a.compositeScore)
      .slice(0, 5);

      updateTopRankingList(top5);
  } else {
    try {
      const response = await axios.get("http://100.123.221.61:8082/api/ranking/top5");
      
      const top5 = response.data
        .map(store => {
          const score = (store.likes + store.comments + store.favorites + store.ratingCount) / 4
          return {
          ...store,
          compositeScore : Number(score.toFixed(1))
          };
        })
        .sort((a, b) => b.compositeScore - a.compositeScore)
        .slice(0, 5);
        updateTopRankingList(top5);
    } catch (error) {
      topRankingList.innerHTML = `<li style="color:red;">TOP5 불러오기 실패</li>`;
      console.error("Top5 요청 실패:", error);
    }
  }
}




// // top5 배열을 넘겨받음
function updateTopRankingList(top5) {
  // 받아온 데이터 top5 를 HTML에 뿌리기 위한 함수
  const topRankingList = document.getElementById("topRankingList");
  // HTML 안에 있는 <ul id="topRankingList"> 또는 <ol> 같은 리스트 박스를 가져옴
  // 이 안에다 <li>로 하나씩 가게를 넣음
  topRankingList.innerHTML = '';
  // 새로운 데이터를 갱신하기 위해 기존에 표시된 목록을 모두 초기화
  top5.forEach((store, index) => {
    // top5 배열을 하나씩 돌면서, store에 각 가게 객체가, index에 순번이 들어옴
    // store = 김밥천국 , index = 0 ---> store = 스시야 , index = 1 ---> ...
    const li = document.createElement("li");
    li.classList.add("top5-item")
    // <li> 태그 하나를 생성
    // 여기 안에 가게 이름/순위/조회수를 넣을 예정
    li.style.marginBottom = "12px";
    // li 태그밑에 12 픽셀만큼 여백을 줌
    li.innerHTML = `
      <div style="font-weight: bold; cursor: pointer; color: #0077cc; text-decoration: underline;">
        ${index + 1}위. ${store.title} / ${store.regionName || '-'}
      </div>
      <div style="font-size: 0.9em; color: gray;">인기점수 : ${Number(store.compositeScore).toFixed(1)}</div>
    `;

    li.addEventListener("click", () => {
      const id = store.restaurantId || store.id;
      window.location.href = `/feature-searchinfo/searchinfo.html?id=${id}`;
    });
    topRankingList.appendChild(li);
    // 완성된 <li>를 리스트 박스 ( topRankingList )안에 추가
    // 이걸 5번 반복해서 top5가 한 줄씩 쌓이게 됌.
  });
}


// 가게 20개씩 자르는 함수
// 예 : 100개의 가게 중에서 3페이지(41~60번째) 데이터만 잘라주는 역할
// 한 페이지에 출력 할 개수는 상단에서 선언된 itemsPerPage = 20 임
function paginate(items, page) {
    const start = (page - 1) * itemsPerPage;
    // 시작 인덱스 계산
    // page = 1 -> start = ( 1 - 1 ) * 20 = 0
    // page = 2 -> start = ( 2 - 1 ) * 20 = 20
    // page = 3 -> start = ( 3 - 1 ) * 20 = 40
    // 등의 n번째 페이지는 배열의 ( n - 1 ) * 20 번째 항목부터 시작
    const end = start + itemsPerPage;
    // 끝 인덱스를 계산
    // start = 40 -> end = 60 이면, index 40~59 까지를 잘라냄
    // 자르기 범위를 정해주는 역할
    return {
      pageItem : items.slice(start, end),
      startIndex : start + 1,
      endIndex : Math.min(end, items.length),
      totalItems : items.length
    };
    //items.slice(start, end)는 start 부터 end-1 까지 배열을 자름
    // items.slice(0, 20) -> 1페이지
    // items.slice(20, 40) -> 2페이지
    // items.slice(40, 60) -> 3페이지
    // 이 페이지에 해당하는 가게 데이터들만 추출되어 리턴됩니다.
}


function renderPagination(currentPage, totalPages){
  const container = document.getElementById("pagination");
  // id="pagination" 인 HTML 요소를 가져옴
  // 이 안에 페이지 숫자 버튼들을 넣을 예정
  container.innerHTML = "";
  // 기존에 있던 페이지 버튼들을 모두 제거
  // 새롭게 다시 그리기 위한 초기화
  let startPage = Math.max(1, currentPage - 10);
  // 몇 번째 페이지부터 버튼을 보여줄지 결정
  // currentPage - 10 부터 시작하되, 1보다 작아질 수 없으므로 Math.max() 사용
  // 예 현재 1페이지 -> startPage = 1
  // 예 현재 15페이지 -> startPage = 5
  // 총 출력되는 페이지 개수가 20개 이므로 15페이지 기준으로 +- 10페이지씩 보여야함 5~25 페이지
  let endPage = startPage + 19;
  // 20개의 버튼을 출력하겠다는 뜻
  // 마지막 페이지 = 시작페이지(1) + 19 === 마지막 페이지는 20이 됌
  // startPage + 19 가 마지막 페이지보다 클 수 있으므로 아래에서 조정
  if (endPage > totalPages) {
    // 만약에 전체 페이지보다 마지막 페이지가 많다면
    endPage = totalPages;
    // 마지막 페이지 번호에 전체 페이지 번호를 덮어씌움
    // 예 : 마지막 계산한 페이지가 50 이고 전체페이지가 44 라면
    //   ㄴ 마지막 페이지에 전체페이지인 44를 덮어싀움
    startPage = Math.max(1, endPage - 19);
    // Math.max(...) 괄호 안의 숫자중에 가장 큰 값을 찾아주는 JS 내장 함수
    // (...) 안의 숫자가 여러개라면 그 중에 가장 큰 숫자를 반환
    // (1, endPage - 19) = endPage 가 1보다 크다면 endPage 의 숫자를
    //                   = 1보다 작다면 1을 반환해서 최소값 1을 보장
    // endPage 가 바뀌었으니, startPage 도 다시 계산해야함
    // 20개를 만들려면 startPage = endPage - 19
    // 단 그 값이 1보다 작으면 안 되므로 Math.max()로 최소 1을 보장
    // endPage = 15 이면 startPage = 15 - 19 = -4 이므로
    // Math.max(1, -4) -> startPage = 1
  }
  for (let i=startPage; i<=endPage; i++) {
    // startPage 부터 endPage 까지 반복하면서 페이지 버튼을 하나씩 생성
    const button = document.createElement("button");
    // HTML 버튼 하나를 생성함
    button.textContent = i;
    // HTML 버튼 안에 들어갈 텍스트를 현재 페이지 번호 ( i )로 설정
    button.className = i === currentPage ? "active" : "";
    // 햔재 페이지 번호가 i 와 같으면 클래스명을 "active"로 설정함
    // 이걸로 CSS에서 선택된 버튼만 강조(밑줄/배경색 등) 설정 가능
    // 예 : 현재 페이지가 3일 때 : <button class="active"> 3 </button> 이됌
    button.addEventListener("click", () => {
      // 버튼을 클릭했을때 실행되는 이벤트
      renderStoreCards(paginate(currentStores, i));
      // 전체 가게 데이터 중에서 i번째 페이지에 해당하는 가게들만 잘라서 화면에 출력
      renderPagination(i, totalPages);
      // 클릭된 페이지 기준으로 다시 페이지 버튼 전체를 다시 그림
    });
    container.appendChild(button);
    // 위에서 만든 버튼을 실제 HTML에 붙이는 작업
    // <div id="pagination"> 안에 버튼이 쭉 생성됌
  }
  if(totalPages > endPage) {
    // 만약에 마지막 페이지보다 전체 페이지가 크다면
    const dots = document.createElement("span");
    // <span> 태그를 하나 생성 span은 텍스트 출력용 작은 태그
    dots.textContent = "...";
    // 이 span 안에 텍스트로 ... 를 입력
    // 시각적으로 "중간 생략됨"을 보여주기 위함
    container.appendChild(dots);
    // 만들어진 ...을 페이지 버튼 영역에 붙임
    const lastButton = document.createElement("button");
    // 마지막 페이지 버튼을 생성
    lastButton.textContent = totalPages;
    // 그 버튼 안에 표시될 숫자를 전체 페이지 수로 설정
    // 예 : 마지막  페이지가 995 라면 <button> 995 </button> 가 됌
    lastButton.addEventListener("click", () => {
      // 마지막 페이지의 버튼을 클릭했을때의 이벤트
      renderStoreCards(paginate(currentStores, totalPages));
      // 마지막 페이지에 해당하는 가게 리스트만 잘라서 화면에 출력
      renderPagination(totalPages, totalPages);
      // 그리고 페이지네이션도 마지막 페이지를 기준으로 다시 그림
      // active 표시와 페이지 버튼 범위 갱신
    });
    container.appendChild(lastButton);
    // 마지막 페이지 버튼을 실제 HTML에 붙임
  }
};
// 더미 추후삭제
async function fetchStoresDataDummy(keyword = '') {
  const allDummy = highScoreDummies.concat(dummyStoresData);
  return allDummy.filter(store =>
    store.title.includes(keyword) ||
    store.regionName.includes(keyword) ||
    store.menuNames.includes(keyword)
  );
}