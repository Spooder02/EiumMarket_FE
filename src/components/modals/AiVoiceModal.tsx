import { useState, useEffect, useRef } from 'react';
import micIcon from '../../assets/mic.png';

// 닫기 아이콘 컴포넌트 (임시)
export const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export default function AiVoiceModal({ target, isOpen, setIsOpen, onResult, exampleText }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const [advicePrompt, setAdvicePrompt] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (target === "상품의 이름과 설명") {
            setAdvicePrompt("라고 했을 때 상품의 이름과 설명을 name, category, price, description 필드로 JSON 형식으로 반환해줘. price는 숫자만, description은 name의 특징을 30자 이내로, category는 '농산물', '축산물', '수산물', '가공식품', '반찬' 중 하나로 설정");
        } else {
            setAdvicePrompt('');
        }
    }, [target]);

    const sendTextToGemini = async (prompt) => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const fullPrompt = `${prompt} ${advicePrompt}`;
        const payload = {
            contents: [{
                parts: [{
                    text: fullPrompt
                }]
            }]
        };

        try {
            setIsProcessing(true);
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorBody = await response.json();
                throw new Error(`Gemini API 요청 실패: ${response.status} - ${errorBody.error.message}`);
            }

            const result = await response.json();
            
            if (!result.candidates || result.candidates.length === 0) {
                throw new Error("API 응답에서 유효한 후보를 찾을 수 없습니다.");
            }
            const text = result.candidates[0].content.parts[0].text;
            console.log("Gemini 응답:", text);

            const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(jsonString);

            console.log("파싱된 Gemini 응답:", parsedData);
            
            onResult(parsedData);

        } catch (error) {
            console.error("Gemini API 연동 중 오류 발생:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    // 클로바 음성인식 API 호출 함수
    const sendAudioToClova = async (audioBlob) => {
        const clientId = import.meta.env.VITE_NAVER_VOICE_CLIENT_ID; 
        const clientSecret = import.meta.env.VITE_NAVER_VOICE_CLIENT_SECRET;
        
        // ✅ Vite 프록시 설정에 맞게 경로를 수정합니다.
        const apiUrl = '/naver-api/recog/v1/stt?lang=Kor';

        console.log('Naver Clova API로 음성 데이터를 전송합니다...');
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'X-NCP-APIGW-API-KEY-ID': clientId,
                    'X-NCP-APIGW-API-KEY': clientSecret,
                    'Content-Type': 'application/octet-stream'
                },
                body: audioBlob,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API 요청 실패: ${response.status} ${response.statusText} - ${errorText}`);
            }

            const result = await response.json();
            console.log('Clova API 응답 결과:', result);
            
            if (result.text) {
                console.log('인식된 텍스트:', result.text);
                sendTextToGemini(result.text);
            } else {
                console.log('텍스트를 인식하지 못했습니다. 응답:', result);
            }
        } catch (error) {
            console.error('Clova Speech API 연동 중 오류 발생:', error);
        }
    };

    const toggleRecording = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            setIsRecording(false);
            return;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
                sendAudioToClova(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorder.start();
            setIsRecording(true);
            console.log('10초 동안 녹음을 시작합니다...');
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                    console.log('10초가 경과하여 녹음을 중지합니다.');
                }
            }, 10000);
        } catch (error) {
            console.error('마이크 접근 중 오류가 발생했습니다:', error);
            alert('마이크 사용 권한이 필요합니다. 브라우저 설정을 확인해주세요.');
        }
    };

    const closeModal = () => {
        setIsOpen(false);
        setIsRecording(false);
    }

    return (
        <div className={`absolute z-10 w-full h-full bg-gradient-to-b from-[#FFFFFF] via-[#AFDCFF] to-[#FECCFF] ${isOpen ? 'block' : 'hidden'}`}>
            <header className="flex justify-between items-center p-4 mt-8">
                <h1 className="font-black text-xl ml-2">AI 음성인식</h1>
                <button onClick={closeModal}><XIcon/></button>
            </header>
            <h2 className="flex font-semibold text-lg text-center items-center justify-center mt-[40%] ">
                아래 버튼을 클릭하고<br/>{target}을 말해주세요.
            </h2>
            <div className="flex items-center justify-center mt-[10%]">
                <button
                    onClick={toggleRecording}
                    aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
                    className={`flex items-center justify-center bg-white w-32 h-32 p-4 rounded-full cursor-pointer focus:outline-none focus:ring-blue-500 ${isRecording ? 'animate-pulse-custom' : 'shadow-lg'}`}
                >
                    <img src={micIcon} className="w-16 h-20" alt="마이크 아이콘" />
                </button>
            </div>
            <p className="text-lg font-semibold text-center mt-8">
                {isRecording && '녹음 중...'}
                {isProcessing && '🤖 AI가 들은 내용을 처리 중입니다. 잠시만 기다려주세요😚'}
                {!isRecording && !isProcessing && `✅ 예시: "${exampleText}"`}
            </p>
        </div>
    );
}