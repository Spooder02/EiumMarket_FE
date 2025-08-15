import { useState, useRef } from "react";

// 아이콘은 그냥 여기서 바로 쓸게요 역시 GPT야!
function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// maxImages는 일단 기본 3개로 설정
export default function ImageUploader({ onFilesChange, maxImages = 3 }) {
  // 이미지 미리보기 URL들을 담아둘 배열
  const [previews, setPreviews] = useState(Array(maxImages).fill(null));
  // 각 파일 input에 접근하기 위한 ref
  const fileInputRefs = useRef([]);

  function handleFileChange(event, index) {
    const file = event.target.files[0];
    if (!file) return; // 파일 선택 안했으면 무시

    // 기존 미리보기 배열 복사해서
    const newPreviews = [...previews];
    // 선택된 파일의 URL을 만들어서 해당 위치에 넣어주기
    newPreviews[index] = URL.createObjectURL(file);
    setPreviews(newPreviews);

    // 실제 파일 객체들을 모아서 부모 컴포넌트로 전달
    const currentFiles = previews.map((p, i) => {
      const input = fileInputRefs.current[i];
      return input && input.files[0] ? input.files[0] : null;
    });
    // 방금 새로 추가된 파일도 반영
    currentFiles[index] = file;
    // null 빼고 실제 파일들만 모아서 전달
    onFilesChange(currentFiles.filter(f => f !== null));
  }

  return (
    <div>
      <label className="block text-sm font-bold text-gray-800 mb-2">대표 이미지</label>
      <div className="flex items-center gap-3">
        {/* maxImages 개수만큼 이미지 업로드 칸 만들기 */}
        {Array.from({ length: maxImages }).map((_, index) => (
          <div key={index} className="flex-1">
            <label className="flex justify-center items-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {/* 미리보기 이미지가 있으면 보여주고, 없으면 아이콘 표시 */}
                {previews[index] ? (
                  <img src={previews[index]} alt={`미리보기 ${index + 1}`} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <div className="text-center">
                    {/* 첫번째 칸은 카메라, 나머지는 + 모양 */}
                    {index === 0 ? <CameraIcon /> : <span className="text-4xl text-gray-400 font-thin">+</span>}
                  </div>
                )}
              </div>
              {/* 실제 파일 선택은 이 input이 담당 (화면엔 안보임) */}
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