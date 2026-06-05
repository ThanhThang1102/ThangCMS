import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BlogPage from './pages/BlogPage';
import PostDetailPage from './pages/PostDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/san-pham" element={<ShopPage />} />
                <Route path="/san-pham/:id" element={<ProductDetailPage />} />
                <Route path="/tin-tuc" element={<BlogPage />} />
                <Route path="/tin-tuc/:id" element={<PostDetailPage />} />
                <Route path="/dang-nhap" element={<LoginPage />} />
                <Route path="/dang-ky" element={<RegisterPage />} />
                <Route path="/gio-hang" element={<CartPage />} />
                <Route path="/thanh-toan" element={<CheckoutPage />} />
              </Routes>
            </main>
            <footer className="footer">
              <p>© 2026 Nabati Store Vietnam — Thơm ngon tới miếng cuối cùng 🧀</p>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
