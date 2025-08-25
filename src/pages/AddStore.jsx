// src/pages/AddStore.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SingleImageUploader from "../components/SingleImageUploader.jsx";
import AiImageModal from "../components/modals/AiImageModal.js";
import { apiFetch } from "../lib/api";

// --- 아이콘 SVG ---
const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

export default function AddStore() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    category: "",
    phoneNumber: "",
    openingHours: "",
    floor: "",
    description: "",
    address: "",
    image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);

  const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

  const shopInfo = {
    name: form.name,
    description: form.description,
  };

  useEffect(() => {
    if (form.name) {
      setInlineMsg(null);
    }
  }, [form.name]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openAiImageModal = () => {
    if (!form.name.trim()) {
      setInlineMsg("AI 이미지 생성을 위해 가게 이름을 먼저 입력해주세요.");
      return;
    }
    setInlineMsg(null);
    setIsAiImageModalOpen(true);
  };

  const onUseAiFromImage = (data) => {
    setForm((p) => ({ ...p, image: data }));
    setIsAiImageModalOpen(false);
  };

  const handleSubmit = async () => {
    const marketId = localStorage.getItem("currentMarketId");
    if (!marketId) {
      alert("먼저 시장을 선택/등록해주세요.");
      return navigate("/market-setting");
    }

    if (!form.name || !form.address) {
      setInlineMsg("가게 이름과 주소는 필수 항목입니다.");
      return;
    }

    setIsSubmitting(true);
    setInlineMsg(null);

    const formData = new FormData();
    formData.append('marketId', Number(marketId));
    formData.append('name', form.name);
    formData.append('category', form.category);
    formData.append('phoneNumber', form.phoneNumber);
    formData.append('openingHours', form.openingHours);
    formData.append('floor', form.floor);
    formData.append('latitude', 37.55998);
    formData.append('longitude', 126.9784);
    formData.append('description', form.description);
    formData.append('address', form.address);

    const imageUrls = [];
    const imageFiles = [];

    if (form.image) {
      if (typeof form.image === 'string') {
        imageUrls.push(form.image);
      } else if (form.image instanceof File) {
        imageFiles.push(form.image);
      }
    }

    formData.append('imageUrls', JSON.stringify(imageUrls));

    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('imageFiles', file);
      });
    } else {
      const emptyFile = new Blob([], { type: 'application/octet-stream' });
      formData.append('imageFiles', emptyFile, '');
    }

    try {
      const response = await apiFetch(`/markets/${marketId}/shops`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`서버 에러: ${response.status} ${text}`);
      }

      const responseData = await response.json();
      alert("가게가 성공적으로 등록되었습니다!");
      navigate(`/markets/${marketId}/shops/${responseData.shopId}`);
    } catch (error) {
      console.error("가게 등록 실패:", error);
      setInlineMsg("가게 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <AiImageModal
        isOpen={isAiImageModalOpen}
        setIsOpen={setIsAiImageModalOpen}
        onResult={onUseAiFromImage}
        shopInfo={shopInfo}
      />
      
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <h1 className="text-lg font-bold text-center flex-grow">내 가게 정보 등록</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">가게 이름</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 동산족발" />
            <p className="mt-2 text-xs text-gray-500">가게의 정식 명칭을 입력해주세요.</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <SingleImageUploader 
              onFileChange={(file) => setForm((p) => ({ ...p, image: file }))} 
              label="가게 대표 이미지"
              aiPreview={typeof form.image === 'string' ? BACKEND_ENDPOINT + form.image : null}
            />
            <p className="mt-2 text-xs text-gray-500">손님에게 가게를 가장 잘 보여줄 수 있는 이미지를 등록해주세요.</p>
            <button 
              type="button" 
              onClick={openAiImageModal}
              className="w-full mt-3 flex items-center justify-center gap-2 rounded-lg bg-purple-100 text-purple-800 py-3 text-sm font-bold transition-transform hover:scale-[1.02]"
            >
              <span role="img" aria-label="sparkles">✨</span>
              AI로 상점 이미지 생성하기
            </button>
            {inlineMsg && <p className="text-red-500 text-xs text-center mt-3">{inlineMsg}</p>}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="category" className="block text-sm font-bold text-gray-800 mb-2">카테고리</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
              <option value="">가게 종류 선택</option>
              <option value="한식">한식</option>
              <option value="중식">중식</option>
              <option value="일식">일식</option>
              <option value="분식">분식</option>
              <option value="족발/보쌈">족발/보쌈</option>
            </select>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="address" className="block text-sm font-bold text-gray-800 mb-2">가게 주소</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 전남 여수시 시교4길 8-3" />
            <p className="mt-2 text-xs text-gray-500">정확한 주소는 손님이 찾아오는데 큰 도움이 됩니다.</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="floor" className="block text-sm font-bold text-gray-800 mb-2">층 / 호수</label>
            <input id="floor" name="floor" value={form.floor} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 1층 A-02호" />
            <p className="mt-2 text-xs text-gray-500">시장 내 정확한 위치를 입력해주세요.</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-800 mb-2">전화번호</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 061-642-7089" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="openingHours" className="block text-sm font-bold text-gray-800 mb-2">영업시간</label>
            <input id="openingHours" name="openingHours" value={form.openingHours} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 09:00 ~ 21:00" />
            <p className="mt-2 text-xs text-gray-500">손님이 방문할 수 있는 시간을 알려주세요.</p>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">가게 설명</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm h-28 resize-none focus:border-indigo-500 focus:ring-indigo-500" placeholder="손님들에게 보여질 가게 설명을 적어주세요." />
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white flex-shrink-0">
        <button 
          type="button" 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-500 text-white py-3 text-sm font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? "등록 중..." : "가게 정보 등록하기"}
        </button>
      </footer>
    </div>
  );
}