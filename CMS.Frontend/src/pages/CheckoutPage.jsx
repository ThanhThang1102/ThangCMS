import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import customerService from '../services/customerService';
import orderService from '../services/orderService';
import axiosClient from '../api/axiosClient';
import './CheckoutPage.css';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'vnpay'

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

    try {
      if (paymentMethod === 'vnpay') {
        // ---- VNPay flow ----
        const payload = {
          customerId: user?.id ?? 0,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          notes: formData.notes,
          orderDetails: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        };

        // axiosClient interceptor đã unwrap response.data → res chính là payload
        const res = await axiosClient.post('/payment/create-vnpay-url', payload);
        const paymentUrl = res?.paymentUrl || res?.data?.paymentUrl;
        if (!paymentUrl) throw new Error('Không nhận được URL thanh toán từ server.');

        // KHÔNG xóa giỏ hàng ở đây!
        // Cart sẽ chỉ được xóa SAU KHI VNPay xác nhận thanh toán thành công
        // (tại trang /thanh-toan-thanh-cong)
        window.location.href = paymentUrl;
        return;
      }

      // ---- COD flow (giữ nguyên) ----
      let customerId = user?.id;
      if (!customerId) {
        const custData = await customerService.register({
          ...formData,
          password: 'GuestUser123!'
        });
        customerId = custData.id;
      }

      const orderPayload = {
        customerId,
        notes: formData.notes,
        orderDetails: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      await orderService.create(orderPayload);
      clearCart();
      addToast('Đặt hàng thành công! Đang chuyển hướng về trang đơn hàng...', 'success');
      setTimeout(() => { navigate('/don-hang'); }, 2000);

    } catch (err) {
      const errMsg = err.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.';
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1>Thanh toán</h1>

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

            {/* ---- Phương thức thanh toán ---- */}
            <div className="form-group">
              <label>Phương thức thanh toán</label>
              <div className="payment-methods">
                <label className={`payment-method-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <span className="pm-icon">💵</span>
                  <span className="pm-label">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className={`payment-method-option ${paymentMethod === 'vnpay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="vnpay"
                    checked={paymentMethod === 'vnpay'}
                    onChange={() => setPaymentMethod('vnpay')}
                  />
                  <span className="pm-icon">🏦</span>
                  <span className="pm-label">Thanh toán qua VNPay (ATM / QR Code)</span>
                </label>
              </div>
            </div>

            <button type="submit" className="btn-submit-order" disabled={loading}>
              {loading
                ? 'Đang xử lý...'
                : paymentMethod === 'vnpay'
                  ? '🏦 Thanh toán với VNPay'
                  : '✅ Xác nhận đặt hàng (COD)'}
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
