// src/pages/ReviewsPage.jsx
import { useNavigate, useParams } from 'react-router-dom';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const StarIcon = ({ filled }) => <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>;

// TODO: API 연동 후 실제 데이터로 교체
const MOCK_REVIEWS = [
  { id: 1, author: '김이음', rating: 5, text: '족발이 정말 맛있어요! 사장님도 친절하시고 양도 푸짐합니다.', createdAt: '2024-05-20' },
  { id: 2, author: '박마켓', rating: 4, text: '막국수랑 같이 먹으니 최고네요. 다음엔 보쌈 먹어봐야겠어요.', createdAt: '2024-05-18' },
];

export default function ReviewsPage() {
  const navigate = useNavigate();
  const { marketId, shopId } = useParams();

  // TODO: 실제 API 호출 로직으로 교체
  const reviews = MOCK_REVIEWS;

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0">
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
        <ul className="divide-y">
          {reviews.map(review => (
            <li key={review.id} className="bg-white p-4">
              <div className="flex items-center mb-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(star => <StarIcon key={star} filled={star <= review.rating} />)}
                </div>
                <p className="ml-auto text-sm text-gray-500">{review.author}</p>
              </div>
              <p className="text-sm text-gray-800">{review.text}</p>
              <p className="text-xs text-gray-400 mt-2 text-right">{review.createdAt}</p>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}