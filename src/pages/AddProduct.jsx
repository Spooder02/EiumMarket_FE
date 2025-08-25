import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageUploader from "../components/ImageUploader.jsx";
import AiVoiceModal from "../components/modals/AiVoiceModal.js";
import AiImageModal from "../components/modals/AiImageModal.js";

// --- 아이콘 SVG 컴포넌트들 ---
function BackIcon() { 
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ); 
}

const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


export default function AddProduct({ onPreview }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const marketId = searchParams.get('marketId');
  const shopId = searchParams.get('shopId');

  useEffect(() => {
    console.log("marketId:", marketId, "shopId:", shopId);
  }, [])

  const [form, setForm] = useState({
    name: "",
    category: "",
    price: '',
    options: [{ name: '', price: '' }],
    description: "",
    images: [],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOptions, setHasOptions] = useState(false);
  const [inlineMsg, setInlineMsg] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiImageModalOpen, setIsAiImageModalOpen] = useState(false);
  const [productInfo, setProductInfo] = useState({ name: '', price: '' });

  function handleNextStep() {
    handleSubmit();
  }

  async function handleSubmit() {
    if (!validateForPreview()) return;

    setIsSubmitting(true);
    setInlineMsg(null);

    const formData = new FormData();

    formData.append('shopId', shopId);
    formData.append('name', form.name);
    formData.append('price', form.price || 0);
    formData.append('category', form.category);
    formData.append('description', form.description);

    // AI 생성 혹은 업로드 구분
    const imageUrls = form.images.filter(img => typeof img === 'string');
    const imageFiles = form.images.filter(img => img instanceof File);

    imageUrls.forEach(url => {
        formData.append('imageUrls', url);
    });

    imageFiles.forEach(file => {
        formData.append('imageFiles', file);
    });

    try {
      const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;
      const response = await fetch(`${BACKEND_ENDPOINT}/markets/${marketId}/shops/${shopId}/items`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "상품 등록에 실패했습니다.");
      }

      const result = await response.json();
      console.log("등록 성공:", result);
      alert("상품이 성공적으로 등록되었습니다!");
      navigate(-1);
    } catch (error) {
      console.error("상품 등록 오류:", error);
      setInlineMsg(error.message || "오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleOptionChange = (index, field, value) => { 
    const newOptions = [...form.options]; 
    newOptions[index][field] = value; 
    setForm(prev => ({ ...prev, options: newOptions })); 
  };

  const addOption = () => { 
    setForm(prev => ({ 
      ...prev, 
      options: [...prev.options, { name: '', price: '' }] 
    })); 
  };
  
  const removeOption = (index) => { 
    if (form.options.length <= 1) return; 
    const newOptions = form.options.filter((_, i) => i !== index); 
    setForm(prev => ({ ...prev, options: newOptions })); 
  };
  
  useEffect(() => {
    if (form.name && form.price) {
      setProductInfo({ name: form.name, price: form.price });
    }
  }, [form]);

  function validateForPreview() {
    if (!form.name.trim()) {
      setInlineMsg("상품명을 입력해주세요.");
      return false;
    }
    if (hasOptions) {
      for (const option of form.options) {
        if (!option.name.trim() || !option.price.trim()) {
          setInlineMsg("모든 옵션의 이름과 가격을 입력해주세요.");
          return false;
        }
      }
    } else {
      if (form.price == '') {
        setInlineMsg("가격을 입력해주세요.");
        return false;
      }
    }
    setInlineMsg(null);
    return true;
  }

  function openAiVoiceModal() {
    setLoadingAi(true); 
    setIsAiModalOpen(true);
  }

  function openAiImageModal() {
    if (productInfo.name !== '' && productInfo.price !== '') {
      setIsAiImageModalOpen(true);
    } else {
      setInlineMsg("이미지 생성을 위해 상품 정보를 확인해주세요. (*상품명과 가격)");
    }
  }

  function onUseAiFromVoice(data) { 
    setTimeout(() => { 
      const example = {
        ...data,
        options: [],
        images: [], 
      }; 
      setForm(example); 
      setHasOptions(false); 
      setLoadingAi(false); 
    }, 500); 
    setIsAiModalOpen(false);
  }

  function onUseAiFromImage(data) {
    console.log("AI가 생성한 이미지들:", data);
    setForm((p) => ({ ...p, images: [...p.images, data] }))
    console.log("images: ", form.images);
    setIsAiImageModalOpen(false);
  }

  function handleChange(e) { 
    const { name, value } = e.target; 
    setForm(prev => ({ ...prev, [name]: value })); 
  }

  return (
    <div className="h-full flex flex-col">
      <AiVoiceModal
        target="상품의 이름과 설명"
        exampleText="샤인머스캣 1kg를 만원에 팔 거야"
        isOpen={isAiModalOpen}
        setIsOpen={setIsAiModalOpen}
        onResult={onUseAiFromVoice}
      />
      <AiImageModal
        isOpen={isAiImageModalOpen}
        setIsOpen={setIsAiImageModalOpen}
        onResult={onUseAiFromImage}
        productInfo={productInfo}
      />
      <header className="flex items-center p-4 border-b flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1"><BackIcon /></button>
        <h1 className="text-lg font-bold text-center flex-grow">메뉴 추가</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="space-y-6">
          <button type="button" onClick={openAiVoiceModal} className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-100 text-purple-800 py-3 text-sm font-bold transition-transform hover:scale-[1.02]">
            <span role="img" aria-label="sparkles">✨</span>
            {loadingAi ? "AI가 작성 중..." : "인공지능으로 쉽게 작성하기"}
          </button>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="name" className="block text-sm font-bold text-gray-800 mb-2">상품명</label>
            <input id="name" name="name" className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="예: 해남 밤고구마 1.5kg" value={form.name} onChange={handleChange} />
            <p className="mt-2 text-xs text-gray-500">상품 종류와 특징을 명확히 나타내는 상품명이 좋아요.</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="category" className="block text-sm font-bold text-gray-800 mb-2">카테고리</label>
            <select id="category" name="category" className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={form.category} onChange={handleChange}>
              <option value="" disabled>카테고리 선택</option>
              <option value="농산물">농산물</option>
              <option value="축산물">축산물</option>
              <option value="수산물">수산물</option>
              <option value="가공식품">가공식품</option>
              <option value="반찬">반찬</option>
            </select>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <ImageUploader onFilesChange={(files) => setForm((p) => ({ ...p, images: files }))} aiPreview={form.images[0]} />
            <button type="button" className="w-full mt-3 rounded-md bg-violet-200 text-violet-700 py-2 text-sm cursor-not-allowed font-semibold" onClick={openAiImageModal}>AI로 이미지 생성</button>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-bold text-gray-800">가격</label>
              <div className="flex items-center">
                <span className="text-sm mr-2">옵션 사용</span>
                <button onClick={() => setHasOptions(!hasOptions)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hasOptions ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${hasOptions ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            {hasOptions ? (
              <div className="space-y-3">
                {form.options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input type="text" placeholder="옵션명 (예: 소)" value={option.name} onChange={(e) => handleOptionChange(index, 'name', e.target.value)} className="w-1/2 rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <input type="number" placeholder="가격 (원)" value={option.price} onChange={(e) => handleOptionChange(index, 'price', e.target.value)} className="flex-grow rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                    <button onClick={() => removeOption(index)} className="p-2 text-gray-400 hover:text-red-500 disabled:opacity-50" disabled={form.options.length <= 1}><XIcon /></button>
                  </div>
                ))}
                <button type="button" onClick={addOption} className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800">+ 옵션 추가</button>
              </div>
            ) : (
              <input type="number" placeholder="가격 (원)" name="price" value={form.price} onChange={handleChange} className="w-full rounded-md border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm">
            <label htmlFor="description" className="block text-sm font-bold text-gray-800 mb-2">상세 설명</label>
            <textarea id="description" name="description" className="w-full rounded-md border-gray-300 px-3 py-2 h-28 resize-none text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="상품에 대한 설명을 적어주세요." value={form.description} onChange={handleChange} />
          </div>
        </div>
      </main>
      
      <footer className="p-4 border-t bg-white flex-shrink-0">
        {inlineMsg && <p className="text-red-500 text-xs text-center mb-2">{inlineMsg}</p>}
        <button 
          type="button" 
          onClick={handleNextStep} 
          disabled={isSubmitting}
          className="w-full rounded-lg bg-emerald-500 text-white py-3 text-sm font-bold hover:bg-emerald-600 transition-colors disabled:bg-gray-400"
        >
          {isSubmitting ? "등록 중..." : "상품 등록하기"}
        </button>
      </footer>
    </div>
  );
}