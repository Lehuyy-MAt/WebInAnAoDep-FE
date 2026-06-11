import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { fmt } from '../../utils/fmt';
import PageLayout from '../../components/layout/PageLayout';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQty, clearCart } = useCart();

  const total = cartItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  return (
    <PageLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-gray-400 mb-6">Giỏ hàng của bạn đang trống</p>
          <Link to="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Danh sách sản phẩm ── */}
          <div className="flex-1">
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              {/* Table header */}
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 hidden md:grid grid-cols-12 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                <div className="col-span-6">Chi tiết đơn hàng</div>
                <div className="col-span-2 text-center">Số lượng</div>
                <div className="col-span-2 text-right">Đơn giá</div>
                <div className="col-span-2 text-right">Thành tiền</div>
              </div>

              {cartItems.map((item, idx) => (
                <div key={item.productId} className={`px-6 py-5 ${idx < cartItems.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div className="grid grid-cols-12 gap-4 items-center">

                    {/* Thông tin sản phẩm */}
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-200 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm leading-snug mb-1">{item.name}</p>
                        <p className="text-xs text-gray-400">Số mẫu in: {item.quantity}</p>
                        <p className="text-xs text-gray-400">Màu sắc: Đen &nbsp;|&nbsp; Kích thước: L</p>
                        <p className="text-xs text-gray-400">Giới tính: Áo polo nam &nbsp;|&nbsp; Mặt in: 1 mặt</p>
                        <p className="md:hidden text-red-500 font-bold text-sm mt-2">{fmt(item.basePrice * item.quantity)}</p>
                      </div>
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-4 md:col-span-2 flex items-center justify-center gap-2">
                      <button onClick={() => updateQty(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-bold text-sm">−</button>
                      <span className="w-8 text-center text-sm font-semibold text-gray-700">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-300 flex items-center justify-center text-gray-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors font-bold text-sm">+</button>
                    </div>

                    {/* Đơn giá */}
                    <div className="col-span-4 md:col-span-2 text-right hidden md:block">
                      <span className="text-sm text-gray-600">{fmt(item.basePrice)}</span>
                    </div>

                    {/* Thành tiền + Xóa */}
                    <div className="col-span-4 md:col-span-2 text-right flex md:block items-center justify-end gap-3">
                      <span className="hidden md:block text-red-500 font-bold text-sm">{fmt(item.basePrice * item.quantity)}</span>
                      <button onClick={() => removeFromCart(item.productId)}
                        className="text-xs text-white bg-red-400 hover:bg-red-500 px-3 py-1.5 rounded-lg transition-colors font-medium">
                        Xóa
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Link to="/products" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
                Tiếp tục mua sắm
              </Link>
              <button
                onClick={() => {
                  if (window.confirm('Bạn có chắc muốn xóa toàn bộ sản phẩm trong giỏ hàng?')) {
                    clearCart();
                  }
                }}
                className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          </div>

          {/* ── Tổng tiền ── */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="border border-gray-200 rounded-2xl p-6 sticky top-28">
              <h2 className="font-bold text-gray-900 text-base mb-5">Thành tiền</h2>
              <div className="flex justify-between text-sm text-gray-600 pb-5 border-b border-gray-100">
                <span>Tổng tiền:</span>
                <span className="font-semibold text-gray-800">{fmt(total)}</span>
              </div>
              <div className="pt-5 space-y-3">
                <div className="text-2xl font-bold text-gray-900">{fmt(total)}</div>
                <button onClick={() => navigate('/checkout')}
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl text-sm transition-colors">
                  Thanh toán
                </button>
                <Link to="/products"
                  className="block w-full text-center border border-gray-300 text-gray-600 hover:bg-gray-50 font-medium py-3 rounded-xl text-sm transition-colors">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>

        </div>
      )}
    </PageLayout>
  );
};

export default Cart;
