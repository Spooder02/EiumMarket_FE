import { useState, useRef, useEffect } from "react";

// Camera Icon SVG Component
function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export default function ImageUploader({ onFilesChange, maxImages = 3, aiPreview }) {
  const [previews, setPreviews] = useState(Array(maxImages).fill(null));
  const fileInputRefs = useRef([]);

  function handleFileChange(event, index) {
    const file = event.target.files[0];
    if (!file) return;

    const newPreviews = [...previews];
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);

    const currentFiles = previews.map((p, i) => {
      const input = fileInputRefs.current[i];
      return input && input.files[0] ? input.files[0] : null;
    });
    currentFiles[index] = file;
    onFilesChange(currentFiles.filter(f => f !== null));
  }

  useEffect(() => {
    if (!aiPreview) return;

    if (aiPreview instanceof File) {
      const objectUrl = URL.createObjectURL(aiPreview);
      
      console.log("생성된 Blob URL:", objectUrl);

      setPreviews(currentPreviews => {
        const newPreviews = [...currentPreviews];
        newPreviews[0] = objectUrl;
        return newPreviews;
      });

      return () => {
        console.log("Blob URL 메모리 해제:", objectUrl);
        URL.revokeObjectURL(objectUrl);
      };
    } else {

      console.log("문자열 URL 사용:", aiPreview);
      setPreviews(currentPreviews => {
        const newPreviews = [...currentPreviews];
        newPreviews[0] = aiPreview;
        return newPreviews;
      });
    }
  }, [aiPreview]);

  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">대표 이미지</label>
      <div className="flex items-center gap-3">
        {Array.from({ length: maxImages }).map((_, index) => (
          <div key={index} className="flex-1">
            <label className="flex justify-center items-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {previews[index] ? (
                  <img src={previews[index]} alt={`미리보기 ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    {index === 0 ? <CameraIcon /> : <span className="text-4xl text-gray-400 font-thin">+</span>}
                  </div>
                )}
              </div>
              <input
                ref={el => fileInputRefs.current[index] = el}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, index)}
              />
            </label>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-500">* 첫번째 사진이 대표 사진으로 설정됩니다.</p>
    </div>
  );
}
