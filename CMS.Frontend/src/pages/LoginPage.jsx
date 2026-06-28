import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const data = await customerService.login({ email, password });
      login(data);
      addToast('Đăng nhập thành công!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Đăng nhập</h2>
        <p className="auth-subtitle">Chào mừng bạn quay lại hệ thống</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập địa chỉ email" 
              required 
            />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu" 
                required 
              />
              <button 
                type="button" 
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
                    <path fillRule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 0 1 0-1.113ZM17.25 12a5.25 5.25 0 1 1-10.5 0 5.25 5.25 0 0 1 10.5 0Z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM22.676 12.553a11.249 11.249 0 0 1-2.631 4.31l-3.099-3.099a5.25 5.25 0 0 0-6.71-6.71L7.759 4.577a11.217 11.217 0 0 1 4.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113Z" />
                    <path d="M15.701 14.64 12 10.94V12a3 3 0 0 0 3.701 2.64ZM12.001 20.25c-4.97 0-9.186-3.223-10.675-7.69a1.761 1.761 0 0 1 0-1.113 11.273 11.273 0 0 1 3.478-4.928L7.89 9.606a5.25 5.25 0 0 0 6.504 6.504l3.149 3.149a11.22 11.22 0 0 1-5.541 1.001Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
          <div className="forgot-password-link" style={{ marginTop: '12px' }}>
            <Link to="/quen-mat-khau" style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: '0.85rem', textDecoration: 'underline' }}>Quên mật khẩu?</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
