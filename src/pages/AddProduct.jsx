import { useState } from "react";
import ImageUploader from "../components/ImageUploader.jsx"; 

// 뒤로가기 아이콘
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function AddProduct() {
  // 사용자가 입력하는 폼 데이터들, api로 보낼 데이터
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    images: [], // 이미지 파일들은 여기에 배열로 쌓임
  });
  
  // 유효성 검사 실패했을 때 보여줄 메시지
  const [inlineMsg, setInlineMsg] = useState(null);
  
  // AI 버튼 눌렀을 때 로딩 상태 표시용
  const [loadingAi, setLoadingAi] = useState(false);

  // '상품 등록하기' 누르기 전에 필수 항목 다 채웠는지 검사
  function validateForPreview() {
    if (!form.name.trim()) {
      setInlineMsg("상품명을 입력해주세요.");
      return false;
    }
    if (!form.category) {
      setInlineMsg("카테고리를 선택해주세요.");
      return false;
    }
    setInlineMsg(null); // 문제 없으면 메시지 다시 숨기기
    return true;
  }

  // '상품 등록하기' 버튼 눌렀을 때 동작
  function onPreview() {
    if (!validateForPreview()) return; // 검사 실패하면 여기서 멈춤
    
    // 나중에 API 연결하면 이 부분에서 서버로 데이터 보낼 예정
    console.log("미리보기 데이터:", form);
    alert("미리보기 OK (콘솔 확인)");
  }
   
  // 'AI로 쉽게 작성하기' 기능 (지금은 더미 데이터로 동작)
  function onUseAiFromVoice() {
    setLoadingAi(true); // 로딩 시작
    
    // 1초 뒤에 AI가 작성한 것처럼 폼 채워주기
    setTimeout(() => {
      const example = {
        name: "해남 밤고구마 1.5kg",
        category: "농산물",
        price: "12000",
        description: "포근포근하고 달콤한 해남 밤고구마입니다. 퍽퍽하지 않고 목막힘이 적어 아이들 간식으로도 좋습니다.",
        images: [],
      };
      setForm(example);
      setLoadingAi(false); // 로딩 끝
    }, 1000);
  }
  
  // input, textarea 값이 바뀔 때마다 form 상태 업뎃
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="h-full flex flex-col">
      {/* 상단 헤더 */}
      <header className="flex items-center p-4 border-b">
        <button className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">메뉴 추가</h1>
        <div className="w-6" /> {/* 제목 가운데 정렬용 빈 공간 */}
      </header>

      {/* 메인 콘텐츠 (스크롤 가능 영역) */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          {/* AI로 쉽게 작성하기 버튼 */}
          <button
            type="button"
            onClick={onUseAiFromVoice}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-100 text-purple-800 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
          >
            <span role="img" aria-label="sparkles">✨</span>
            {loadingAi ? "AI가 작성 중..." : "인공지능으로 쉽게 작성하기"}
          </button>
          
          {/* 상품명 입력 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">상품명</label>
            <input
              id="name"
              name="name"
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="예: 해남 밤고구마 1.5kg"
              value={form.name}
              onChange={handleChange}
            />
            <p className="mt-2 text-xs text-gray-500">상품 종류와 특징을 명확히 나타내는 상품명이 좋아요.</p>
          </div>

          {/* 카테고리 선택 (드롭다운) */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="category" className="block text-sm font-bold text-gray-800 mb-2">카테고리</label>
            <select
              id="category"
              name="category"
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={form.category}
              onChange={handleChange}
            >
              <option value="" disabled>카테고리 선택</option>
              <option value="농산물">농산물</option>
              <option value="축산물">축산물</option>
              <option value="수산물">수산물</option>
              <option value="가공식품">가공식품</option>
              <option value="반찬">반찬</option>
            </select>
          </div>
          
          {/* 대표 이미지 업로드 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <ImageUploader
              onFilesChange={(files) =>
                setForm((p) => ({ ...p, images: files }))
              }
            />
             {/* AI 이미지 생성 버튼 (아직 개발 중) AI연결은 어케해야해요*/}
             <button
                type="button"
                className="w-full mt-3 rounded-md bg-violet-200 text-violet-700 py-2 text-sm cursor-not-allowed font-semibold"
                disabled
                title="준비 중 기능"
              >
                AI로 이미지 생성 (준비 중)
              </button>
          </div>
          
          {/* 상세 설명 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">상세 설명</label>
            <textarea
              id="description"
              name="description"
              className="w-full rounded-md border-gray-300 px-3 py-2 h-28 resize-none text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="상품에 대한 설명을 적어주세요."
              value={form.description}
              onChange={handleChange}
            />
          </div>
          
           {/* 가격 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="price" className="block text-sm font-bold text-gray-800 mb-2">가격</label>
            <input
              id="price"
              name="price"
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="가격을 입력해주세요 (원)"
              type="number"
              inputMode="numeric"
              value={form.price}
              onChange={handleChange}
            />
          </div>

        </div>
      </main>

      {/* 하단 버튼 */}
      <footer className="p-4 border-t bg-white">
        {/* 유효성 검사 메시지 보여줄 곳 */}
        {inlineMsg && (
          <p className="text-red-500 text-xs text-center mb-2">{inlineMsg}</p>
        )}
        <button
          type="button"
          onClick={onPreview}
          className="w-full rounded-lg bg-emerald-500 text-white py-3 text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          상품 등록하기
        </button>
      </footer>
    </div>
  );
}