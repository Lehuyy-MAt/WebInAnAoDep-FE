import React from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { cartItems, isCartOpen, toggleCart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const fmt = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(price)
      .replace('₫', 'đ');

  const total = cartItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={toggleCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[360px] max-w-full bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">Giỏ hàng của bạn</h3>
          <button
            onClick={toggleCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Items */}
       {/* Items */}
<div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
  {cartItems.length === 0 ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: '#9ca3af',
        gap: '12px',
        padding: '60px 0'
      }}
    >
      <div
        style={{
          fontSize: '48px',
          lineHeight: '1'
        }}
      >
        🛒
      </div>

      <p style={{ fontSize: '14px' }}>
        Giỏ hàng trống
      </p>
    </div>
  ) : (
    cartItems.map((item, index) => (
      <div
        key={index}
        className="flex gap-3 items-start bg-gray-50 rounded-xl p-3"
      >
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-gray-200"
          />
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 line-clamp-1">
            {item.name}
          </p>

          <p className="text-xs text-gray-400 mt-0.5">
            Số lượng: {item.quantity}
          </p>

          <p className="text-indigo-600 font-bold text-sm mt-1">
            {fmt(item.basePrice * item.quantity)}
          </p>
        </div>

        <button
          onClick={() => removeFromCart(item.productId)}
          className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    ))
  )}
</div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="px-5 py-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tổng cộng</span>
              <span className="font-bold text-gray-800 text-base">{fmt(total)}</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
                  clearCart();
                }
              }}
              className="w-full border border-red-200 text-red-600 hover:bg-red-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Xóa tất cả
            </button>
            <button
              onClick={() => { toggleCart(); navigate('/cart'); }}
              className="w-full border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold py-2.5 rounded-xl text-sm transition-colors"
            >
              Xem giỏ hàng
            </button>
            <button
              onClick={() => { toggleCart(); navigate('/checkout'); }}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
            >
              Tiến hành thanh toán
            </button>
            <button
              onClick={toggleCart}
              className="w-full border border-gray-200 text-gray-500 hover:bg-gray-50 font-medium py-2.5 rounded-xl text-sm transition-colors"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;