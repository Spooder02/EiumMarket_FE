import AddProduct from "./pages/AddProduct.jsx";

export default function App() {
  return (
    // 앱 전체 배경색은 회색으로
    <div className="min-h-screen flex justify-center bg-gray-200">
      
      {/* 실제 앱 화면처럼 보일 흰색 컨테이너 */}
      <div className="w-full max-w-md h-screen bg-white shadow-lg flex flex-col">
        {/* 지금은 상품 추가 페이지만 보여주지만, 나중엔 라우터로 여러 페이지 관리할 예정 */}
        <AddProduct />
      </div>

    </div>
  );
}