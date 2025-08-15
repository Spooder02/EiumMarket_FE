import AddProduct from "./pages/AddProduct.jsx";

export default function App() {
  return (
    // 전체 화면을 차지하는 배경
    <div className="min-h-screen flex justify-center bg-gray-200">
      {/* 모바일 화면처럼 보이는 중앙 컨테이너 */}
      <div className="w-full max-w-md h-screen bg-white shadow-lg flex flex-col">
        <AddProduct />
      </div>
    </div>
  );
}