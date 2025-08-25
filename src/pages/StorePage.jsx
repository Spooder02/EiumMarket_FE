// src/pages/StorePage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiFetch } from "../lib/api";
import { loadKakaoMap } from '../lib/kakaoMapLoader';

// --- 아이콘 SVG 컴포넌트들 ---
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const HeartOutline = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);
const HeartFilled = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-rose-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.177 25.18 25.18 0 01-4.244-2.637C4.688 16.345 2 13.364 2 9.818 2 7.19 4.064 5 6.7 5c1.54 0 2.884.74 3.8 1.88C11.416 5.74 12.76 5 14.3 5 16.936 5 19 7.19 19 9.818c0 3.546-2.688 6.527-4.989 8.265a25.175 25.175 0 01-4.244 2.637 15.247 15.247 0 01-.383-.177l-.022.01-.007.003a.75.75 0 01-.61 0z" />
  </svg>
);
const SmallHeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-rose-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

export default function StorePage({ onSelectProduct, cartItemCount }) {
  const [activeTab, setActiveTab] = useState('홈');
  const [storeData, setStoreData] = useState(null);
  const [reviewData, setReviewData] = useState({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  
  const mapContainer = useRef(null);

  const navigate = useNavigate();
  const { marketId, shopId } = useParams();
  
  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const shopResponse = await apiFetch(`/markets/${marketId}/shops/${shopId}`);
        const shopData = await shopResponse.json();
        setStoreData(shopData);

        const reviewResponse = await apiFetch(`/shops/${shopId}/reviews`);
        const reviewResult = await reviewResponse.json();
        if (reviewResult.content && reviewResult.content.length > 0) {
          const totalRating = reviewResult.content.reduce((sum, review) => sum + review.rating, 0);
          const averageRating = totalRating / reviewResult.content.length;
          setReviewData({
            average: averageRating,
            count: reviewResult.totalElements,
          });
        }

        const key = `fav_${marketId}_${shopId}`;
        setFavorited(localStorage.getItem(key) === '1');
      } catch (error) {
        console.error("데이터를 불러오는 데 실패했습니다.", error.message);
        setStoreData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [shopId, marketId]);

  useEffect(() => {
    if (activeTab === '지도' && storeData && mapContainer.current) {
      loadKakaoMap().then(kakao => {
        const mapOption = {
          center: new kakao.maps.LatLng(storeData.latitude, storeData.longitude),
          level: 3,
        };
        const map = new kakao.maps.Map(mapContainer.current, mapOption);
        const markerPosition = new kakao.maps.LatLng(storeData.latitude, storeData.longitude);
        const marker = new kakao.maps.Marker({ position: markerPosition });
        marker.setMap(map);
      }).catch(console.error);
    }
  }, [activeTab, storeData]);

  async function handleFavoriteToggle() {
    if (favLoading) return;
    setFavLoading(true);
    const key = `fav_${marketId}_${shopId}`;
    const wasFav = favorited;
    setFavorited(!wasFav);
    setStoreData(prev => prev ? { ...prev, favoriteCount: prev.favoriteCount + (wasFav ? -1 : 1) } : null);
    try {
      const method = wasFav ? "DELETE" : "POST";
      const res = await apiFetch(`/markets/${marketId}/shops/${shopId}/favorites`, { method });
      if (!res.ok && ![409, 404].includes(res.status)) throw new Error(`API call failed: ${res.status}`);
      if (wasFav) localStorage.removeItem(key);
      else localStorage.setItem(key, "1");
      window.dispatchEvent(new Event("favorites:changed"));
    } catch (e) {
      console.error(e);
      setFavorited(wasFav);
      setStoreData(prev => prev ? { ...prev, favoriteCount: prev.favoriteCount } : null);
      alert("찜 처리에 실패했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setFavLoading(false);
    }
  }

  if (loading) return <div className="flex justify-center items-center h-full">가게 정보를 불러오는 중...</div>;
  if (!storeData) return (
    <div className="flex flex-col items-center justify-center h-full">
      <p className="text-xl">가게 정보를 찾을 수 없습니다.</p>
      <Link to="/" className="mt-4 text-emerald-600 font-bold">홈으로 돌아가기</Link>
    </div>
  );

  const TabButton = ({ name }) => (
    <button onClick={() => setActiveTab(name)} className={`flex-1 pb-2 text-center font-bold ${activeTab === name ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>
      {name}
    </button>
  );

  return (
    <div className="h-full bg-white flex flex-col relative">
      <button onClick={() => navigate(`/markets/${marketId}/shops`)} className="absolute top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md" aria-label="Go back">
        <BackIcon />
      </button>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <div className="w-full h-48 bg-gray-200">
            <img src={BACKEND_ENDPOINT + storeData.imageUrls[0].replace(/[[\]"]/g, '')} alt={storeData.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold">{storeData.name}</h1>
              <button onClick={handleFavoriteToggle} disabled={favLoading} aria-label={favorited ? "찜 취소" : "찜하기"} className={`rounded-full p-1.5 active:scale-95 disabled:opacity-60`}>
                {favorited ? <HeartFilled /> : <HeartOutline />}
              </button>
            </div>
            {/* --- 수정된 부분 --- */}
            <div className="mt-1 space-y-1">
              <div className="flex items-center text-sm">
                <StarIcon />
                <span className="font-bold ml-1">{reviewData.average.toFixed(1)}</span>
                <button onClick={() => navigate(`/markets/${marketId}/shops/${shopId}/reviews`)} className="text-gray-500 ml-2 hover:underline">
                  (리뷰 {reviewData.count}개)
                </button>
              </div>
              <div className="flex items-center text-sm">
                <SmallHeartIcon />
                <span className="font-bold ml-1 text-gray-700">찜 {storeData.favoriteCount}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-around border-b px-4">
            <TabButton name="홈" />
            <TabButton name="지도" />
            <TabButton name="메뉴" />
            <TabButton name="리뷰" />
          </div>
        </div>
        <main className="flex-1 overflow-y-auto">
          {activeTab === '홈' && <div className="p-4 space-y-6"> <InfoSection icon={<LocationIcon />} text={storeData.address} /> <InfoSection icon={<ClockIcon />} text={storeData.openingHours} /> <InfoSection icon={<PhoneIcon />} text={storeData.phoneNumber} isCopyable={true} /> <div> <h3 className="font-bold mb-2">가게 설명</h3> <p>{storeData.description}</p> </div> </div>}
          {activeTab === '지도' && <div ref={mapContainer} className="w-full h-full"></div>}
          {activeTab === '메뉴' && (
            storeData.items.length > 0 ? (
              <ul className="divide-y">
                {storeData.items.map((item, index) => (
                  <li key={index} onClick={() => onSelectProduct(item)} className="flex items-start justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex-grow pr-4">
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 mb-2">{item.description}</p>
                      <div className="font-bold text-base">{item.price.toLocaleString()}원</div>
                    </div>
                    <div className="w-24 h-24 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0] && (
                        <img src={BACKEND_ENDPOINT + item.imageUrls[0].replace(/[\[\]"]/g, '')} alt={item.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="font-bold">등록된 메뉴가 없습니다.</p>
              </div>
            )
          )}
          {activeTab === '리뷰' && 
            <div className="p-4 text-center">
              <p className="mb-4">손님들의 생생한 후기를 확인해보세요!</p>
              <button onClick={() => navigate(`/markets/${marketId}/shops/${shopId}/reviews`)} className="px-4 py-2 rounded-lg bg-emerald-500 text-white font-semibold">
                리뷰 전체 보기
              </button>
            </div>
          }
        </main>
      </div>

      {activeTab === '메뉴' && (
        <div className="absolute bottom-6 right-6">
          <button onClick={() => navigate(`/add-product?marketId=${marketId}&shopId=${shopId}`)} className="w-14 h-14 rounded-full shadow-xl active:scale-95 transition-transform" style={{ backgroundColor: '#93DA97' }} aria-label="상품 등록" title="상품 등록">
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">+</span>
          </button>
        </div>
      )}
      {cartItemCount > 0 && (
        <div className="absolute bottom-6 right-6">
          <button onClick={() => navigate('/cart')} className="bg-indigo-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center">
            <CartIcon />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cartItemCount}</span>
          </button>
        </div>
      )}
    </div>
  );
}

const InfoSection = ({ icon, text, isCopyable = false }) => (
  <div className="flex items-center text-gray-700">
    <div className="mr-3 flex-shrink-0">{icon}</div>
    <span className="flex-grow">{text}</span>
    {isCopyable && <button className="text-xs text-gray-500 border rounded-full px-2 py-0.5 ml-2">복사</button>}
  </div>
);