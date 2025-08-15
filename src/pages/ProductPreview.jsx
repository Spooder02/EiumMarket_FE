import { useMemo } from 'react';

// 뒤로가기 아이콘
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// AddProduct 페이지에서 넘어온 상품 데이터(productData)랑 버튼 누르면 실행될 함수들을 받아옴
export default function ProductPreview({ productData, onEdit, onConfirm }) {
  // 대표 이미지 보여주려면 File 객체를 URL로 바꿔줘야 함
  // useMemo로 productData.images가 바뀔 때만 URL 새로 만들도록 최적화
  const mainImageUrl = useMemo(() => {
    if (productData.images && productData.images.length > 0) {
      return URL.createObjectURL(productData.images[0]);
    }
    return null; // 이미지 없으면 null
  }, [productData.images]);

  // 가격은 보기 좋게 콤마 찍어주기
  const formattedPrice = new Intl.NumberFormat('ko-KR').format(productData.price || 0);

  return (
    <div className="h-full flex flex-col">
      {/* 상단 헤더 */}
      <header className="flex items-center p-4 border-b">
        <button onClick={onEdit} className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">메뉴 추가</h1>
        <div className="w-6"></div> {/* 제목 가운데 정렬용 빈 공간 */}
      </header>
      
      {/* 메인 콘텐츠 (스크롤 가능 영역) */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-4">
          {/* 대표 이미지 크게 보여주기 */}
          {mainImageUrl ? (
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-200">
              <img src={mainImageUrl} alt="상품 대표 이미지" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">이미지 없음</span>
            </div>
          )}

          {/* 상품 정보 요약 (이름, 카테고리, 가격) */}
          <div className="bg-white p-4 rounded-lg shadow-sm divide-y">
            <InfoRow label="상품명" value={productData.name} />
            <InfoRow label="카테고리" value={productData.category} />
            <InfoRow label="가격" value={`${formattedPrice}원`} isPrice={true} />
          </div>

          {/* 상세 설명 보여주는 부분 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-bold text-gray-500 mb-2">상세 설명</h3>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{productData.description}</p>
          </div>
        </div>
      </main>

      {/* 하단 버튼 (수정하기, 최종 등록하기) */}
      <footer className="p-4 border-t bg-white grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onEdit}
          className="w-full rounded-lg bg-gray-200 text-gray-700 py-3 text-sm font-bold hover:bg-gray-300 transition-colors"
        >
          수정하기
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="w-full rounded-lg bg-emerald-500 text-white py-3 text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          상품 등록하기
        </button>
      </footer>
    </div>
  );
}

// 정보 한 줄씩 보여주는 컴포넌트 (재사용하려고 따로 뺌)
function InfoRow({ label, value, isPrice = false }) {
  return (
    <div className="flex justify-between items-center py-3">
      <span className="text-sm font-bold text-gray-500">{label}</span>
      <span className={`text-sm ${isPrice ? 'font-bold text-lg text-gray-900' : 'text-gray-800'}`}>{value}</span>
    </div>
  );
}
