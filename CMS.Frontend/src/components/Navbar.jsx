import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const { user, logout } = useAuth();
  const { cartCount } = useCart();

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"></span>
          <span className="brand-text">Nabati Store</span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li><Link to="/" className={isActive('/') && location.pathname === '/' ? 'active' : ''} onClick={() => setMenuOpen(false)}>Trang chủ</Link></li>
          <li><Link to="/san-pham" className={isActive('/san-pham') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Sản phẩm</Link></li>
          <li><Link to="/tin-tuc" className={isActive('/tin-tuc') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Tin tức</Link></li>
          <li><Link to="/lien-he" className={isActive('/lien-he') ? 'active' : ''} onClick={() => setMenuOpen(false)}>Liên hệ</Link></li>
        </ul>
        
        <div className="navbar-actions">
          {user ? (
            <div className="user-dropdown">
              <button className="dropdown-trigger">
                Chào, {user.fullName?.split(' ').pop() || user.email} <span className="arrow">▼</span>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/ho-so">Hồ sơ cá nhân</Link>
                </li>
                <li>
                  <Link to="/don-hang">Đơn hàng của tôi</Link>
                </li>
                <li className="divider"></li>
                <li>
                  <button className="btn-logout-dropdown" onClick={handleLogout}>Đăng xuất</button>
                </li>
              </ul>
            </div>
          ) : (
            <Link to="/dang-nhap" className="nav-login">Đăng nhập</Link>
          )}
          
          <Link to="/gio-hang" className="nav-cart">
            🛒 <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
