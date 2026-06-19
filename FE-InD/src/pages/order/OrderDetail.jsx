// src/pages/order/OrderDetail.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import OrderApi from '../../services/api/OrderApi';

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price).replace('₫', 'đ');

const InfoRow = ({ label, value, children }) => (
  <div className="flex gap-2 text-sm">
    <span className="text-gray-400 w-48 flex-shrink-0">{label}:</span>
    <span className="text-gray-700 font-medium">{children || value}</span>
  </div>
);

const getStatusStyle = (status) => {
  if (!status) return 'bg-slate-100 text-slate-700';
  if (status.includes('hủy') || status.includes('Hủy')) return 'bg-red-100 text-red-700';
  if (status.includes('Thanh toán') || status.includes('Đã')) return 'bg-green-100 text-green-700';
  if (status.includes('xử lý') || status.includes('Chờ')) return 'bg-amber-100 text-amber-700';
  return 'bg-slate-100 text-slate-700';
};

const OrderDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await OrderApi.getById(orderId);
      setOrder(response);
    } catch (error) {
      console.error('Lỗi tải chi tiết đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLayout><div className="text-center py-20 text-slate-500">Đang tải chi tiết đơn hàng...</div></PageLayout>;
  }

  if (!order) {
    return (
      <PageLayout>
        <div className="text-center py-20">
          <p className="text-slate-500 mb-4">Không tìm thấy thông tin đơn hàng.</p>
          <Link to="/orders" className="text-indigo-600 font-semibold">Quay lại danh sách đơn hàng</Link>
        </div>
      </PageLayout>
    );
  }

  const isCancelled = order.status?.toLowerCase().includes('hủy');

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-6 flex items-center gap-1">
        <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">Trang chủ</button>
        <span>/</span>
        <button onClick={() => navigate('/orders')} className="hover:text-indigo-600 transition-colors">Đơn hàng của tôi</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">Chi tiết đơn hàng</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Cột chính */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-lg font-bold text-gray-800">Chi tiết đơn hàng #{order.orderNumber || order.id}</h1>
                <p className="text-xs text-gray-400 mt-0.5">Đặt ngày: {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-2.5">
            <h3 className="font-semibold text-sm mb-3 text-gray-700">Thông tin đơn hàng</h3>
            <InfoRow label="Người nhận" value={order.customerName || order.receiver} />
            <InfoRow label="Số điện thoại" value={order.customerPhone || order.phone} />
            <InfoRow label="Email" value={order.customerEmail || order.email} />
            <InfoRow label="Địa chỉ" value={order.shippingAddress || order.address} />
            <InfoRow label="Hình thức vận chuyển" value={order.deliveryMethod || order.delivery} />
            <InfoRow label="Phương thức thanh toán" value={order.paymentMethod || order.payment} />
            <InfoRow label="Trạng thái">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(order.status)}`}>
                {order.status}
              </span>
            </InfoRow>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-4 text-gray-700">Đơn hàng đã mua</h3>
            <div className="space-y-4">
              {order.items?.map((item, i) => (
                <div key={i} className="flex gap-4 items-center border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <img src={item.imageUrl || item.image} alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Màu: {item.color} · Size: {item.size} · SL: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-sm text-gray-800">{fmt(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phụ */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-4 text-gray-700">Tóm tắt đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Tạm tính</span>
                <span>{fmt(order.subtotal !== undefined && order.subtotal !== null ? order.subtotal : (order.totalAmount - (order.shippingFee || 0)))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phí vận chuyển</span>
                <span className={order.shippingFee > 0 ? "text-gray-800" : "text-green-600 font-medium"}>
                  {order.shippingFee > 0 ? fmt(order.shippingFee) : "Miễn phí"}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-3">
                <span>Tổng cộng</span><span className="text-indigo-600">{fmt(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">Thao tác</h3>
            <button
              onClick={() => navigate(`/orders/cancel?id=${order.id}`)}
              disabled={isCancelled}
              className={`w-full border px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isCancelled ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-red-200 text-red-500 hover:bg-red-50'}`}>
              {isCancelled ? 'Đơn hàng đã hủy' : 'Hủy đơn hàng'}
            </button>
            <button onClick={() => navigate('/')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Tiếp tục mua sắm
            </button>
            <button onClick={() => navigate('/orders')}
              className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors">
              Xem tất cả đơn hàng
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default OrderDetail;