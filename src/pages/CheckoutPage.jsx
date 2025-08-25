// src/pages/CheckoutPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// --- 아이콘 SVG 컴포넌트들 ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;

export default function CheckoutPage({ cartItems }) {
  const navigate = useNavigate();
  const [deliveryOption, setDeliveryOption] = useState('pickup'); // 'pickup' 또는 'delivery'
  
  // cartItems가 undefined인 경우를 대비하여 빈 배열로 초기화합니다.
  const safeCartItems = cartItems || [];
  const totalPrice = safeCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePayment = () => {
    // 실제 결제 로직은 여기에 구현합니다. (예: API 호출)
    alert('결제가 완료되었습니다!');
    // 결제 완료 후 장바구니를 비우고 메인 페이지로 이동하는 로직을 추가할 수 있습니다.
    navigate('/'); 
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <header className="flex items-center p-4 border-b bg-white flex-shrink-0">
        <button onClick={() => navigate(-1)} className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">결제하기</h1>
        <div className="w-6" />
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* 주문 상품 */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-md font-bold mb-3">주문 상품</h2>
            <ul className="divide-y">
              {safeCartItems.map(item => (
                <li key={item.id} className="flex justify-between items-center py-2 text-sm">
                  <span>{item.name} {item.optionName !== '기본' ? `(${item.optionName})` : ''} x {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()}원</span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between items-center mt-3 pt-3 border-t font-bold">
              <span>총 금액</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </section>

          {/* 수령 방법 */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-md font-bold mb-3">수령 방법</h2>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeliveryOption('pickup')}
                className={`flex-1 p-3 rounded-md border text-center font-semibold ${deliveryOption === 'pickup' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white'}`}
              >
                직접 수령
              </button>
              <button
                onClick={() => setDeliveryOption('delivery')}
                className={`flex-1 p-3 rounded-md border text-center font-semibold ${deliveryOption === 'delivery' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white'}`}
              >
                배달
              </button>
            </div>
            {deliveryOption === 'delivery' && (
              <div className="mt-4 space-y-2">
                <input className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="상세 주소를 입력해주세요." />
                <input className="w-full rounded-md border-gray-300 px-3 py-2 text-sm" placeholder="요청사항을 입력해주세요." />
              </div>
            )}
          </section>

          {/* 결제 수단 */}
          <section className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-md font-bold mb-3">결제 수단</h2>
            <div className="text-sm text-gray-500">
              결제 기능은 현재 준비 중입니다. 
            </div>
          </section>
        </div>
      </main>

      <footer className="p-4 border-t bg-white flex-shrink-0">
        <button 
          onClick={handlePayment} 
          className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600"
        >
          {totalPrice.toLocaleString()}원 결제하기
        </button>
      </footer>
    </div>
  );
}