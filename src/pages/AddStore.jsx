// src/pages/AddStore.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SingleImageUploader from "../components/SingleImageUploader.jsx";
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // 1) 시장 선택 여부
    const marketId = localStorage.getItem("currentMarketId");
    if (!marketId) {
      alert("먼저 시장을 선택/등록해주세요. (상단 '시장 설정')");
      return navigate("/market-setting");
    }

    // 2) 간단 유효성
    if (!form.name || !form.address) {
      alert("가게 이름과 주소는 필수 항목입니다.");
      return;
    }

    // 3) 바디 구성
    // TODO: 이미지 업로드 로직 추가 필요. 현재는 텍스트 데이터만 전송.
    const requestBody = {
      marketId: Number(marketId),
      name: form.name,
      category: form.category,
      phoneNumber: form.phoneNumber,
      openingHours: form.openingHours,
      floor: form.floor,
      latitude: 37.55998, // TODO: 실제 좌표 연결
      longitude: 126.9784,
      description: form.description,
      // form.image가 File 객체이므로, 업로드 후 URL을 받아와야 합니다.
      // 우선 임시 플레이스홀더 URL을 사용합니다.
      shopImageUrl: "https://placehold.co/600x400/DDDDDD/333333?text=Image",
      address: form.address,
    };
    
    // 이미지가 있을 경우 FormData를 사용해야 합니다. 아래는 FormData 예시입니다.
    // 현재는 JSON으로 보내고 있으므로, 이미지 전송을 위해서는 수정이 필요합니다.
    /*
    const formData = new FormData();
    formData.append('imageFile', form.image);
    // DTO를 JSON Blob으로 변환하여 추가
    const dtoBlob = new Blob([JSON.stringify({ ...requestBody, shopImageUrl: null })], { type: 'application/json' });
    formData.append('dto', dtoBlob);
    */

    try {
      const response = await apiFetch(`/markets/${marketId}/shops`, {
        method: "POST",
        // form.image가 있을 경우 headers와 body를 FormData에 맞게 수정해야 합니다.
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`서버 에러: ${response.status} ${text}`);
      }

      const responseData = await response.json();
      alert("가게가 성공적으로 등록되었습니다!");
      navigate(`/store/${responseData.shopId}`);
    } catch (error) {
      console.error("가게 등록 실패:", error);
      alert("가게 등록에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <h1 className="text-lg font-bold text-center flex-grow">내 가게 정보 등록</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">가게 이름</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="예: 동산족발" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <SingleImageUploader onFileChange={(file) => setForm((p) => ({ ...p, image: file }))} label="가게 대표 이미지" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="category" className="block text-sm font-bold text-gray-800 mb-2">카테고리</label>
            <select id="category" name="category" value={form.category} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm">
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
            <input id="address" name="address" value={form.address} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="예: 전남 여수시 시교4길 8-3" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="floor" className="block text-sm font-bold text-gray-800 mb-2">층 / 호수</label>
            <input id="floor" name="floor" value={form.floor} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="예: 1층 A-02호" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-800 mb-2">전화번호</label>
            <input id="phoneNumber" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="예: 061-642-7089" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="openingHours" className="block text-sm font-bold text-gray-800 mb-2">영업시간</label>
            <input id="openingHours" name="openingHours" value={form.openingHours} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="예: 09:00 ~ 21:00" />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">가게 설명</label>
            <textarea id="description" name="description" value={form.description} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm h-24 resize-none" placeholder="손님들에게 보여질 가게 설명을 적어주세요." />
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white flex-shrink-0">
        <button type="button" onClick={handleSubmit} className="w-full rounded-lg bg-indigo-600 text-white py-3 text-sm font-bold hover:bg-indigo-700 transition-colors">
          가게 정보 등록하기
        </button>
      </footer>
    </div>
  );
}