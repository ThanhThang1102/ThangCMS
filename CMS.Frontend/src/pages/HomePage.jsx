import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import NewProducts from '../components/NewProducts';
import BestSellingProducts from '../components/BestSellingProducts';
import postService from '../services/postService';
import './HomePage.css';

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);

  useEffect(() => {
    postService.getAll()
      .then(data => setLatestPosts(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('vi-VN');

  return (
    <div className="home-page">
      <HeroBanner />

      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon">🚚</div>
          <h3>Giao Hàng Nhanh</h3>
          <p>Nhận bánh trong vòng 24h nội thành</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">⭐</div>
          <h3>Chất Lượng Cao</h3>
          <p>Cam kết sản phẩm chính hãng Nabati</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">🛡️</div>
          <h3>Đổi Trả Dễ Dàng</h3>
          <p>1 đổi 1 nếu sản phẩm lỗi</p>
        </div>
      </div>

      <NewProducts />
      
      <BestSellingProducts />

      {/* TIN TỨC / BÀI VIẾT (Tùy chọn hiển thị nếu muốn) */}
      {latestPosts.length > 0 && (
        <section className="latest-posts">
          <div className="section-header">
            <h2 className="section-title">Tin Tức Khuyến Mãi 📰</h2>
            <Link to="/tin-tuc" className="view-all">Xem tất cả &rarr;</Link>
          </div>
          <div className="posts-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-image">
                  <img src={`http://localhost:5035${post.imageUrl}`} alt={post.title} />
                </div>
                <div className="post-info">
                  <span className="post-category">{post.categoryName}</span>
                  <h3><Link to={`/tin-tuc/${post.id}`}>{post.title}</Link></h3>
                  <div className="post-date">{formatDate(post.createdDate)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
