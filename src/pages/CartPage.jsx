// src/pages/CartPage.jsx
import { useNavigate } from 'react-router-dom';

// --- 아이콘 SVG 컴포넌트들 ---
const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const XIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;


export default function CartPage({ cartItems, onUpdateQuantity, onRemoveItem }) {
  const navigate = useNavigate();
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="h-full flex flex-col">
      <header className="flex items-center p-4 border-b flex-shrink-0">
        {/* 이전 페이지로 돌아가는 버튼 */}
        <button onClick={() => navigate(-1)} className="p-1">
          <BackIcon />
        </button>
        <h1 className="text-lg font-bold text-center flex-grow">장바구니</h1>
        <div className="w-6" />
      </header>

      {cartItems.length === 0 ? (
        <main className="flex-1 flex flex-col justify-center items-center text-gray-500">
          <p>텅...</p>
          <p className="mt-2">장바구니가 비어있어요.</p>
        </main>
      ) : (
        <>
          <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
            <ul className="space-y-3">
              {cartItems.map(item => (
                <li key={item.id} className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <p className="font-bold">{item.name}</p>
                      {item.optionName !== '기본' && <p className="text-sm text-gray-500">{item.optionName}</p>}
                      <p className="font-semibold mt-1">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-200 ml-4 flex-shrink-0">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center gap-2 border rounded-md">
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="px-2 py-1">-</button>
                      <span className="px-2">{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="px-2 py-1">+</button>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="p-1 text-gray-400 hover:text-gray-600"><XIcon /></button>
                  </div>
                </li>
              ))}
            </ul>
          </main>

          <footer className="p-4 border-t bg-white flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">총 주문금액</span>
              <span className="text-2xl font-bold">{totalPrice.toLocaleString()}원</span>
            </div>
            {/* '주문하기' 버튼 클릭 시 /checkout 페이지로 이동하도록 수정 */}
            <button 
              onClick={() => navigate('/checkout')} 
              className="w-full bg-emerald-500 text-white font-bold py-3 rounded-lg hover:bg-emerald-600"
            >
              주문하기
            </button>
          </footer>
        </>
      )}
    </div>
  );
}