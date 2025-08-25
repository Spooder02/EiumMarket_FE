import { useState, useEffect } from "react";

// Camera Icon SVG Component
function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6-0 3 3 0 016 0z" />
    </svg>
  );
}

export default function SingleImageUploader({ onFileChange, label = "대표 이미지", aiPreview = null }) {
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (aiPreview) {
      setPreview(aiPreview);
    }
  }, [aiPreview]);

  function handleChange(e) {
    const file = e.target.files[0];
    if (!file) {
      setPreview(null);
      onFileChange?.(null);
      return;
    }
    setPreview(URL.createObjectURL(file));
    onFileChange?.(file);
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">{label}</label>
      <label className="flex justify-center items-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center justify-center text-center">
          {preview ? (
            <img src={preview} alt="미리보기" className="w-full h-48 object-cover rounded-lg" />
          ) : (
            <>
              <CameraIcon />
              <p className="mt-2 text-sm text-gray-500">클릭하여 이미지 선택</p>
            </>
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleChange}
        />
      </label>
    </div>
  );
}