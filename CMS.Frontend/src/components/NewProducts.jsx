import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import './ProductShowcase.css';

export default function NewProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getNewest().then(data => {
      setProducts(data);
    }).catch(console.error);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="product-showcase">
      <div className="section-header">
        <h2 className="section-title">Sản Phẩm Mới Nhất</h2>
        <Link to="/shop" className="view-all">Xem tất cả &rarr;</Link>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={`http://localhost:5035${product.imageUrl}`} alt={product.name} />
              {product.stockQuantity <= 0 && <div className="out-of-stock">Hết hàng</div>}
            </div>
            <div className="product-info">
              <span className="product-category">{product.categoryName}</span>
              <h3><Link to={`/product/${product.id}`}>{product.name}</Link></h3>
              <div className="product-price">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
