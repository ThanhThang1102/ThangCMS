import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { IMAGE_BASE_URL } from '../config';
import './CartPage.css';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const { addToast } = useToast();

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (cart.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="empty-cart-icon">🛒</div>
        <h2>Giỏ hàng của bạn đang trống</h2>
        <p>Hãy khám phá thêm các sản phẩm tuyệt vời của chúng tôi!</p>
        <Link to="/san-pham" className="btn-primary mt-4">Tiếp tục mua sắm</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>🛒 Giỏ hàng</h1>
        <button 
          onClick={() => {
            clearCart();
            addToast('Đã xóa toàn bộ sản phẩm khỏi giỏ hàng!', 'info');
          }} 
          className="btn-clear"
        >
          Xóa toàn bộ
        </button>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map(item => (
            <div key={item.productId} className="cart-item">
              <div className="item-img">
                {item.imageUrl 
                  ? <img src={`${IMAGE_BASE_URL}${item.imageUrl}`} alt={item.name} />
                  : <div className="no-img-sm">📦</div>}
              </div>
              
              <div className="item-info">
                <h3 className="item-name"><Link to={`/san-pham/${item.productId}`}>{item.name}</Link></h3>
                <div className="item-price">{formatPrice(item.price)}</div>
              </div>
              
              <div className="item-qty">
                <button onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
              </div>
              
              <div className="item-subtotal">
                {formatPrice(item.price * item.quantity)}
              </div>
              
              <button 
                className="btn-remove" 
                onClick={() => {
                  removeFromCart(item.productId);
                  addToast(`Đã xóa ${item.name} khỏi giỏ hàng!`, 'info');
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Tóm tắt đơn hàng</h3>
          <div className="summary-row">
            <span>Tạm tính</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Phí giao hàng</span>
            <span>Miễn phí</span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Tổng cộng</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          
          <Link to="/thanh-toan" className="btn-checkout">Tiến hành thanh toán</Link>
          <Link to="/san-pham" className="btn-continue">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  );
}
