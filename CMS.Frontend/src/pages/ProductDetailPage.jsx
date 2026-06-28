import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import productService from '../services/productService';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/Spinner';
import { IMAGE_BASE_URL } from '../config';
import './ProductDetailPage.css';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    productService.getById(id)
      .then(setProduct)
      .catch(() => setError('Không tìm thấy sản phẩm này.'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) return <Spinner text="Đang tải sản phẩm..." />;
  if (error) return (
    <div className="error-page">
      <div className="error-icon">😕</div>
      <h2>{error}</h2>
      <Link to="/san-pham" className="back-btn">← Quay lại cửa hàng</Link>
    </div>
  );

  return (
    <div className="product-detail">
      <div className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/san-pham">Sản phẩm</Link> / <span>{product.name}</span>
      </div>

      <div className="detail-layout">
        <div className="detail-img">
          {product.imageUrl
            ? <img src={`${IMAGE_BASE_URL}${product.imageUrl}`} alt={product.name} />
            : <div className="no-img-lg">📦</div>}
        </div>

        <div className="detail-info">
          {product.categoryName && (
            <span className="detail-category">{product.categoryName}</span>
          )}
          <h1 className="detail-name">{product.name}</h1>
          <div className="detail-price">{formatPrice(product.price)}</div>

          <div className="detail-stock">
            <span className={`stock-badge ${product.stockQuantity === 0 ? 'out' : 'in'}`}>
              {product.stockQuantity === 0 ? 'Hết hàng' : `Còn ${product.stockQuantity} sản phẩm`}
            </span>
          </div>

          {product.description && (
            <div className="detail-desc">
              <h3>Mô tả sản phẩm</h3>
              <p>{product.description}</p>
            </div>
          )}

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <div className="detail-actions">
            <button 
              className="btn-add-cart" 
              disabled={product.stockQuantity === 0}
              onClick={() => {
                addToCart(product, quantity);
                addToast(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, 'success');
              }}
            >
              🛒 Thêm vào giỏ hàng
            </button>
            <Link to="/san-pham" className="btn-back">← Tiếp tục mua sắm</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
