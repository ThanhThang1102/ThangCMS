import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import orderService from '../services/orderService';
import Spinner from '../components/Spinner';
import './OrdersPage.css';

export default function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!user) {
      navigate('/dang-nhap');
      return;
    }

    setLoading(true);
    orderService.getByCustomer(user.id, page)
      .then(data => {
        if (data && data.items) {
          setOrders(data.items);
          setTotalPages(data.totalPages);
        } else {
          setOrders(data || []);
          setTotalPages(1);
        }
      })
      .catch(err => {
        console.error("Lỗi khi tải danh sách đơn hàng:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, navigate, page]);

  if (!user) return null;

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleViewDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const data = await orderService.getById(orderId);
      setSelectedOrder(data);
    } catch (err) {
      console.error("Không thể lấy chi tiết đơn hàng:", err);
      alert("Đã xảy ra lỗi khi tải chi tiết đơn hàng. Vui lòng thử lại!");
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 0) return 'status-pending';
    if (status === 1) return 'status-shipping';
    return 'status-completed';
  };

  const getStatusEmoji = (status) => {
    if (status === 0) return '⏳ ';
    if (status === 1) return '🚚 ';
    return '✅ ';
  };

  return (
    <div className="orders-page">
      <div className="orders-container">
        <div className="orders-header">
          <h2>📦 Đơn Hàng Của Tôi</h2>
          <p>Xem trạng thái và lịch sử tất cả các đơn hàng đã đặt</p>
        </div>

        {loading ? (
          <Spinner text="Đang tải danh sách đơn hàng..." />
        ) : orders.length === 0 ? (
          <div className="orders-empty">
            <div className="empty-icon">🛒</div>
            <h3>Chưa có đơn hàng nào</h3>
            <p>Bạn chưa thực hiện bất kỳ giao dịch mua sắm nào tại cửa hàng.</p>
            <Link to="/san-pham" className="btn-shop-now">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="orders-card">
            <div className="table-responsive">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Mã Đơn</th>
                    <th>Ngày Đặt</th>
                    <th>Tổng Tiền</th>
                    <th>Trạng Thái</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td className="order-id">#{o.id}</td>
                      <td>{formatDate(o.orderDate)}</td>
                      <td className="order-total">{formatPrice(o.totalAmount)}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(o.status)}`}>
                          {getStatusEmoji(o.status)}
                          {o.statusText}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-view-detail"
                          onClick={() => handleViewDetail(o.id)}
                          disabled={detailLoading}
                        >
                          Xem chi tiết
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn-page"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  &laquo; Trước
                </button>
                <span className="page-info">Trang {page} / {totalPages}</span>
                <button
                  className="btn-page"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Sau &raquo;
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Chi tiết Đơn hàng #{selectedOrder.id}</h3>
              <button className="btn-close" onClick={() => setSelectedOrder(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="order-summary-grid">
                <div>
                  <p><strong>Ngày đặt hàng:</strong> {formatDate(selectedOrder.orderDate)}</p>
                  <p><strong>Trạng thái:</strong> <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>{getStatusEmoji(selectedOrder.status)}{selectedOrder.statusText}</span></p>
                </div>
                <div>
                  <p><strong>Người nhận:</strong> {selectedOrder.customer?.fullName}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.customer?.phone || 'Chưa cung cấp'}</p>
                  <p><strong>Địa chỉ:</strong> {selectedOrder.customer?.address || 'Chưa cung cấp'}</p>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="order-notes-box">
                  <strong>Ghi chú:</strong> {selectedOrder.notes}
                </div>
              )}

              <h4 className="section-subtitle">Sản phẩm đã đặt</h4>
              <div className="modal-table-responsive">
                <table className="modal-order-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th className="text-right">Đơn giá</th>
                      <th className="text-center">Số lượng</th>
                      <th className="text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderDetails?.map(d => (
                      <tr key={d.id}>
                        <td>{d.productName || `Sản phẩm #${d.productId}`}</td>
                        <td className="text-right">{formatPrice(d.unitPrice)}</td>
                        <td className="text-center">{d.quantity}</td>
                        <td className="text-right font-medium">{formatPrice(d.subTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-right font-bold">Tổng thanh toán:</td>
                      <td className="text-right font-bold total-price">{formatPrice(selectedOrder.totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-modal-close" onClick={() => setSelectedOrder(null)}>Đóng lại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
