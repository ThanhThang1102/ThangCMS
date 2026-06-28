import React, { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import './PaymentResultPage.css';

export default function PaymentSuccessPage() {
  const [params] = useSearchParams();
  const orderId = params.get('ma-don');
  const { addToast } = useToast();
  const { clearCart } = useCart();

  const hasRun = React.useRef(false);

  useEffect(() => {
    if (!hasRun.current) {
      // Chỉ xóa giỏ hàng TẠI ĐÂY — sau khi VNPay xác nhận thành công
      clearCart();
      addToast('Thanh toán VNPay thành công! Đơn hàng đang được xử lý.', 'success');
      hasRun.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="payment-result-page success">
      <div className="result-card">
        <div className="result-icon success-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </div>

        <h1>Thanh toán thành công!</h1>
        <p className="result-desc">
          Cảm ơn bạn đã thanh toán qua <strong>VNPay</strong>.
          {orderId && <> Mã đơn hàng của bạn là <strong className="order-id">#{orderId}</strong>.</>}
          <br />Chúng tôi sẽ xử lý và giao hàng sớm nhất có thể!
        </p>

        <div className="result-actions">
          <Link to="/don-hang" className="btn-primary-result">Xem đơn hàng của tôi</Link>
          <Link to="/san-pham" className="btn-secondary-result">Tiếp tục mua sắm</Link>
        </div>
      </div>
    </div>
  );
}
