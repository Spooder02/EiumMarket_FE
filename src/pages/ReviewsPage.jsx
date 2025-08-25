// src/pages/ReviewsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../lib/api';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const StarIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { marketId, shopId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT || '';

  useEffect(() => {
    const fetchReviews = async () => {
      if (!shopId) return;
      
      setLoading(true);
      setError(null);
      try {
        const response = await apiFetch(`/shops/${shopId}/reviews`);
        if (!response.ok) {
          throw new Error('리뷰를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setReviews(data.content || []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [shopId]);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0 bg-white">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <h1 className="text-lg font-bold text-center flex-grow">전체 리뷰</h1>
        <div className="w-6" />
      </header>
      
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="p-4 bg-white border-b">
          <button
            onClick={() => navigate(`/add-review?marketId=${marketId}&shopId=${shopId}`)}
            className="w-full rounded-lg border border-gray-300 py-3 text-sm font-bold text-gray-700 hover:bg-gray-100"
          >
            리뷰 작성하기
          </button>
        </div>
        
        {loading && <p className="text-center text-gray-500 p-4">리뷰를 불러오는 중...</p>}
        {error && <p className="text-center text-red-500 p-4">{error}</p>}
        
        {!loading && !error && (
          reviews.length === 0 ? (
            <p className="text-center text-gray-500 p-4">아직 작성된 리뷰가 없습니다.</p>
          ) : (
            <ul className="divide-y">
              {reviews.map(review => {
                // 이미지 URL을 먼저 정리하고, 실제 내용이 있는지 확인합니다.
                const imageUrl = review.imageUrls && review.imageUrls.length > 0
                  ? review.imageUrls[0].replace(/[\[\]"]/g, '')
                  : null;

                return (
                  <li key={review.reviewId} className="bg-white p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} filled={star <= review.rating} />)}
                      </div>
                      <p className="ml-auto text-sm text-gray-500">사용자 ID: {review.userId}</p>
                    </div>
                    
                    {/* 정리된 imageUrl에 실제 값이 있을 경우에만 img 태그를 렌더링합니다. */}
                    {imageUrl && (
                      <img 
                        src={`${BACKEND_ENDPOINT}${imageUrl}`} 
                        alt="리뷰 이미지"
                        className="w-full h-auto max-h-48 object-cover rounded-md my-2"
                      />
                    )}
                    
                    <p className="text-sm text-gray-800 my-2">{review.content}</p>
                    <p className="text-xs text-gray-400 text-right">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </p>
                  </li>
                );
              })}
            </ul>
          )
        )}
      </main>
    </div>
  );
}