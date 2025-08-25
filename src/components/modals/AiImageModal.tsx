// src/components/modals/AiImageModal.jsx
import { XIcon } from "./AiVoiceModal";
import solidImage from '../../assets/gray_solid.png';
import { useEffect, useState } from "react";
import axios from "axios";

export default function AiImageModal({ isOpen, setIsOpen, onResult, productInfo = null, shopInfo = null }) {
    
    const marketId = localStorage.getItem("currentMarketId");
    const [generatedImage, setGeneratedImage] = useState(solidImage);
    const BACKEND_ENDPOINT = import.meta.env.VITE_BACKEND_ENDPOINT;

    const isProductMode = !!productInfo;
    const isShopMode = !!shopInfo;

    const name = isProductMode ? productInfo.name : isShopMode ? shopInfo.name : null;
    const description = isProductMode ? productInfo.price : isShopMode ? shopInfo.description : null;
    const descriptionLabel = isProductMode ? "가격" : "가게 설명";

    const generateImage = async () => {
        let endpoint = '';
        let params = {};

        if (isProductMode) {
            endpoint = `${BACKEND_ENDPOINT}/markets/${marketId}/shops/items/ai/image-generate`;
            params = { itemName: productInfo.name };
        } else if (isShopMode) {
            endpoint = `${BACKEND_ENDPOINT}/markets/${marketId}/shops/ai/image-generate`;
            params = { shopName: shopInfo.name, description: shopInfo.description };
        } else {
            console.error("No valid info provided for AI image generation.");
            return;
        }

        axios.get(endpoint, { params })
            .then(response => {
                setGeneratedImage(BACKEND_ENDPOINT + response.data);
            })
            .catch(error => {
                console.error("이미지 생성 오류:", error);
            });
    };

    const setImage = () => {
        const relativeUrl = generatedImage.replace(BACKEND_ENDPOINT, '');
        onResult(relativeUrl);
        setGeneratedImage(solidImage); // 모달 닫기 후 초기화
    };

    useEffect(() => {
        if (isOpen && (isProductMode || isShopMode)) {
            setGeneratedImage(solidImage); // 모달 열릴 때 초기 이미지로 초기화
            generateImage();
        }
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
            <p className="text-red-500 text-sm text-center mt-2">*AI가 생성한 이미지입니다. 실제와 다를 수 있습니다.</p>
            <div className="p-4 mt-8 text-[18pt] font-semibold text-center">
                <p>
                    {isProductMode && `상품명: ${name}`}
                    {isShopMode && `상점명: ${name}`}
                </p>
                <p>
                    {isProductMode && `가격: ${description}`}
                    {isShopMode && `설명: ${description}`}
                </p>
                <p className="mt-12 text-sm text-gray-500">위 정보가 맞는지 확인해주세요!</p>
            </div>
            <div className="absolute flex w-full justify-around bottom-12">
                <button onClick={generateImage} className="px-6 py-2 bg-[#FF6161] text-white rounded-lg shadow-lg">
                    <p className="text-lg font-semibold">아니오</p>
                    <p>다시 시도할게요</p>
                </button>
                <button onClick={setImage} className="px-6 py-2 bg-[#79E37F] text-white rounded-lg shadow-lg">
                    <p className="text-lg font-semibold">네</p>
                    <p>그대로 등록할게요</p>
                </button>
            </div>
        </div>
    );
}