import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroBanner from '../components/HeroBanner';
import NewProducts from '../components/NewProducts';
import BestSellingProducts from '../components/BestSellingProducts';
import postService from '../services/postService';
import categoryProductService from '../services/categoryProductService';
import { API_BASE_URL, IMAGE_BASE_URL } from '../config';
import './HomePage.css';

export default function HomePage() {
  const [latestPosts, setLatestPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    categoryProductService.getAll()
      .then(setCategories)
      .catch(console.error);

    postService.getAll()
      .then(data => setLatestPosts(data.slice(0, 3)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      fetch(`${API_BASE_URL}/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => {
          setSearchResults(data);
          setShowDropdown(true);
        })
        .catch(err => {
          console.error(err);
          setSearchResults([]);
        });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('vi-VN');

  const getCategoryEmoji = (name) => {
    if (name.includes('Phô Mai') && name.includes('Xốp')) return '🧀';
    if (name.includes('Sô Cô La')) return '🍫';
    if (name.includes('Trà Xanh')) return '🍵';
    if (name.includes('Trứng Muối')) return '🥚';
    if (name.includes('Quy')) return '🍪';
    if (name.includes('Snack')) return '🍿';
    if (name.includes('Cuộn')) return '🥖';
    if (name.includes('Combo')) return '🏷️';
    if (name.includes('Quà')) return '🎁';
    if (name.includes('Ngũ Cốc') || name.includes('Dinh Dưỡng')) return '🌾';
    return '🍰';
  };

  return (
    <div className="home-page">
      

      {/* SEARCH BAR SECTION */}
      <div className="home-search-section">
        <div className="home-search-container">
          <div className="home-search-bar">
            <span className="home-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Bạn muốn tìm sản phẩm nào hôm nay?..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => { setTimeout(() => setShowDropdown(false), 200); }}
            />
            {searchQuery && (
              <button className="home-search-clear" onClick={() => setSearchQuery('')}>✕</button>
            )}
          </div>

          {showDropdown && searchResults.length > 0 && (
            <div className="search-dropdown">
              {searchResults.map(prod => (
                <Link to={`/san-pham/${prod.id}`} key={prod.id} className="dropdown-item">
                  <div className="dropdown-item-img">
                    {prod.imageUrl ? (
                      <img src={`${IMAGE_BASE_URL}${prod.imageUrl}`} alt={prod.name} />
                    ) : (
                      <span className="no-img-placeholder">📦</span>
                    )}
                  </div>
                  <div className="dropdown-item-info">
                    <div className="dropdown-item-name">{prod.name}</div>
                    <div className="dropdown-item-price">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(prod.price)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {showDropdown && searchQuery && searchResults.length === 0 && (
            <div className="search-dropdown empty-dropdown">
              Không tìm thấy sản phẩm nào phù hợp 😢
            </div>
          )}
        </div>
      </div>

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

      {/* CATEGORIES MENU SECTION */}
      {categories.length > 0 && (
        <section className="categories-menu-section">
          <div className="section-header">
            <h2 className="section-title">Danh Mục Sản Phẩm</h2>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link to={`/san-pham?category=${cat.id}`} key={cat.id} className="category-menu-card">
                <div className="category-menu-icon">{getCategoryEmoji(cat.name)}</div>
                <h3 className="category-menu-name">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <NewProducts />
      
      <BestSellingProducts />

      {/* TIN TỨC / BÀI VIẾT (Tùy chọn hiển thị nếu muốn) */}
      {latestPosts.length > 0 && (
        <section className="latest-posts">
          <div className="section-header">
            <h2 className="section-title">Tin Tức</h2>
            <Link to="/tin-tuc" className="view-all">Xem tất cả &rarr;</Link>
          </div>
          <div className="posts-grid">
            {latestPosts.map(post => (
              <div key={post.id} className="post-card">
                <div className="post-image">
                  <img src={`${IMAGE_BASE_URL}${post.imageUrl}`} alt={post.title} />
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
