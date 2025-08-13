import { useState } from "react";
import ImagePicker from "../components/ImagePicker.jsx";

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
    setInlineMsg(null);
    return true;
  }

  {/*상품등록하기 버튼 클릭시 작동, 아직 api연결은 x*/}
  function onPreview() {
    if (!validateForPreview()) return;
    console.log("미리보기 데이터:", form);
    alert("미리보기 OK (콘솔 확인)");
  }
   
  {/*AI로 쉽게 작성하기 기능 구현, 아직 ai연결이 안되어 더미데이터를 작성하는걸로 만들어둠*/}
  function onUseAiFromVoice() {
    setLoadingAi(true);
    
    // AI 처리 시뮬레이션
    setTimeout(() => {
      const example = {
        name: "차갑게 식은 정채환",
        category: "한식",
        price: "500",
        description: "리액트를 처음 다뤄봐 GPT에 물어보면서 하는데도 이해가 안 되어 머리가 아파오는 정채환입니다.",
      };
      
      setForm(example);
      setLoadingAi(false);
    }, 1000);
  }

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold mb-4">메뉴 추가</h1>

      {/*최상단 AI로 쉽게 작성하기 기능 버튼*/}
      <button
        type="button"
        onClick={onUseAiFromVoice}
        className="w-full mb-4 rounded-lg bg-pink-200 text-purple-800 py-2 text-sm"
      >
        {loadingAi ? "AI 처리 중..." : "인공지능으로 쉽게 작성하기"}
      </button>

      {/*상품명*/}
      <div className="space-y-3">
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="상품명"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />

        {/*상품 카테고리*/}
        {/*작성으로 해야할지, 스크롤 버튼식으로 해야할지 고민*/}
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="카테고리"
          value={form.category}
          onChange={(e) =>
            setForm((p) => ({ ...p, category: e.target.value }))
          }
        />

        {/*대표이미지*/}
        <ImagePicker
          onFilesChange={(files) =>
            setForm((p) => ({ ...p, images: files }))
          }
          label="대표 이미지"
        />

        {/*이미지 생성기능, ai를 이용해 추가해야함*/}
        <button
          type="button"
          className="w-full rounded bg-violet-600/50 text-white py-2 text-sm cursor-not-allowed"
          disabled
          title="준비 중 기능"
        >
          AI로 생성 (준비 중)
        </button>
        
        {/*가격*/}
        <input
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="가격(원)"
          inputMode="numeric"
          value={form.price}
          onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
        />

        {/*상품 설명*/}
        <textarea
          className="w-full rounded border px-3 py-2 h-24 resize-none text-sm"
          placeholder="상품 설명"
          value={form.description}
          onChange={(e) =>
            setForm((p) => ({ ...p, description: e.target.value }))
          }
        />

        {inlineMsg && (
          <p className="text-red-500 text-xs text-center">{inlineMsg}</p>
        )}

        {/*상품 등록 버튼*/}
        <button
          type="button"
          onClick={onPreview}
          className="w-full rounded-lg bg-emerald-500 text-white py-2 text-sm font-bold"
        >
          상품 등록하기
        </button>
      </div>
    </div>
  );
}