// src/pages/order/CancelOrder.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import OrderApi from '../../services/api/OrderApi';

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price).replace('₫', 'đ');

const CANCEL_REASONS = [
  'Tôi muốn đổi sang sản phẩm khác',
  'Tôi đặt nhầm sản phẩm',
  'Cần thay đổi địa chỉ',
  'Đơn hàng xử lý quá chậm',
  'Thay đổi nhu cầu',
  'Lý do khác',
];

const CancelOrder = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setFetching(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await OrderApi.getById(orderId);
      setOrder(response);
    } catch (error) {
      console.error('Lỗi tải đơn hàng:', error);
    } finally {
      setFetching(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedReason) {
      alert('Vui lòng chọn lý do hủy đơn hàng!');
      return;
    }
    setLoading(true);
    const reason = selectedReason === 'Lý do khác' ? otherReason : selectedReason;
    
    try {
      await OrderApi.cancel(orderId, reason);
      setCancelled(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Không thể hủy đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <PageLayout><div className="text-center py-20 text-slate-500">Đang tải...</div></PageLayout>;
  }
  
  if (!order) {
    return <PageLayout><div className="text-center py-20 text-slate-500">Đơn hàng không tồn tại.</div></PageLayout>;
  }

  const previewItem = order?.items?.[0];
  const orderDate = order?.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : 'N/A';
  const orderStatus = order?.status || 'Đang xử lý';
  const orderTotal = order?.totalAmount || order?.total || 0;
  const alreadyCancelled = orderStatus.toLowerCase().includes('hủy');

  if (alreadyCancelled) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đơn hàng này đã được hủy</h2>
          <p className="text-gray-500 text-sm mb-4">
            Mã đơn hàng <span className="font-semibold text-indigo-600">#{orderId}</span> đã ở trạng thái <span className="font-semibold">{orderStatus}</span>.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => navigate('/orders')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              Quay về danh sách đơn hàng
            </button>
            <button onClick={() => navigate('/')}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (cancelled) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-5">
            <span className="text-4xl">🚫</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Đơn hàng đã được hủy</h2>
          <p className="text-gray-500 text-sm mb-1">
            Mã đơn hàng: <span className="font-semibold text-indigo-600">#{orderId}</span>
          </p>
          <p className="text-gray-400 text-xs mb-8 max-w-xs">
            Yêu cầu hủy đã được ghi nhận. Nếu bạn đã thanh toán, tiền sẽ được hoàn lại trong 3–5 ngày làm việc.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button onClick={() => navigate('/orders')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
              Xem đơn hàng của tôi
            </button>
            <button onClick={() => navigate('/')}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors">
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Breadcrumb */}
      <div className="text-xs text-gray-400 mb-6 flex items-center gap-1">
        <button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">Trang chủ</button>
        <span>/</span>
        <button onClick={() => navigate('/orders')} className="hover:text-indigo-600 transition-colors">Đơn hàng</button>
        <span>/</span>
        <button onClick={() => navigate(`/orders/detail?id=${orderId}`)} className="hover:text-indigo-600 transition-colors">Chi tiết đơn hàng</button>
        <span>/</span>
        <span className="text-gray-600 font-medium">Hủy đơn hàng</span>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {/* Cột chính */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl flex-shrink-0">🚫</div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">Hủy đơn hàng #{orderId}</h1>
              <p className="text-xs text-gray-400">
                Đặt ngày: {orderDate} · <span className="text-amber-600 font-medium">{orderStatus}</span>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex gap-4 items-center">
              {previewItem && (
                <img src={previewItem.imageUrl || previewItem.image} alt={previewItem.name}
                  className="w-16 h-16 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">{previewItem?.name || 'Sản phẩm'}</p>
                <p className="text-xs text-gray-400 mt-0.5">Mã đơn hàng: #{orderId}</p>
              </div>
              <p className="font-bold text-indigo-600">{fmt(orderTotal)}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-4 text-gray-700">Lý do hủy đơn</h3>
            <div className="space-y-2.5">
              {CANCEL_REASONS.map((reason) => (
                <label key={reason}
                  className={`flex items-center gap-3 cursor-pointer p-3 rounded-xl border transition-all
                    ${selectedReason === reason ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="reason" value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-indigo-600 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Lý do khác' && (
              <textarea
                placeholder="Nhập lý do của bạn..."
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                rows={3}
                className="w-full mt-3 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-400 resize-none"
              />
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
            <p className="font-semibold mb-1">⚠️ Lưu ý trước khi hủy đơn</p>
            <ul className="text-xs space-y-1 text-amber-700 list-none">
              <li>• Đơn đã xác nhận có thể mất thêm 1–2 ngày để hủy thành công</li>
              <li>• Nếu đơn đã thanh toán, tiền hoàn lại trong vòng 3–5 ngày làm việc</li>
              <li>• Hotline hỗ trợ: <span className="font-bold">0399.599.188</span></li>
            </ul>
          </div>
        </div>

        {/* Cột phụ */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-sm mb-4 text-gray-700">Phí hủy đơn</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Tổng đơn hàng</span><span>{fmt(orderTotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phí hủy</span><span className="text-green-600">Miễn phí</span></div>
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3 mt-3">
                <span>Hoàn lại</span><span className="text-indigo-600">{fmt(orderTotal)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            <button onClick={handleConfirm} disabled={loading}
              className={`w-full font-semibold py-3 rounded-xl text-sm transition-colors text-white
                ${loading ? 'bg-red-300 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'}`}>
              {loading ? 'Đang xử lý...' : 'Xác nhận hủy đơn'}
            </button>
            <button onClick={() => navigate(`/orders/detail?id=${orderId}`)}
              className="w-full border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors">
              ← Giữ đơn hàng
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CancelOrder;