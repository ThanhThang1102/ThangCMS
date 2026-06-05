import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import customerService from '../services/customerService';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const data = await customerService.register(formData);
      // Auto login after register
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card">
        <h2>✨ Tạo tài khoản mới</h2>
        <p className="auth-subtitle">Điền thông tin để bắt đầu mua sắm</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input name="fullName" type="text" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input name="phone" type="text" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Địa chỉ</label>
            <input name="address" type="text" onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input name="password" type="password" onChange={handleChange} required />
          </div>
          
          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Đăng ký tài khoản'}
          </button>
        </form>
        
        <div className="auth-footer">
          Đã có tài khoản? <Link to="/dang-nhap">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
