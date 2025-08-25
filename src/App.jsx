// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import MarketSettingPage from "./pages/MarketSettingPage";
import AddProduct from "./pages/AddProduct";
import AddStore from "./pages/AddStore";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage"; // 새로 추가
import ProductDetailModal from "./components/modals/ProductDetailModal";
import ProductPreview from "./pages/ProductPreview";
import ShopsListPage from "./pages/ShopsListPage";

export default function App() {
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDataForPreview, setProductDataForPreview] = useState(null);

  const handleSelectProduct = (product) => setSelectedProduct(product);
  const handleCloseModal = () => setSelectedProduct(null);

  const handleAddToCart = (cartItem) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) =>
          item.name === cartItem.name && item.optionName === cartItem.optionName
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += cartItem.quantity;
        return newCart;
      } else {
        return [...prevCart, cartItem];
      }
    });
    handleCloseModal();
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }
    setCart(
      cart.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const handlePreview = (productData) => {
    setProductDataForPreview(productData);
    // The actual page navigation is handled by useNavigate in each component.
  };

  return (
    <div className="min-h-screen flex justify-center bg-gray-200">
      <div className="w-full max-w-md h-screen bg-white shadow-lg flex flex-col relative">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/market-setting" element={<MarketSettingPage />} />
            <Route path="/markets/:marketId">
              <Route path="/markets/:marketId/shops" element={<ShopsListPage />} />
              <Route
                path="shops/:shopId"
                element={
                  <StorePage
                    onSelectProduct={handleSelectProduct}
                    cartItemCount={cart.reduce(
                      (total, item) => total + item.quantity,
                      0
                    )}
                  />
                }
              />
            </Route>
            <Route
              path="/add-product"
              element={<AddProduct onPreview={handlePreview} />}
            />
            {productDataForPreview && (
              <Route
                path="/preview"
                element={<ProductPreview productData={productDataForPreview} />}
              />
            )}
            <Route
              path="/add-store"
              element={<AddStore />}
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  cartItems={cart}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemoveItem={handleRemoveItem}
                />
              }
            />
            {/* checkout 라우트를 추가하고 cart 상태를 props로 전달합니다. */}
            <Route 
              path="/checkout" 
              element={<CheckoutPage cartItems={cart} />} 
            />
          </Routes>
        </BrowserRouter>

        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={handleCloseModal}
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}