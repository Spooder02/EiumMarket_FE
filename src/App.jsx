import { useState } from "react";
import AddProduct from "./pages/AddProduct.jsx";
import ProductPreview from "./pages/ProductPreview.jsx"; // 새로 만든 확인 페이지 import

export default function App() {
  // 'form' (입력), 'preview' (확인) 두 가지 상태를 가집니다.
  const [view, setView] = useState('form'); 
  // 확인 페이지에 보여줄 상품 데이터를 저장합니다.
  const [productData, setProductData] = useState(null);

  // '상품 등록하기' 버튼을 눌렀을 때 실행될 함수
  const handlePreview = (data) => {
    setProductData(data); // AddProduct 페이지에서 받은 데이터를 저장
    setView('preview');   // 확인 페이지로 전환
  };

  // 확인 페이지에서 '수정하기' 버튼을 눌렀을 때 실행될 함수
  const handleGoBackToForm = () => {
    setView('form'); // 다시 입력 페이지로 전환
  };

  // 확인 페이지에서 '최종 등록하기' 버튼을 눌렀을 때 실행될 함수
  const handleConfirm = () => {
    // 실제로는 여기서 서버로 데이터를 전송(API 호출)합니다.
    console.log("최종 등록 데이터:", productData);
    alert("상품이 최종 등록되었습니다! (콘솔 확인)");
    // 등록 후에는 다시 초기 입력 페이지로 돌아가게 할 수 있습니다.
    setView('form');
    setProductData(null);
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-200">
      <div className="w-full max-w-md h-screen bg-white shadow-lg flex flex-col">
        {/* view 상태에 따라 다른 페이지를 보여줍니다. */}
        {view === 'form' ? (
          <AddProduct onPreview={handlePreview} />
        ) : (
          <ProductPreview 
            productData={productData} 
            onEdit={handleGoBackToForm} 
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}