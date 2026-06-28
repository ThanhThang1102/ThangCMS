import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import customerService from '../services/customerService';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState({ type: '', text: '' });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/dang-nhap');
      return;
    }
    setFullName(user.fullName || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
  }, [user, navigate]);

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updatedUser = await customerService.update(user.id, {
        id: user.id,
        fullName,
        email,
        phone,
        address
      });
      
      // Update local context
      login(updatedUser);
      setMessage({ type: 'success', text: 'Cập nhật thông tin cá nhân thành công!' });
      addToast('Cập nhật thông tin cá nhân thành công!', 'success');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      setMessage({ 
        type: 'error', 
        text: errMsg 
      });
      addToast(errMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdMessage({ type: '', text: '' });

    if (newPassword.length < 6) {
      const errMsg = 'Mật khẩu mới phải có tối thiểu 6 ký tự';
      setPwdMessage({ type: 'error', text: errMsg });
      addToast(errMsg, 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      const errMsg = 'Mật khẩu mới và xác nhận mật khẩu không khớp';
      setPwdMessage({ type: 'error', text: errMsg });
      addToast(errMsg, 'error');
      return;
    }

    setPwdLoading(true);
    try {
      await customerService.changePassword(user.id, {
        currentPassword,
        newPassword
      });
      setPwdMessage({ type: 'success', text: 'Thay đổi mật khẩu thành công!' });
      addToast('Thay đổi mật khẩu thành công!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.';
      setPwdMessage({
        type: 'error',
        text: errMsg
      });
      addToast(errMsg, 'error');
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1 -9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1 -.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1 -.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <h2>Hồ Sơ Cá Nhân</h2>
          <p>Quản lý thông tin tài khoản của bạn</p>
        </div>

        <div className="profile-content-grid">
          {/* Cột trái: Đổi Mật Khẩu */}
          <div className="profile-card password-card">
            <h3>🔐 Đổi Mật Khẩu</h3>
            {pwdMessage.text && (
              <div className={`profile-alert ${pwdMessage.type}`}>
                {pwdMessage.type === 'success' ? '✅' : '❌'} {pwdMessage.text}
              </div>
            )}
            <form onSubmit={handleChangePassword}>
              <div className="form-grid stack-fields">
                <div className="form-group">
                  <label>Mật khẩu hiện tại</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showCurrentPassword ? (
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
                <div className="form-group">
                  <label>Mật khẩu mới</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showNewPassword ? (
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
                <div className="form-group">
                  <label>Xác nhận mật khẩu mới</label>
                  <div className="password-input-wrapper">
                    <input
                      type={showConfirmNewPassword ? "text" : "password"}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="Xác nhận mật khẩu mới"
                    />
                    <button 
                      type="button" 
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                      aria-label={showConfirmNewPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                    >
                      {showConfirmNewPassword ? (
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
              </div>
              <div className="profile-actions">
                <button type="submit" className="btn-change-password" disabled={pwdLoading}>
                  {pwdLoading ? 'Đang đổi...' : 'Đổi mật khẩu'}
                </button>
              </div>
            </form>
          </div>

          {/* Cột phải: Sửa Thông Tin */}
          <div className="profile-card info-card">
            <h3>📝 Sửa Thông Tin Cá Nhân</h3>
            {message.text && (
              <div className={`profile-alert ${message.type}`}>
                {message.type === 'success' ? '✅' : '❌'} {message.text}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và Tên</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={!isEditing}
                    required
                    placeholder="Nhập họ và tên"
                  />
                </div>

                <div className="form-group">
                  <label>Địa chỉ Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={!isEditing}
                    required
                    placeholder="Nhập địa chỉ email"
                  />
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Địa chỉ nhận hàng</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Nhập địa chỉ đầy đủ"
                    rows="3"
                  />
                </div>
              </div>

              <div className="profile-actions">
                {isEditing ? (
                  <>
                    <button 
                      type="button" 
                      className="btn-cancel" 
                      onClick={() => {
                        setIsEditing(false);
                        setFullName(user.fullName || '');
                        setEmail(user.email || '');
                        setPhone(user.phone || '');
                        setAddress(user.address || '');
                        setMessage({ type: '', text: '' });
                      }}
                      disabled={loading}
                    >
                      Hủy bỏ
                    </button>
                    <button type="submit" className="btn-save" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </>
                ) : (
                  <button 
                    type="button" 
                    className="btn-edit" 
                    onClick={() => setIsEditing(true)}
                  >
                    📝 Chỉnh sửa thông tin
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
