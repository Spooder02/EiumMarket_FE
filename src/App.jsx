import AddProduct from "./pages/AddProduct.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      {/*모바일 폭 제한*/}
      <div className="w-full max-w-md bg-white shadow">
        <AddProduct />
      </div>
    </div>
  );
}
