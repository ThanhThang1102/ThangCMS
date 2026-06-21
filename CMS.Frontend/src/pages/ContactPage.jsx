import { useState } from 'react';
import './ContactPage.css';

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const PhoneIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px' }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
    <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px' }}>
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1200);
  };

  return (
    <div className="contact-page">
      <div className="contact-header">
        <h1>Liên hệ với Nabati Store</h1>
        <p>Chúng tôi luôn sẵn sàng hỗ trợ và giải đáp thắc mắc của bạn</p>
      </div>

      <div className="contact-container">
        {/* Contact Info Card */}
        <div className="contact-info">
          <h2>Thông tin liên hệ</h2>
          <p className="info-subtitle">Hãy liên hệ với chúng tôi qua bất kỳ kênh nào dưới đây.</p>
          
          <div className="info-list">
            <div className="info-item">
              <span className="info-icon">
                <MapPinIcon />
              </span>
              <div>
                <h4>Địa chỉ</h4>
                <p>Số 123 Đường Ba Tháng Hai, Phường 12, Quận 10, TP. Hồ Chí Minh</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">
                <PhoneIcon />
              </span>
              <div>
                <h4>Điện thoại</h4>
                <p>Hotline: 1900 1234 — (028) 3824 5555</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">
                <MailIcon />
              </span>
              <div>
                <h4>Email</h4>
                <p>support@nabatistore.vn — info@nabati.com</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">
                <ClockIcon />
              </span>
              <div>
                <h4>Giờ làm việc</h4>
                <p>Thứ Hai — Chủ Nhật: 08:00 – 21:30 (Cả ngày lễ)</p>
              </div>
            </div>
          </div>

          <div className="social-links">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-btn fb">
              <FacebookIcon /> 
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-btn ig">
              <InstagramIcon /> 
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="social-btn yt">
              <YoutubeIcon /> 
            </a>
          </div>
        </div>

        {/* Contact Form Card */}
        <div className="contact-form-container">
          <h2>Gửi tin nhắn cho chúng tôi</h2>
          {submitted ? (
            <div className="success-message">
              <div className="success-icon">
                <CheckCircleIcon />
              </div>
              <h3>Gửi tin nhắn thành công!</h3>
              <p>Cảm ơn bạn đã liên hệ. Đội ngũ CSKH của Nabati Store sẽ phản hồi bạn trong vòng 24 giờ làm việc.</p>
              <button className="btn-reset" onClick={() => setSubmitted(false)}>Gửi thêm tin nhắn</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Họ và tên</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Địa chỉ Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Tiêu đề</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Vấn đề bạn cần hỗ trợ..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Nội dung tin nhắn</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Nhập nội dung tin nhắn chi tiết tại đây..."
                  required
                ></textarea>
              </div>

              <button type="submit" className="btn-contact-submit" disabled={loading}>
                {loading ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
