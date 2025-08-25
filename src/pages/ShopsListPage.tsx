// src/pages/ShopsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import useAdminMode from '../hooks/useAdminMode'; // useAdminMode 훅은 더 이상 사용되지 않지만, 다른 기능과 얽혀있을 수 있으므로 남겨둡니다.

// 아이콘 SVG 컴포넌트들 (재사용)
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
const StarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ModeToggle = ({ mode, onToggle }) => (
  <button onClick={onToggle} className="text-white text-sm font-bold px-3 py-1.5 rounded-full bg-white/20">
    {mode === 'user' ? '사용자 모드' : '관리자 모드'}
  </button>
);


export default function ShopsPage() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { marketId } = useParams();
  
  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  const currentMarketName = localStorage.getItem("currentMarketName") || "시장";
  const { mode, toggle } = useAdminMode(); // isAdmin 변수 제거

  useEffect(() => {
    const fetchShops = async () => {
      if (!marketId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`/api/markets/${marketId}/shops`);
        
        if (!response.ok) {
          throw new Error(`서버 에러: ${response.status}`);
        }
        
        const data = await response.json();
        setShops(data.content || []); 
        console.log("상점 목록 로딩 성공:", data.content);

      } catch (error) {
        console.error("상점 목록을 불러오는 데 실패했습니다.", error);
        setShops([]);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [marketId]);

  return (
    <div className="flex flex-col h-full bg-white">
      <header
        className="px-4 pt-12 pb-4 text-black flex-shrink-0 relative"
        style={{ backgroundColor: "#93DA97" }}
      >
        <div className="relative flex items-center justify-center h-10">
          <button 
            onClick={() => navigate(-1)} 
            className="absolute left-0 p-2 text-white"
            aria-label="뒤로 가기"
          >
            <BackIcon />
          </button>
          <h1 className="text-xl font-bold text-center text-white">
            {currentMarketName} 상점
          </h1>
          <div className="absolute right-0 p-2">
            <ModeToggle mode={mode} onToggle={toggle} />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full text-gray-500">
            상점 목록을 불러오는 중...
          </div>
        ) : shops.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <p className="text-xl font-bold">등록된 상점이 없습니다.</p>
            <p className="mt-2 text-sm">새로운 상점을 등록해 보세요!</p>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
            {shops.map((shop) => (
              <li key={shop.shopId} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <Link to={`/markets/${marketId}/shops/${shop.shopId}`} className="block">
                  <div className="w-full h-40 bg-gray-100 overflow-hidden">
                    <img
                      src={BACKEND_ENDPOINT + shop.imageUrls[0]}
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold truncate">{shop.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <StarIcon />
                      <span className="ml-1 font-bold text-black">{shop.favoriteCount}</span>
                      <span className="ml-2">({shop.description.substring(0, 20)}...)</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{shop.openingHours}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* 우측 하단 + 버튼 (관리자/사용자 모드와 상관없이 항상 표시) */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => navigate('/add-store')}
          className="w-14 h-14 rounded-full shadow-xl active:scale-95 transition-transform"
          style={{ backgroundColor: '#93DA97' }}
          aria-label="가게 등록"
          title="가게 등록"
        >
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-bold">
            +
          </span>
        </button>
      </div>
    </div>
  );
}