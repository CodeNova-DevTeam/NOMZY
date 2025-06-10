document.addEventListener('DOMContentLoaded', async () => {
    const storeListContainer = document.querySelector('.store-list-container');

    // 가상의 서버 API 엔드포인트 
    const STORES_API_URL = 'https://api.example.com/stores'; // 가게 목록을 가져올 API 엔드포인트 추후 실제api로 변경
    const FAVORITE_API_URL = 'https://api.example.com/favorites'; // 즐겨찾기 상태를 업데이트할 API 엔드포인트 추후 실제api로 변경

    // (개발용) 서버 응답을 시뮬레이션하는 더미 데이터
    const dummyStoresData = [
        {
            id: 'store1',
            name: '첫번째 가게',
            category: '첫번째 음식',
            rating: 4.56,
            reviews: 999,
            openingHours: [
                { day: 0, open: '10:00', close: '22:00' }, // 일요일
                { day: 1, open: '10:00', close: '22:00' }, // 월요일
                { day: 2, open: '10:00', close: '22:00' }, // 화요일
                { day: 3, open: '10:00', close: '22:00' }, // 수요일
                { day: 4, open: '10:00', close: '22:00' }, // 목요일
                { day: 5, open: '10:00', close: '22:00' }, // 금요일
                { day: 6, open: '10:00', close: '22:00' }, // 토요일
            ],
            images: [
                'https://via.placeholder.com/150x150/FF5733/FFFFFF?text=P1',
                'https://via.placeholder.com/150x150/33FF57/FFFFFF?text=P2',
                'https://via.placeholder.com/150x150/3357FF/FFFFFF?text=P3',
                'https://via.placeholder.com/150x150/FF33A1/FFFFFF?text=P4',
                'https://via.placeholder.com/150x150/A133FF/FFFFFF?text=P5',
                'https://via.placeholder.com/150x150/33A1FF/FFFFFF?text=P6',
            ],
            isFavorite: false
        },
        {
            id: 'store2',
            name: '두번째 가게',
            category: '두번째 가게',
            rating: 4.36,
            reviews: 999,
            openingHours: [
                { day: 0, open: '11:00', close: '21:00' },
                { day: 1, open: '11:00', close: '21:00' },
                { day: 2, open: '11:00', close: '21:00' },
                { day: 3, open: '11:00', close: '21:00' },
                { day: 4, open: '11:00', close: '21:00' },
                { day: 5, open: '11:00', close: '21:00' },
                { day: 6, open: '11:00', close: '21:00' },
            ],
            images: [
                'https://via.placeholder.com/150x150/F0F8FF/000000?text=Y1',
                'https://via.placeholder.com/150x150/FAEBD7/000000?text=Y2',
                'https://via.placeholder.com/150x150/00FFFF/000000?text=Y3',
                'https://via.placeholder.com/150x150/7FFFD4/000000?text=Y4',
                'https://via.placeholder.com/150x150/F5F5DC/000000?text=Y5',
                'https://via.placeholder.com/150x150/FFE4C4/000000?text=Y6',
            ],
            isFavorite: true
        },
        {
            id: 'store3',
            name: '세번째 가게',
            category: '세번째 가게',
            rating: 4.80,
            reviews: 520,
            openingHours: [
                { day: 1, open: '10:00', close: '22:00' },
                { day: 2, open: '10:00', close: '22:00' },
                { day: 3, open: '10:00', close: '22:00' },
                { day: 4, open: '10:00', close: '22:00' },
                { day: 5, open: '10:00', close: '22:00' },
                { day: 6, open: '10:00', close: '22:00' },
            ],
            images: [
                'https://via.placeholder.com/150x150/C0C0C0/000000?text=M1',
                'https://via.placeholder.com/150x150/808080/FFFFFF?text=M2',
                'https://via.placeholder.com/150x150/D3D3D3/000000?text=M3',
                'https://via.placeholder.com/150x150/A9A9A9/FFFFFF?text=M4',
                'https://via.placeholder.com/150x150/696969/FFFFFF?text=M5',
                'https://via.placeholder.com/150x150/2F4F4F/FFFFFF?text=M6',
            ],
            isFavorite: false
        },
        {
            id: 'store4',
            name: '네번째 가게',
            category: '네번째 가게',
            rating: 4.12,
            reviews: 310,
            openingHours: [
                { day: 0, open: '14:00', close: '02:00' }, // 일요일
                { day: 1, open: '14:00', close: '02:00' }, // 월요일 (익일 2시까지)
                { day: 2, open: '14:00', close: '02:00' },
                { day: 3, open: '14:00', close: '02:00' },
                { day: 4, open: '14:00', close: '02:00' },
                { day: 5, open: '14:00', close: '02:00' },
                { day: 6, open: '14:00', close: '02:00' },
            ],
            images: [
                'https://via.placeholder.com/150x150/FFD700/000000?text=C1',
                'https://via.placeholder.com/150x150/DAA520/000000?text=C2',
                'https://via.placeholder.com/150x150/B8860B/000000?text=C3',
                'https://via.placeholder.com/150x150/A0522D/000000?text=C4',
                'https://via.placeholder.com/150x150/D2B48C/000000?text=C5',
                'https://via.placeholder.com/150x150/F5DEB3/000000?text=C6',
            ],
            isFavorite: true
        }
    ];

    // --- 서버에서 가게 데이터를 불러오는 함수 (fetch API 사용) ---
    async function fetchStoresData() {
        try {
            // 실제 서버 API 호출
            // const response = await fetch(STORES_API_URL); 나중에 주석해제

            // 개발용: 더미 데이터를 Promise로 반환하여 서버 호출 시뮬레이션
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        ok: true, // 네트워크 요청 성공 여부 (HTTP 상태 코드 200-299)
                        json: () => Promise.resolve(dummyStoresData) // JSON 데이터 반환
                    });
                }, 500); // 0.5초 지연을 두어 네트워크 지연 시뮬레이션
            });


            if (!response.ok) {
                // HTTP 상태 코드가 200-299 범위가 아닌 경우 (예: 404, 500 등)
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('가게 데이터를 불러오는 중 오류 발생:', error);
            // 사용자에게 오류 메시지를 표시하거나, 빈 배열 반환 등 적절히 처리
            return [];
        }
    }

    // 즐겨찾기 상태를 서버에 업데이트하는 함수
    // 실제 서버에서는 이 함수가 즐겨찾기 추가/삭제 API를 호출.
    async function updateFavoriteStatus(storeId, isFavorite) {
        try {
            // 실제 서버 API 호출 (POST 요청)
            // const response = await fetch(`${FAVORITE_API_URL}/${storeId}`, {
            //     method: 'POST'
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify({ isFavorite: isFavorite }),
            // });

            // 개발용: 서버 응답 시뮬레이션
            const response = await new Promise(resolve => {
                setTimeout(() => {
                    console.log(`[Mock Server] Store ${storeId} 즐겨찾기 상태 업데이트: ${isFavorite}`);
                    resolve({ ok: true }); // 성공 응답 시뮬레이션
                }, 200);
            });

            if (!response.ok) {
                throw new Error(`즐겨찾기 상태 업데이트 실패! status: ${response.status}`);
            }
            console.log(`Store ${storeId} 즐겨찾기 상태가 서버에 성공적으로 반영되었습니다.`);
        } catch (error) {
            console.error('즐겨찾기 상태 업데이트 중 오류 발생:', error);
            alert('즐겨찾기 상태 업데이트에 실패했습니다. 다시 시도해 주세요.');
        }
    }

    // --- 영업 상태를 확인하는 함수 (이전과 동일) ---
    function getStoreStatus(openingHours) {
        const now = new Date();
        const currentDay = now.getDay(); // 0 (일요일) ~ 6 (토요일)
        const currentTimeInMinutes = now.getHours() * 60 + now.getMinutes();

        const todaySchedule = openingHours.find(schedule => schedule.day === currentDay);

        if (!todaySchedule) {
            return '영업 전'; // 오늘 영업 안 함
        }

        const openTimeParts = todaySchedule.open.split(':').map(Number);
        const closeTimeParts = todaySchedule.close.split(':').map(Number);

        let openTimeInMinutes = openTimeParts[0] * 60 + openTimeParts[1];
        let closeTimeInMinutes = closeTimeParts[0] * 60 + closeTimeParts[1];

        // 자정을 넘어가는 영업 시간 처리 (예: 22:00 ~ 02:00)
        if (closeTimeInMinutes < openTimeInMinutes) {
            if (currentTimeInMinutes >= openTimeInMinutes || currentTimeInMinutes < closeTimeInMinutes) {
                return '영업 중';
            }
        } else {
            if (currentTimeInMinutes >= openTimeInMinutes && currentTimeInMinutes < closeTimeInMinutes) {
                return '영업 중';
            }
        }

        return '영업 전';
    }

    // 가게 카드 HTML을 생성하는 함수
    function createStoreCard(store) {
        const storeCard = document.createElement('div');
        storeCard.className = 'store-card';
        storeCard.dataset.storeId = store.id;

        const statusText = getStoreStatus(store.openingHours);
        const isOpen = statusText === '영업 중';
        const reviewsDisplay = store.reviews > 999 ? '999+' : store.reviews;
        const formattedRating = store.rating.toFixed(2);

        storeCard.innerHTML = `
            <div class="store-info">
                <div class="store-header">
                    <h3 class="store-name">
                        <a href="#" class="store-link">${store.name}</a>
                    </h3>
                    <span class="store-category">${store.category}</span>
                    <button class="favorite-button ${store.isFavorite ? 'active' : ''}" aria-label="즐겨찾기">☆</button>
                </div>
                <div class="store-details">
                    <span class="status ${isOpen ? 'open' : ''}" data-status="${isOpen ? 'open' : 'closed'}">${statusText}</span>
                    <span class="rating" data-rating="${formattedRating}">★ ${formattedRating}</span>
                    <span class="reviews" data-reviews="${store.reviews}">리뷰 ${reviewsDisplay}</span>
                </div>
            </div>
            <div class="store-images">
                ${store.images.map(imgSrc => `<img src="${imgSrc}" alt="${store.name} 이미지">`).join('')}
            </div>
        `;

        // 즐겨찾기 버튼 이벤트 리스너 추가 (동적으로 생성되므로 여기서 추가)
        const favoriteButton = storeCard.querySelector('.favorite-button');
        favoriteButton.addEventListener('click', async () => {
            const currentFavoriteStatus = favoriteButton.classList.contains('active');
            const newFavoriteStatus = !currentFavoriteStatus; // 현재 상태의 반대
            
            // UI를 먼저 변경하여 사용자에게 즉각적인 피드백 제공 (옵티미스틱 업데이트)
            favoriteButton.classList.toggle('active');

            try {
                
                await updateFavoriteStatus(store.id, newFavoriteStatus);
                // 서버 요청 성공 시, UI 상태는 이미 변경되어 있으므로 추가 작업 없음
            } catch (error) {
                // 서버 요청 실패 시, UI를 이전 상태로 롤백 (사용자에게 실패했음을 알림)
                favoriteButton.classList.toggle('active'); // UI 롤백
                console.error(`즐겨찾기 상태를 ${store.name}에 대해 변경하지 못했습니다:`, error);
                alert(`"${store.name}" 즐겨찾기 상태 업데이트에 실패했습니다. 다시 시도해 주세요.`);
            }
        });

        return storeCard;
    }

    // 모든 가게 카드를 렌더링하는 메인 함수
    async function renderAllStoreCards() {
        storeListContainer.innerHTML = '<div>가게 정보를 불러오는 중...</div>';

        try {
            const stores = await fetchStoresData(); // 실제 서버에서 데이터 불러오기

            // 컨테이너 비우기
            storeListContainer.innerHTML = '';

            // 각 가게에 대해 카드 생성 및 추가
            if (stores.length > 0) {
                stores.forEach(store => {
                    const storeCard = createStoreCard(store);
                    storeListContainer.appendChild(storeCard);
                });
            } else {
                storeListContainer.innerHTML = '<div>표시할 가게 정보가 없습니다.</div>';
            }

        } catch (error) {
            console.error('가게 목록 렌더링 중 오류 발생:', error);
            storeListContainer.innerHTML = '<div>가게 정보를 불러오는 데 실패했습니다. 잠시 후 다시 시도해 주세요.</div>';
        }
    }

    renderAllStoreCards();
});