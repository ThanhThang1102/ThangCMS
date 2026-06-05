import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await customerService.login({ email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>👋 Đăng nhập</h2>
        <p className="auth-subtitle">Chào mừng bạn quay lại hệ thống</p>
        
        {error && <div className="auth-error">{error}</div>}
        
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
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu" 
              required 
            />
          </div>
          
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/dang-ky">Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
