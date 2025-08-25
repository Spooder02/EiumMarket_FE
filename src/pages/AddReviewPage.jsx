// src/pages/AddReviewPage.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SingleImageUploader from '../components/SingleImageUploader';
import { apiFetch } from '../lib/api'; // apiFetch import

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const StarIcon = ({ filled, onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 cursor-pointer ${filled ? 'text-yellow-400' : 'text-gray-300'}`} viewBox="0 0 20 20" fill="currentColor">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function AddReviewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const shopId = searchParams.get('shopId');

  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async () => {
    if (isSubmitting || rating === 0) return;

    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    
    // API 명세에 따라 각 필드를 개별적으로 FormData에 추가합니다.
    formData.append('userId', '1234'); // TODO: 로그인 기능 구현 후 실제 사용자 ID로 교체
    formData.append('shopId', shopId);
    formData.append('rating', rating);
    formData.append('content', reviewText);
    
    // 이미지 파일이 있을 경우 'imageFiles' 키로 추가
    if (reviewImage) {
      formData.append('imageFiles', reviewImage);
    }
    
    // imageUrls는 파일과 함께 보낼 때 서버에서 처리하므로 빈 배열 문자열을 보냅니다.
    formData.append('imageUrls', '[]');

    try {
      // apiFetch 헬퍼를 사용하여 API 호출
      const response = await apiFetch('/reviews', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: '리뷰 등록에 실패했습니다.' }));
        throw new Error(errorData.message || `서버 에러: ${response.status}`);
      }

      alert('리뷰가 성공적으로 등록되었습니다!');
      navigate(-1); // 이전 페이지(리뷰 목록)로 돌아가기

    } catch (error) {
      console.error('리뷰 등록 오류:', error);
      setErrorMessage(error.message || '오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <h1 className="text-lg font-bold text-center flex-grow">리뷰 작성하기</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <p className="font-bold mb-2">가게는 어떠셨나요?</p>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map(star => (
                <StarIcon 
                  key={star} 
                  filled={star <= rating} 
                  onClick={() => setRating(star)} 
                />
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <textarea
              className="w-full rounded-md border-gray-300 px-3 py-2 h-36 resize-none text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="솔직한 리뷰를 남겨주세요."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <SingleImageUploader
              onFileChange={(file) => setReviewImage(file)}
              label="사진 첨부 (선택)"
            />
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white flex-shrink-0">
        {errorMessage && <p className="text-red-500 text-xs text-center mb-2">{errorMessage}</p>}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full rounded-lg bg-emerald-500 text-white py-3 text-sm font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? '등록 중...' : '리뷰 등록하기'}
        </button>
      </footer>
    </div>
  );
}