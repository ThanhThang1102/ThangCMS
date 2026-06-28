import { useState } from 'react';
import { Link } from 'react-router-dom';
import customerService from '../services/customerService';
import { useToast } from '../context/ToastContext';
import './AuthPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);

    try {
      await customerService.forgotPassword({ email });
      setSuccess(true);
      addToast('Mật khẩu mới đã được gửi thành công đến email của bạn!', 'success');
      setEmail('');
    } catch (err) {
      addToast(err.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Quên mật khẩu</h2>
        
        {success ? (
          <div className="success-container" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <div className="success-icon-badge" style={{ fontSize: '3rem', marginBottom: '1rem', color: '#10b981' }}>📧</div>
            <h3 style={{ color: '#34d399', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: '700' }}>Gửi yêu cầu thành công!</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem', lineHeight: '1.6', marginBottom: '2rem' }}>
              Một mật khẩu tạm thời mới đã được tạo và gửi đến hòm thư của bạn. Vui lòng kiểm tra hộp thư đến (và hòm thư rác/spam nếu không thấy) để nhận thông tin.
            </p>
            <Link to="/dang-nhap" className="btn-auth" style={{ display: 'block', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
              Quay lại Đăng nhập
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-subtitle">Nhập email tài khoản của bạn để nhận mật khẩu tạm thời mới</p>
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label>Địa chỉ Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn..." 
                  required 
                />
              </div>
              
              <button type="submit" className="btn-auth" disabled={loading}>
                {loading ? 'Đang gửi yêu cầu...' : 'Gửi mật khẩu mới'}
              </button>
            </form>
            
            <div className="auth-footer" style={{ marginTop: '20px' }}>
              <Link to="/dang-nhap">&larr; Quay lại Đăng nhập</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
