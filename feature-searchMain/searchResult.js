// const isLoggedIn = localStorage.getItem("isLoggedIn");
// const nickname = localStorage.getItem("nickname");
// function requireLogin(callback) {
//   const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
//   if (!isLoggedIn) {
//     alert("로그인이 필요합니다.");
//     return;
//   }
//   if (typeof callback === "function") {
//     callback();
//   }
// }

const itemsPerPage = 20;
let currentStores = [];
let currentSortKey = "rating";
let keyword = "";

// 추후 JWT토큰으로 로그인시 주석해제
// const token = localStorage.getItem("accessToken");
// if (!token) {
//   alert("토큰 없음. 로그인 필요");
//   return;
// }

document.addEventListener('DOMContentLoaded', async () => {
  const searchQueryDisplay = document.getElementById('searchQueryDisplay');
  const sortOption = document.getElementById('sortOption');

  const params = new URLSearchParams(window.location.search);
  const rawKeyword = params.get("keyword") || "";
  keyword = rawKeyword.replace(/:\d+$/, "");
  const sortKey = params.get("sortKey") || "rating";
  currentSortKey = sortKey;

  searchQueryDisplay.textContent = `'${keyword}' 검색 결과`;
  sortOption.value = sortKey;

  const { stores, totalResults, currentPage, totalPages } = await fetchStoresDataReal(keyword, sortKey);
  // const fullStores = [...stores];
  currentStores = stores;

  // let currentPage = 1;
  // const totalPages = Math.ceil(currentStores.length / itemsPerPage);

  renderStoreCards({
    pageItem: currentStores,
    startIndex: (currentPage - 1) * itemsPerPage + 1,
    endIndex: Math.min(currentPage * itemsPerPage, totalResults),
    totalItems: totalResults
  });
  renderPagination(currentPage, totalPages, keyword);
  updateSortStatusText(currentSortKey);

  sortOption?.addEventListener('change', async () => {
    const selectedSort = sortOption.value;
    const newUrl = new URL(window.location);
    newUrl.searchParams.set("sortKey", selectedSort);
    history.replaceState(null, "", newUrl);

    const { stores, totalResults, currentPage, totalPages } = await fetchStoresDataReal(keyword, selectedSort, 1);
    currentStores = stores;
    // currentPage = 1;
    currentSortKey = selectedSort;


    renderStoreCards({
      pageItem: currentStores,
      startIndex: (currentPage - 1) * itemsPerPage + 1,
      endIndex: Math.min(currentPage * itemsPerPage, totalResults),
      totalItems: totalResults
    });
    renderPagination(currentPage, totalPages, keyword);
    updateSortStatusText(selectedSort);
  });
  // renderTop5Ranking();
});


// 화면에 가게 목록 카드들을 렌더링
async function fetchStoresDataReal(keyword = '', sortKey = '', page = 1) {
  try {
    const response = await axios.get("http://192.168.0.110:8080/nomzy/search", {
      params: { keyword, sortKey, page },
      headers : {
      // Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    });
    const { results, currentPage, totalResults, totalPages } = response.data;
    return {
      stores:results.map(item => {
      const fullRegion = item.regionName || "";
      const regionDo = fullRegion.split(" ")[0] || "";

      return {
        restaurantId: item.restaurantId,
        title: item.title || "이름없음",
        menuNames: item.menuNames || "기타",
        regionName: regionDo,
        isFavorite: item.bookmarked || false,
        rating: item.rating,
        reviewCount: item.reviews,
        viewCount: item.viewCount,
        bookmarkCount: item.bookmarkCount,
        likeCount: item.likeCount,
        tagNames: item.tagNames,
        openingHours: [
          { day: 1, open: "10:00", close: "22:00" },
          { day: 2, open: "10:00", close: "22:00" }
        ],
        // images: ["/images/store1.jpg", "/images/store2.jpg"],
      };
    }),
    currentPage,
    totalResults,
    totalPages
  };
  } catch (error) {
    console.error("실서버 데이터 불러오기 실패", error);
    return {
      stores: [],
      currentPage: 1,
      totalResults: 0,
      totalPages: 1
    };
  }
}


// 단일 가게 카드를 생성하여 DOM 요소로 반환
function createStoreCard(store) {
  const card = document.createElement("div");
  card.className = "store-card";

  const isOpen = Array.isArray(store.openingHours) && getStoreStatus(store.openingHours) === '영업 중';
  const rating = isNaN(store.rating) ? "0.0" : store.rating.toFixed(1);
  const reviewCount = store.reviewCount > 999 ? '999+' : store.reviewCount;
  // if (reviewCount === undefined) {
  //   reviewCount = 0;
  // }

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
      </div>
      <div class="store-details">
        <span class="status ${isOpen ? 'open' : ''}">${isOpen ? '영업 중' : '영업 전'}</span>
        <span class="rating">★ ${rating}</span>
        <span class="reviews">리뷰 ${reviewCount}</span>
      </div>
    </div>
    <div class="store-images">
      ${(store.images || []).slice(0, 4).map(src => `
        <img src="${src}" alt="${store.title} 이미지" loading="lazy">
      `).join('')}
    </div>
  `;

  const link = card.querySelector(".store-link");
  link.addEventListener("click", () => {
    window.location.href = `/feature-searchinfo/searchinfo.html?id=${store.restaurantId}`;
  });

  const favBtn = card.querySelector(".favorite-button");
  favBtn.addEventListener("click", () => {
   requireLogin(async () => {
    const newStatus = !favBtn.classList.contains("active");
    favBtn.classList.toggle("active", newStatus);

    try {
      await axios.post("http://192.168.0.110:8080/nomzy/favorite/toggle", {
        restaurantId: store.restaurantId,
        favorite: newStatus,
        nickname: nickname
      }, {
        headers: {
          "Content-Type" : "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });   
    } catch (error) {
      favBtn.classList.toggle("active", !newStatus);
      console.error(error);
    }
  });
});

  // 좋아요 버튼
  const likeButton = card.querySelector(".like-button");
  likeButton.addEventListener("click", () => {
    requireLogin(async () => {

    const newLiked = !likeButton.classList.contains("active");
    likeButton.classList.toggle("active", newLiked);

    try {
      await axios.post("http://192.168.0.110:8080/nomzy/like/toggle", {
        restaurantId: store.restaurantId,
        liked: newLiked,
        nickname: nickname
      }, {
        headers: {
          "Content-Type" : "application/json",
          // Authorization: `Bearer ${localStorage.getItem("token")}`
        }
        });
    } catch (error) {
      likeButton.classList.toggle("active", !newLiked);
      console.error(error);
    }
  });
});
return card;
}


// 화면에 가게 목록 카드들을 렌더링
function renderStoreCards(stores) {
  const storeListContainer = document.querySelector('.store-list-container');
  storeListContainer.innerHTML = '';

  const summaryBox = document.getElementById("searchResultSummary");
  if (!stores.pageItem || stores.pageItem.length === 0) {
    storeListContainer.innerHTML = '<p style="text-align:center">검색 결과가 없습니다.</p>';
    if (summaryBox) summaryBox.textContent = '';
    return;
  }

  if (summaryBox) {
    summaryBox.textContent = `총 ${stores.totalItems}개의 결과 중 ${stores.startIndex}~${stores.endIndex}번 표시 중입니다.`;
  }

  stores.pageItem.forEach(store => {
    storeListContainer.appendChild(createStoreCard(store));
  });
}


// 운영시간 정보를 기준으로 현재 가게가 영업 중인지 판단
function getStoreStatus(openingHours) {
  if (!Array.isArray(openingHours)) return '영업 전';

  const now = new Date();
  const day = now.getDay();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const today = openingHours.find(h => h.day === day);
  if (!today) return '영업 전';

  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);

  let open = oh * 60 + om;
  let close = ch * 60 + cm;

  if (close < open) {
    return nowMinutes >= open || nowMinutes < close ? '영업 중' : '영업 전';
  }
  return (nowMinutes >= open && nowMinutes < close) ? '영업 중' : '영업 전';
}



// 정렬 기준에 따라 정렬 및 즐겨찾기 필터링 수행
// function sortAndFilter(baseList, sortKey) {
//   let filtered = [...baseList];
//   const isFavoriteOnly = sortKey === 'favorite';

//   if (isFavoriteOnly) {
//     filtered = filtered.filter(store => store.isFavorite === true);
//   }

//   switch (sortKey) {
//     case 'rating':
//       return filtered.sort((a, b) => b.rating - a.rating);
//     case 'views':
//       return filtered.sort((a, b) => b.viewCount - a.viewCount);
//     case 'alphabet':
//       return filtered.sort((a, b) => a.title.localeCompare(b.title));
//     case 'reviewCount':
//       return filtered.sort((a, b) => b.reviewCount - a.reviewCount);
//     case 'likeCount':
//       return filtered.sort((a, b) => b.likeCount - a.likeCount);
//     case 'favorite':
//       return filtered
//         .filter(store => store.isFavorite === true)
//         .sort((a, b) => b.rating - a.rating || a.title.localeCompare(b.title));
//     default:
//       return filtered;
//   }
// }


// 서버에서 Top5 인기 가게를 불러와 사이드바에 출력
// async function renderTop5Ranking() {
//   const topRankingList = document.getElementById("topRankingList");
//   if (!topRankingList) return;

//   try {
//     const response = await axios.get("http://192.168.0.110:8080/nomzy/ranking/top5", {
//       headers: {
//       // Authorization: `Bearer ${localStorage.getItem("token")}`
//       }
//     }
//   );

//     const top5 = response.data
//       .map(store => {
//         const score = (store.likeCount + store.comments + store.favorites + store.ratingCount) / 4;
//         return {
//           ...store,
//           compositeScore: Number(score.toFixed(1))
//         };
//       })
//       .sort((a, b) => b.compositeScore - a.compositeScore)
//       .slice(0, 5);

//     updateTopRankingList(top5);

//   } catch (error) {
//     topRankingList.innerHTML = `<li style="color:red;">TOP5 불러오기 실패</li>`;
//     console.error("Top5 요청 실패:", error);
//   }
// }


// // Top5 데이터를 사이드바 리스트로 렌더링
// function updateTopRankingList(top5) {
//   const topRankingList = document.getElementById("topRankingList");
//   topRankingList.innerHTML = '';

//   top5.forEach((store, index) => {
//     const li = document.createElement("li");
//     li.classList.add("top5-item");
//     li.style.marginBottom = "12px";

//     li.innerHTML = `
//       <div style="font-weight: bold; cursor: pointer; color: #0077cc; text-decoration: underline;">
//         ${index + 1}위. ${store.title} / ${store.regionName || '-'}
//       </div>
//       <div style="font-size: 0.9em; color: gray;">인기점수 : ${store.compositeScore ?? "N/A"}</div>
//     `;

//     li.addEventListener("click", () => {
//       const id = store.restaurantId || store.id;
//       window.location.href = `/feature-searchinfo/searchinfo.html?id=${id}`;
//     });

//     topRankingList.appendChild(li);
//   });
// }


// 전체 가게 목록에서 현재 페이지에 해당하는 항목만 잘라 반환
function paginate(items, page) {
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  return {
    pageItem: items.slice(start, end),
    startIndex: start + 1,
    endIndex: Math.min(end, items.length),
    totalItems: items.length
  };
}



// 페이지네이션 버튼들을 생성하여 표시
function renderPagination(currentPage, totalPages, keyword) {
  const container = document.getElementById("pagination");
  container.innerHTML = "";

  let startPage = Math.max(1, currentPage - 10);
  let endPage = startPage + 19;

  if (endPage > totalPages) {
    endPage = totalPages;
    startPage = Math.max(1, endPage - 19);
  }

  for (let i = startPage; i <= endPage; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.className = i === currentPage ? "active" : "";
    button.addEventListener("click", async () => {
      const { stores, totalResults } = await fetchStoresDataReal(keyword, currentSortKey, i);
      currentStores = stores;

      renderStoreCards({
        pageItem: currentStores,
        startIndex: (i - 1) * itemsPerPage + 1,
        endIndex: Math.min(i * itemsPerPage, totalResults),
        totalItems: totalResults
      });
      renderPagination(i, totalPages, keyword);
    });
    container.appendChild(button);
  }

  // 첫 페이지 버튼 추가
  if (startPage > 1) {
    const firstButton = document.createElement("button");
    firstButton.textContent = "1";
    firstButton.addEventListener("click", async () => {
      const { stores, totalResults } = await fetchStoresDataReal(keyword, currentSortKey, 1)
      currentStores = stores;

      renderStoreCards({
        pageItem: currentStores,
        startIndex: 1,
        endIndex: Math.min(itemsPerPage, totalResults),
        totalItems: totalResults
      });
      renderPagination(1, totalPages, keyword);
    });
    container.prepend(firstButton);
  }

  // 마지막 페이지 버튼 추가
  if (totalPages > endPage) {
    const dots = document.createElement("span");
    dots.textContent = "...";
    container.appendChild(dots);

    const lastButton = document.createElement("button");
    lastButton.textContent = totalPages;
    lastButton.addEventListener("click", async () => {
      const {stores, totalResults } = await fetchStoresDataReal(keyword, currentSortKey, totalPages);
      currentStores = stores;

      renderStoreCards({
        pageItem: currentStores,
        startIndex: (totalPages - 1) * itemsPerPage + 1,
        endIndex: Math.min(totalPages * itemsPerPage, totalResults),
        totalItems: totalResults
      });
      renderPagination(totalPages, totalPages, keyword);
    });
    container.appendChild(lastButton);
  }
}

// 현재 정렬 기준을 텍스트로 표시 영역에 출력
function updateSortStatusText(sortKey) {
  const sortNameMap = {
    rating: "평점순",
    name: "가나다순",
    viewCount: "조회수순",
    bookmarkCount: "즐겨찾기순",
    reviewCount: "리뷰 많은 순",
    likeCount: "좋아요 많은 순"
  };

  const text = sortNameMap[sortKey] || "기본";
  const sortStatusEl = document.getElementById("sort-status");
  if (sortStatusEl) {
    sortStatusEl.textContent = `정렬 기준: ${text}`;
  }
}