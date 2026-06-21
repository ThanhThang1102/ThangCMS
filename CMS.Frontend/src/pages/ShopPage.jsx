import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import productService from '../services/productService';
import categoryProductService from '../services/categoryProductService';
import Spinner from '../components/Spinner';
import { useCart } from '../context/CartContext';
import { IMAGE_BASE_URL } from '../config';
import './ShopPage.css';

const SearchNotFoundIllustration = () => (
  <svg viewBox="0 0 200 200" style={{ width: '150px', height: '150px', marginBottom: '1.5rem', opacity: 0.85 }}>
    <circle cx="100" cy="100" r="70" fill="none" stroke="rgba(250, 204, 21, 0.12)" strokeWidth="2" strokeDasharray="6 6" />
    <circle cx="50" cy="60" r="3" fill="#facc15" opacity="0.6" />
    <circle cx="160" cy="80" r="4" fill="#f97316" opacity="0.8" />
    <circle cx="70" cy="150" r="2.5" fill="#facc15" opacity="0.4" />
    <path d="M70 50h50a10 10 0 0 1 10 10v60a10 10 0 0 1-10 10H70a10 10 0 0 1-10-10V60a10 10 0 0 1 10-10z" fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="80" y1="75" x2="110" y2="75" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="80" y1="95" x2="100" y2="95" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2.5" strokeLinecap="round" />
    <g transform="translate(10, 10)">
      <line x1="125" y1="125" x2="155" y2="155" stroke="url(#orange-grad)" strokeWidth="6" strokeLinecap="round" />
      <line x1="125" y1="125" x2="155" y2="155" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="32" fill="#1e1f29" stroke="url(#orange-grad)" strokeWidth="5" />
      <circle cx="100" cy="100" r="32" fill="none" stroke="#facc15" strokeWidth="2" />
      <line x1="100" y1="88" x2="100" y2="100" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
      <circle cx="100" cy="108" r="2.5" fill="#facc15" />
    </g>
    <defs>
      <linearGradient id="orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
  </svg>
);

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const productsPerPage = 6;
  const { addToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const catParam = searchParams.get('category');
  const selectedCat = catParam ? parseInt(catParam, 10) : null;

  const setSelectedCat = (catId) => {
    if (catId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category: catId });
    }
  };

  useEffect(() => {
    categoryProductService.getAll()
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const req = selectedCat
      ? productService.getByCategory(selectedCat)
      : productService.getAll();
    req
      .then(setProducts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedCat]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCat, search, minPrice, maxPrice]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const filtered = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesMin = minPrice === '' || p.price >= parseFloat(minPrice);
    const matchesMax = maxPrice === '' || p.price <= parseFloat(maxPrice);
    return matchesSearch && matchesMin && matchesMax;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filtered.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filtered.length / productsPerPage);

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>🛍️ Cửa hàng</h1>
        <p>Khám phá toàn bộ sản phẩm của chúng tôi</p>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="shop-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <h3>📂 Danh mục</h3>
          <ul>
            <li>
              <button
                className={selectedCat === null ? 'active' : ''}
                onClick={() => setSelectedCat(null)}
              >
                Tất cả sản phẩm
              </button>
            </li>
            {categories.map(c => (
              <li key={c.id}>
                <button
                  className={selectedCat === c.id ? 'active' : ''}
                  onClick={() => setSelectedCat(c.id)}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>

          <div className="price-filter-section">
            <h3>💰 Lọc theo giá</h3>
            <div className="price-inputs">
              <div className="price-input-group">
                <label>Giá tối thiểu (Min)</label>
                <input
                  type="number"
                  placeholder="0 đ"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                />
              </div>
              <div className="price-input-group">
                <label>Giá tối đa (Max)</label>
                <input
                  type="number"
                  placeholder="Vô hạn"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="price-presets">
              <button className="preset-btn" onClick={() => { setMinPrice(''); setMaxPrice(50000); }}>Dưới 50K</button>
              <button className="preset-btn" onClick={() => { setMinPrice(50000); setMaxPrice(100000); }}>50K - 100K</button>
              <button className="preset-btn" onClick={() => { setMinPrice(100000); setMaxPrice(''); }}>Trên 100K</button>
            </div>

            {(minPrice !== '' || maxPrice !== '') && (
              <button className="btn-clear-price" onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                Xóa bộ lọc giá
              </button>
            )}
          </div>
        </aside>

        <main className="shop-main">
          <div className="result-info">
            {!loading && <span>{filtered.length} sản phẩm</span>}
          </div>
          {loading ? <Spinner text="Đang tải sản phẩm..." /> : (
            filtered.length === 0
              ? <div className="empty-state">
                  <SearchNotFoundIllustration />
                  <p className="empty-state-title">Không tìm thấy sản phẩm phù hợp</p>
                  <p className="empty-state-subtitle">Hãy thử tìm kiếm bằng từ khóa khác hoặc điều chỉnh lại bộ lọc giá xem sao nhé!</p>
                </div>
              : <>
                  <div className="product-grid">
                    {currentProducts.map(p => (
                      <div key={p.id} className="product-card">
                        <Link to={`/san-pham/${p.id}`} className="product-img-link">
                          <div className="product-img-wrapper">
                            {p.imageUrl
                              ? <img src={`${IMAGE_BASE_URL}${p.imageUrl}`} alt={p.name} />
                              : <div className="no-img">📦</div>}
                          </div>
                        </Link>
                        <div className="product-info">
                          <p className="product-category">{p.categoryName || 'Sản phẩm'}</p>
                          <h3 className="product-name">
                            <Link to={`/san-pham/${p.id}`}>{p.name}</Link>
                          </h3>
                          <p className="product-desc">{p.description?.substring(0, 60)}...</p>
                          <div className="product-footer">
                            <span className="product-price">{formatPrice(p.price)}</span>
                            <span className={`product-stock ${p.stockQuantity === 0 ? 'out' : ''}`}>
                              {p.stockQuantity === 0 ? 'Hết hàng' : `Còn ${p.stockQuantity}`}
                            </span>
                          </div>
                          <div className="product-card-actions">
                            <Link to={`/san-pham/${p.id}`} className="btn-details">Chi tiết</Link>
                            <button 
                              onClick={() => addToCart(p, 1)} 
                              disabled={p.stockQuantity <= 0}
                              className="btn-add-to-cart"
                            >
                              {p.stockQuantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="page-btn prev-btn"
                      >
                        ← Trước
                      </button>

                      {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`page-btn ${page === currentPage ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="page-btn next-btn"
                      >
                        Sau →
                      </button>
                    </div>
                  )}
                </>
          )}
        </main>
      </div>
    </div>
  );
}
