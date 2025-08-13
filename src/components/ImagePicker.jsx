import { useState } from "react";

export default function ImagePicker({ onFilesChange, label = "대표 이미지" }) {
  const [preview, setPreview] = useState(null);

  function handleChange(e) {
    const files = e.target.files;
    if (!files || files.length === 0) {
      setPreview(null);
      onFilesChange?.([]);
      return;
    }
    const fileList = Array.from(files);
    setPreview(URL.createObjectURL(fileList[0]));
    onFilesChange?.(fileList);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">{label}</label>
      <div className="flex items-center gap-3">
        <div className="w-24 h-16 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="미리보기"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-xs">이미지 없음</span>
          )}
        </div>
        <label className="inline-flex items-center px-3 py-1 rounded bg-indigo-600 text-white text-xs cursor-pointer hover:bg-indigo-700">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
          이미지 선택
        </label>
      </div>
    </div>
  );
}
