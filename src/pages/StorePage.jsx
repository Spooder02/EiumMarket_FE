import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { apiFetch } from "../lib/api";

// --- 아이콘 SVG 컴포넌트들 (수정 없음) ---
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const PhoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>;
const CartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;

export default function StorePage({ onSelectProduct, cartItemCount }) {
  const [activeTab, setActiveTab] = useState('홈');
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { marketId, shopId } = useParams();
  
  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setLoading(true);
        const response = await apiFetch(`/markets/${marketId}/shops/${shopId}`);
        
        const data = await response.json();
        setStoreData(data);
        console.log("가게 정보 로딩 성공:", data);
        console.log("가게 이미지 URL:", BACKEND_ENDPOINT + data.imageUrls[0]);

      } catch (error) {
        console.error("가게 정보를 불러오는 데 실패했습니다.", error.message);
        setStoreData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreData();
  }, [shopId, marketId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full">가게 정보를 불러오는 중...</div>;
  }

  if (!storeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="text-xl">가게 정보를 찾을 수 없습니다.</p>
        <Link to="/" className="mt-4 text-emerald-600 font-bold">홈으로 돌아가기</Link>
      </div>
    );
  }

  const TabButton = ({ name }) => (
    <button onClick={() => setActiveTab(name)} className={`flex-1 pb-2 text-center font-bold ${activeTab === name ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}>
      {name}
    </button>
  );

  return (
    <div className="h-full bg-white flex flex-col relative">
      <button 
        onClick={() => navigate(`/markets/${marketId}/shops`)} 
        className="absolute top-4 left-4 z-50 p-2 bg-white rounded-full shadow-md"
        aria-label="Go back"
      >
        <BackIcon />
      </button>
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-shrink-0">
          <div className="w-full h-48 bg-gray-200">
            <img
            src={BACKEND_ENDPOINT + storeData.imageUrls[0].replace(/[[\]"]/g, '')} 
            alt={storeData.name}
            className="w-full h-full object-cover" />
            </div>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">{storeData.name}</h1>
              <HeartIcon />
            </div>
            <div className="flex items-center mt-1 text-sm">
              <StarIcon />
              <span className="font-bold ml-1">{storeData.favoriteCount}</span>
              <span className="text-gray-500 ml-1">(리뷰 기능 추가 필요)</span>
            </div>
          </div>
          <div className="flex justify-around border-b px-4">
            <TabButton name="홈" />
            <TabButton name="지도" />
            <TabButton name="메뉴" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          {activeTab === '홈' && 
            <div className="p-4 space-y-6">
              <InfoSection icon={<LocationIcon />} text={storeData.address} />
              <InfoSection icon={<ClockIcon />} text={storeData.openingHours} />
              <InfoSection icon={<PhoneIcon />} text={storeData.phoneNumber} isCopyable={true} />
              <div>
                <h3 className="font-bold mb-2">가게 설명</h3>
                <p>{storeData.description}</p>
              </div>
            </div>
          }
          {activeTab === '지도' && 
            <div className="p-4 text-center text-gray-500">
              지도 기능은 준비 중입니다.
            </div>
          }
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
                      <img src={BACKEND_ENDPOINT+item.imageUrls[0]} alt={item.name} className="w-full h-full object-cover" />
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
        </main>
      </div>

      {activeTab === '메뉴' && (
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={() => navigate(`/add-product?marketId=${marketId}&shopId=${shopId}`)}
            className="w-14 h-14 rounded-full shadow-xl active:scale-95 transition-transform"
            style={{ backgroundColor: '#93DA97' }}
            aria-label="상품 등록"
            title="상품 등록"
          >
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">
              +
            </span>
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