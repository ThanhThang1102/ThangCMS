import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Prefill if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      }));
    }
  }, [user]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (cart.length === 0) {
    navigate('/gio-hang');
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let customerId = user?.id;

      // If not logged in, we must create a guest customer
      if (!customerId) {
        // Just post to create customer, ignoring password requirement since it's guest
        // (Assuming backend doesn't mandate password or handles null safely)
        const custData = await customerService.register({
          ...formData,
          password: 'GuestUser123!' // Dummy password for guests
        });
        customerId = custData.id;
      }

      // Prepare order payload
      const orderPayload = {
        customerId: customerId,
        notes: formData.notes,
        orderDetails: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      await orderService.create(orderPayload);
      clearCart();
      alert('🎉 Đặt hàng thành công! Mã đơn của bạn đã được ghi nhận.');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Thanh toán</h1>
      
      {error && <div className="checkout-error">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-form-container">
          <h2>Thông tin giao hàng</h2>
          {!user && (
            <div className="login-prompt">
              Bạn đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a> để thanh toán nhanh hơn.
            </div>
          )}
          
          <form onSubmit={handleCheckout} className="checkout-form">
            <div className="form-group">
              <label>Họ và tên</label>
              <input name="fullName" type="text" value={formData.fullName} onChange={handleChange} required />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input name="phone" type="text" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Địa chỉ giao hàng chi tiết</label>
              <input name="address" type="text" value={formData.address} onChange={handleChange} required />
            </div>
            
            <div className="form-group">
              <label>Ghi chú đơn hàng (Tùy chọn)</label>
              <textarea name="notes" rows="3" value={formData.notes} onChange={handleChange} placeholder="Ghi chú về thời gian giao hàng..."></textarea>
            </div>
            
            <button type="submit" className="btn-submit-order" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
            </button>
          </form>
        </div>
        
        <div className="checkout-summary">
          <h2>Đơn hàng của bạn ({cart.length} sản phẩm)</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.productId} className="summary-item">
                <div className="s-info">
                  <span className="s-name">{item.name}</span>
                  <span className="s-qty">x{item.quantity}</span>
                </div>
                <div className="s-price">{formatPrice(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Tổng thanh toán:</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
