import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import categoryProductService from '../services/categoryProductService';
import Spinner from '../components/Spinner';
import './ShopPage.css';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

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
        </aside>

        {/* Products */}
        <main className="shop-main">
          <div className="result-info">
            {!loading && <span>{filtered.length} sản phẩm</span>}
          </div>
          {loading ? <Spinner text="Đang tải sản phẩm..." /> : (
            filtered.length === 0
              ? <div className="empty-state">Không tìm thấy sản phẩm nào.</div>
              : <div className="product-grid">
                  {filtered.map(p => (
                    <Link to={`/san-pham/${p.id}`} key={p.id} className="product-card">
                      <div className="product-img-wrapper">
                        {p.imageUrl
                          ? <img src={`http://localhost:5035${p.imageUrl}`} alt={p.name} />
                          : <div className="no-img">📦</div>}
                      </div>
                      <div className="product-info">
                        <p className="product-category">{p.categoryName || 'Sản phẩm'}</p>
                        <h3 className="product-name">{p.name}</h3>
                        <p className="product-desc">{p.description?.substring(0, 60)}...</p>
                        <div className="product-footer">
                          <span className="product-price">{formatPrice(p.price)}</span>
                          <span className={`product-stock ${p.stockQuantity === 0 ? 'out' : ''}`}>
                            {p.stockQuantity === 0 ? 'Hết hàng' : `Còn ${p.stockQuantity}`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
          )}
        </main>
      </div>
    </div>
  );
}
