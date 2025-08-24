import { XIcon } from "./AiVoiceModal";
import solidImage from '../../assets/gray_solid.png';
import { useEffect, useState } from "react";
import axios from "axios";

export default function AiImageModal({isOpen, setIsOpen, onResult, productInfo}) {
    
    const marketId = 1;

    const [generatedImage, setGeneratedImage] = useState(solidImage);
    const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

    const generateImage = async () => {
        axios.get(`${BACKEND_ENDPOINT}/markets/${marketId}/shops/items/ai/image-generate`, {
                params: {
                    itemName: productInfo.name
                }
            })
            .then(response => {
                setGeneratedImage(BACKEND_ENDPOINT + response.data);
            })
            .catch(error => {
                console.error("이미지 생성 오류:", error);
            });
    }

    const setImage = () => {
        onResult(generatedImage);
    }

    useEffect(() => {
        if (isOpen) generateImage();
    }, [isOpen]);

    return (
        <div className={`absolute z-20 w-full h-full bg-white ${isOpen ? 'block' : 'hidden'}`}>
            <header className="flex justify-between items-center p-4 mt-8">
                <h1 className="font-black text-xl ml-2">AI 이미지 생성</h1>
                <button onClick={() => setIsOpen(false)}><XIcon/></button>
            </header>
            <div className="flex items-center justify-center mt-4">
                <img
                    src={generatedImage}
                    alt="AI 생성 이미지"
                    className="w-[75%] rounded-lg shadow-md p-1 bg-gradient-to-br from-[#0099FF] via-[#FFF53A] to-[#FF00C8]"
                />
            </div>
            <p className="text-red-500 text-sm text-center mt-2">*AI가 생성한 이미지입니다. 실제 상품과 다를 수 있습니다.</p>
            <div className="p-4 mt-8 text-[18pt] font-semibold text-center">
                <p>상품명: {productInfo.name}</p>
                <p>가격: {productInfo.price}</p>
                <p className="mt-12 text-sm text-gray-500">위 정보가 맞는지 확인해주세요!</p>
            </div>
            <div className="absolute flex w-full justify-around bottom-12">
                <button onClick={generateImage} className="px-6 py-2 bg-[#FF6161] text-white rounded-lg shadow-lg">
                    <p className="text-lg font-semibold">아니오</p>
                    <p>다시 시도할래요</p>
                </button>
                <button onClick={setImage} className="px-6 py-2 bg-[#79E37F] text-white rounded-lg shadow-lg">
                    <p className="text-lg font-semibold">네</p>
                    <p>그대로 등록할게요</p>
                </button>
            </div>
        </div>
    );
}
