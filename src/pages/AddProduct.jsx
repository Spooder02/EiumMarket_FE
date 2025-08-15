import { useState } from "react";
import ImageUploader from "../components/ImageUploader.jsx"; // 새로 만든 컴포넌트 import

// Back Arrow Icon SVG Component
function BackIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

export default function AddProduct() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    price: "",
    description: "",
    images: [],
  });
  const [inlineMsg, setInlineMsg] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  function validateForPreview() {
    if (!form.name.trim()) {
      setInlineMsg("상품명을 입력해주세요.");
      return false;
    }
    if (!form.category) {
      setInlineMsg("카테고리를 선택해주세요.");
      return false;
    }
    setInlineMsg(null);
    return true;
  }

  function onPreview() {
    if (!validateForPreview()) return;
    console.log("미리보기 데이터:", form);
    alert("미리보기 OK (콘솔 확인)");
  }
   
  function onUseAiFromVoice() {
    setLoadingAi(true);
    setTimeout(() => {
      const example = {
        name: "해남 밤고구마 1.5kg",
        category: "농산물",
        price: "12000",
        description: "포근포근하고 달콤한 해남 밤고구마입니다. 퍽퍽하지 않고 목막힘이 적어 아이들 간식으로도 좋습니다.",
        images: [], // AI 기능은 이미지 필드를 채우지 않도록 설정
      };
      setForm(example);
      setLoadingAi(false);
    }, 1000);
  }
  
  // 입력 필드 값 변경을 처리하는 함수
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="flex items-center p-4 border-b">
        <button className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">메뉴 추가</h1>
        <div className="w-6"></div> {/* 오른쪽 공간 확보용 */}
      </header>

      {/* Form Content */}
      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <button
            type="button"
            onClick={onUseAiFromVoice}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-100 text-purple-800 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
          >
            <span role="img" aria-label="sparkles">✨</span>
            {loadingAi ? "AI가 작성 중..." : "인공지능으로 쉽게 작성하기"}
          </button>
          
          {/* 상품명 */}
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

          {/* 카테고리 */}
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
          
          {/* 대표 이미지 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <ImageUploader
              onFilesChange={(files) =>
                setForm((p) => ({ ...p, images: files }))
              }
            />
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

      {/* Footer - Submit Button */}
      <footer className="p-4 border-t bg-white">
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