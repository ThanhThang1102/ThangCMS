import { useSearchParams, Link } from 'react-router-dom';
import './PaymentResultPage.css';

const ERROR_CODES = {
  '24': 'Bạn đã hủy giao dịch thanh toán.',
  '11': 'Đã hết hạn chờ thanh toán. Vui lòng thử lại.',
  '09': 'Thẻ/Tài khoản chưa đăng ký dịch vụ Internet Banking.',
  '10': 'Xác thực thông tin thẻ/tài khoản quá 3 lần.',
  '07': 'Giao dịch bị nghi ngờ gian lận. Liên hệ VNPay để hỗ trợ.',
  'chu-ky-khong-hop-le': 'Chữ ký giao dịch không hợp lệ. Vui lòng thử lại.'
};

export default function PaymentFailPage() {
  const [params] = useSearchParams();
  const code = params.get('ma') || params.get('loi') || '';
  const message = ERROR_CODES[code] || 'Thanh toán không thành công. Vui lòng thử lại.';

  return (
    <div className="payment-result-page fail">
      <div className="result-card">
        <div className="result-icon fail-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1>Thanh toán thất bại</h1>
        <p className="result-desc">{message}</p>
        {code && <p className="error-code">Mã lỗi: <code>{code}</code></p>}

        <div className="result-actions">
          <Link to="/thanh-toan" className="btn-primary-result">Thử thanh toán lại</Link>
          <Link to="/gio-hang" className="btn-secondary-result">Quay lại giỏ hàng</Link>
        </div>
      </div>
    </div>
  );
}
