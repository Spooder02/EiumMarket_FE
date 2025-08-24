import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SingleImageUploader from "../components/SingleImageUploader.jsx";

// --- 아이콘 SVG 컴포넌트들 ---
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 19l-7-7 7-7"
    />
  </svg>
);

const ALL_PAYMENT_METHODS = [
  "인생회복 소비쿠폰",
  "온누리 상품권",
  "제로페이",
  "카카오페이",
];

export default function AddStore() {
  const navigate = useNavigate();
  
  // API 명세에 맞게 form 상태를 수정/확장합니다.
  const [form, setForm] = useState({
    name: "",
    image: null,
    category: "",
    address: "",
    phone: "",
    hours: "",
    paymentMethods: [],
  });

  const handlePaymentChange = (method) => {
    setForm((prev) => {
      const currentMethods = prev.paymentMethods;
      if (currentMethods.includes(method)) {
        return {
          ...prev,
          paymentMethods: currentMethods.filter((item) => item !== method),
        };
      } else {
        return { ...prev, paymentMethods: [...currentMethods, method] };
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // TODO: 유효성 검사 추가
    console.log("등록할 가게 정보:", form);
    alert("가게 정보가 등록되었습니다! (콘솔 확인)");
    navigate(`/store?marketId=${marketId}&shopId=${newShopId}`); // 등록 후 가게 상세 페이지로 이동
  };

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">
          내 가게 정보 등록
        </h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label
              htmlFor="name"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              가게 이름
            </label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
              placeholder="예: 동산족발"
            />
          </div>

          {/* 가게 대표 이미지 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <SingleImageUploader
              onFileChange={(file) => setForm((p) => ({ ...p, image: file }))}
              label="가게 대표 이미지"
            />
          </div>

          {/* 카테고리 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label
              htmlFor="category"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              카테고리
            </label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
            >
              <option value="" disabled>
                가게 종류 선택
              </option>
              <option value="한식">한식</option>
              <option value="중식">중식</option>
              <option value="일식">일식</option>
              <option value="분식">분식</option>
              <option value="족발/보쌈">족발/보쌈</option>
            </select>
          </div>

          {/* 가게 주소 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label
              htmlFor="address"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              가게 주소
            </label>
            <input
              id="address"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
              placeholder="예: 전남 여수시 시교4길 8-3"
            />
          </div>

          {/* 전화번호 */}
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label
              htmlFor="phone"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              전화번호
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm"
              placeholder="예: 061-642-7089"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label
              htmlFor="hours"
              className="block text-sm font-bold text-gray-800 mb-2"
            >
              영업시간
            </label>
            <textarea
              id="hours"
              name="hours"
              value={form.hours}
              onChange={handleChange}
              className="w-full rounded-md border-gray-300 px-3 py-2 text-sm h-20 resize-none"
              placeholder="예: 매일 10:00 - 22:00&#10;매주 월요일 휴무"
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label className="block text-sm font-bold text-gray-800 mb-2">
              결제수단 (중복 선택 가능)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_PAYMENT_METHODS.map((method) => (
                <label
                  key={method}
                  className="flex items-center space-x-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.paymentMethods.includes(method)}
                    onChange={() => handlePaymentChange(method)}
                    className="rounded"
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="p-4 border-t bg-white flex-shrink-0">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-lg bg-indigo-600 text-white py-3 text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          가게 정보 등록하기
        </button>
      </footer>
    </div>
  );
}
