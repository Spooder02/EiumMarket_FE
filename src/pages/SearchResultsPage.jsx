// src/pages/SearchResultsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom'; // useParams 추가
import { apiFetch } from '../lib/api';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

export default function SearchResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { marketId } = useParams(); // URL에서 marketId 가져오기
  
  const query = new URLSearchParams(location.search).get('keyword');
  const [inputValue, setInputValue] = useState(query || '');

  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT || '';

  useEffect(() => {
    // marketId나 query가 없으면 검색하지 않음
    if (!query || !marketId) {
      setLoading(false);
      return;
    }
    
    setInputValue(query);

    const fetchResults = async () => {
      setLoading(true);
      try {
        // 수정된 API 엔드포인트로 요청
        const response = await apiFetch(`/markets/${marketId}/shops/search?keyword=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('검색 API 호출에 실패했습니다.');
        }
        const data = await response.json();
        setResults(Array.isArray(data.content) ? data.content : []);
      } catch (error) {
        console.error("검색 결과를 가져오는 중 오류 발생:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, marketId]); // marketId도 의존성 배열에 추가

  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      navigate(`/markets/${marketId}/search-results?keyword=${inputValue.trim()}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 border-b flex-shrink-0 gap-2 bg-white">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
          <input
            className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="다시 검색해보세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 pt-10">검색 중...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-500 pt-10">'{query}'에 대한 검색 결과가 없습니다.</p>
        ) : (
          results.map(shop => (
            <Link 
              key={shop.shopId} 
              to={`/markets/${shop.marketId}/shops/${shop.shopId}`} 
              className="block bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4 items-start">
                {shop.imageUrls && shop.imageUrls[0] && (
                  <img src={`${BACKEND_ENDPOINT}${shop.imageUrls[0].replace(/[\[\]"]/g, '')}`} alt={shop.name} className="w-20 h-20 rounded-md object-cover flex-shrink-0" />
                )}
                <div className="flex-grow">
                  <h2 className="font-bold text-lg">{shop.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{shop.address}</p>
                </div>
              </div>
              {shop.items && shop.items.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-semibold text-gray-500 mb-2">'{query}' 관련 상품</p>
                  <div className="space-y-2">
                    {shop.items.map(item => (
                      <div key={item.itemId} className="flex items-center gap-3">
                        {item.imageUrls && item.imageUrls[0] && (
                          <img src={`${BACKEND_ENDPOINT}${item.imageUrls[0]}`} alt={item.name} className="w-10 h-10 rounded-md object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-sm text-gray-800">{item.price.toLocaleString()}원</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Link>
          ))
        )}
      </main>
    </div>
  );
}