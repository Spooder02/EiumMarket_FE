// src/pages/SearchResultsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

export default function SearchResultsPage() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  
  // URL에서 검색어를 가져옵니다.
  const query = new URLSearchParams(location.search).get('keyword');
  // 입력창의 상태를 관리할 state를 추가하고, URL의 검색어로 초기화합니다.
  const [inputValue, setInputValue] = useState(query || '');

  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  // 검색 로직
  useEffect(() => {
    if (!query) return;

    // URL의 검색어가 바뀔 때마다 입력창의 값도 업데이트합니다.
    setInputValue(query);

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await apiFetch(`/search?keyword=${encodeURIComponent(query)}`);
        if (!response.ok) {
          throw new Error('검색 결과를 불러오는 데 실패했습니다.');
        }
        const data = await response.json();
        setResults(data.content || []);
      } catch (error) {
        console.error(error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // useEffect의 의존성 배열에 query를 넣어 URL 변경 시 재검색하도록 합니다.

  // 새로운 검색을 위한 핸들러 함수
  const handleSearch = (e) => {
    if (e.key === 'Enter' && inputValue.trim() !== '') {
      navigate(`/search-results?keyword=${inputValue.trim()}`);
    }
  };


  return (
    <div className="flex flex-col h-full">
      <header className="flex items-center p-4 border-b flex-shrink-0 gap-2">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        {/* 기존 h1 제목을 검색창으로 변경 */}
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            🔎
          </span>
          <input
            className="w-full h-10 rounded-lg border border-gray-300 pl-9 pr-3 text-sm"
            placeholder="다시 검색해보세요"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">검색 중...</p>
        ) : results.length === 0 ? (
          <p className="text-center text-gray-500">검색 결과가 없습니다.</p>
        ) : (
          results.map(shop => (
            <div key={shop.shopId} className="bg-white p-4 rounded-lg shadow-sm">
              <h2 className="font-bold text-lg">{shop.name}</h2>
              <p className="text-sm text-gray-600">{shop.address}</p>
              <div className="mt-2 pt-2 border-t">
                {shop.items && shop.items.map(item => (
                  <div key={item.itemId} className="flex items-center gap-4 mt-2">
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <img src={BACKEND_ENDPOINT + item.imageUrls[0]} alt={item.name} className="w-12 h-12 rounded-md object-cover" />
                    )}
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-800">{item.price.toLocaleString()}원</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}