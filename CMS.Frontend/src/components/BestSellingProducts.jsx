import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { IMAGE_BASE_URL } from '../config';
import './ProductShowcase.css';

export default function BestSellingProducts() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    productService.getBestSellers().then(data => {
      setProducts(data);
    }).catch(console.error);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="product-showcase">
      <div className="section-header">
        <h2 className="section-title">Bán Chạy Nhất</h2>
        <Link to="/san-pham" className="view-all">Xem tất cả &rarr;</Link>
      </div>
      <div className="product-grid">
        {products.map(product => (
          <div key={product.id} className="product-card hot-card">
            <div className="product-image">
              <img src={`${IMAGE_BASE_URL}${product.imageUrl}`} alt={product.name} />
              {product.stockQuantity <= 0 && <div className="out-of-stock">Hết hàng</div>}
            </div>
            <div className="product-info">
              <span className="product-category">{product.categoryName}</span>
              <h3><Link to={`/san-pham/${product.id}`}>{product.name}</Link></h3>
              <div className="product-price">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </div>
              <div className="product-card-actions">
                <Link to={`/san-pham/${product.id}`} className="btn-details">Chi tiết</Link>
                <button 
                  onClick={() => {
                    addToCart(product, 1);
                    addToast(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
                  }} 
                  disabled={product.stockQuantity <= 0}
                  className="btn-add-to-cart"
                >
                  {product.stockQuantity <= 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
