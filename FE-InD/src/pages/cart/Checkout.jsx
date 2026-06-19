import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import OrderApi from '../../services/api/OrderApi';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';

const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price).replace('₫', 'đ');

const STEPS = ['Giỏ hàng', 'Thanh toán', 'Hoàn tất'];

const Stepper = ({ current }) => (
  <div className="flex items-center justify-center mb-8">
    {STEPS.map((label, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all
              ${done ? 'bg-indigo-600 border-indigo-600 text-white' : active ? 'bg-white border-indigo-600 text-indigo-600' : 'bg-white border-gray-300 text-gray-400'}`}>
              {done ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 ${active ? 'text-indigo-600 font-semibold' : done ? 'text-indigo-400' : 'text-gray-400'}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`h-0.5 w-24 mx-1 mb-5 ${done ? 'bg-indigo-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

const CheckoutForm = ({ cartItems, total, onPlaceOrder, user }) => {
  const [form, setForm] = useState({ 
    name: user?.fullName || '', 
    note: '', 
    email: user?.email || '', 
    phone: user?.phoneNumber || '', 
    city: '', 
    district: '', 
    address: user?.address || '' 
  });
  const [delivery, setDelivery] = useState('giao');
  const [payment, setPayment] = useState('cod');

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const isHanoiCity = (cityStr) => {
    if (!cityStr) return false;
    const cleaned = cityStr
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .trim();
    return cleaned.includes('ha noi') || cleaned.includes('hanoi');
  };

  const shippingFee = delivery === 'nhan' ? 0 : (isHanoiCity(form.city) ? 0 : 20000);
  const grandTotal = total + shippingFee;

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email) {
      alert('Vui lòng điền đầy đủ họ tên, email và số điện thoại!');
      return;
    }
    if (delivery === 'giao' && (!form.city.trim() || !form.district.trim() || !form.address.trim())) {
      alert('Vui lòng điền đầy đủ địa chỉ giao hàng (Tỉnh/TP, Quận/Huyện, Địa chỉ cụ thể)!');
      return;
    }
    onPlaceOrder({ form, delivery, payment });
  };

  return (
    <>
      <Stepper current={1} />

      {cartItems.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Giỏ hàng trống.</p>
      ) : cartItems.map((item, i) => (
        <div key={i} className="flex gap-4 items-start border border-slate-100 rounded-xl p-4 mb-3 bg-white shadow-sm">
          {item.imageUrl && (
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-lg object-cover border border-gray-200 flex-shrink-0" />
          )}
          <div className="flex-1 text-sm">
            <p className="font-semibold">{item.name}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Màu: {item.color || 'Đen'} · Size: {item.size || 'L'}
            </p>
          </div>
          <div className="text-right text-sm">
            <p className="font-bold text-indigo-600">{fmt(item.basePrice || item.price)}</p>
            <p className="text-xs text-gray-400 mt-1">SL: {item.quantity}</p>
          </div>
        </div>
      ))}

      <div className="bg-white border border-slate-100 rounded-xl p-5 mt-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Thông tin người dùng</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'name', label: 'Tên người nhận *', placeholder: 'Nhập họ và tên' },
            { name: 'note', label: 'Ghi chú', placeholder: 'Ghi chú đơn hàng...' },
            { name: 'email', label: 'Email *', placeholder: 'Email của bạn', type: 'email' },
            { name: 'phone', label: 'Số điện thoại *', placeholder: 'Số điện thoại' },
          ].map(f => (
            <div key={f.name}>
              <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input name={f.name} type={f.type || 'text'} value={form[f.name]}
                onChange={handleChange} placeholder={f.placeholder}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-5 mt-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-3">Hình thức nhận hàng</h3>
        <div className="flex gap-4 text-sm mb-4">
          {[{ val: 'giao', label: 'Giao hàng tận nơi' }, { val: 'nhan', label: 'Nhận tại cửa hàng' }].map(o => (
            <label key={o.val} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="delivery" value={o.val} checked={delivery === o.val}
                onChange={() => setDelivery(o.val)} className="accent-indigo-600" />
              {o.label}
            </label>
          ))}
        </div>
        {delivery === 'giao' && (
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: 'city', label: 'Tỉnh/TP', placeholder: 'Tỉnh / Thành phố' },
              { name: 'district', label: 'Quận/Huyện', placeholder: 'Quận / Huyện' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                <input name={f.name} value={form[f.name]} onChange={handleChange}
                  placeholder={f.placeholder}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="text-xs text-gray-500 mb-1 block">Địa chỉ cụ thể</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Số nhà, đường, tổ..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400" />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-5 mt-4 shadow-sm">
        <h3 className="font-semibold text-sm mb-4">Phương thức thanh toán</h3>
        <div className="flex flex-wrap gap-3">
          {[
            { val: 'cod', label: '💵 Tiền mặt khi nhận hàng' },
            { val: 'qr', label: '📱 Quét mã QR' },
          ].map(o => (
            <label key={o.val} className={`flex items-center gap-2 cursor-pointer border rounded-xl px-4 py-3 text-sm transition-all
              ${payment === o.val ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'}`}>
              <input type="radio" name="payment" value={o.val} checked={payment === o.val}
                onChange={() => setPayment(o.val)} className="accent-indigo-600" />
              {o.label}
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-xl p-5 mt-4 shadow-sm">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-500">Tạm tính</span><span className="font-semibold">{fmt(total)}</span>
        </div>
        <div className="flex justify-between text-sm mb-3">
          <span className="text-gray-500">Phí vận chuyển</span>
          <span className={shippingFee === 0 ? "text-green-600 font-medium" : "text-gray-800 font-medium"}>
            {shippingFee === 0 ? 'Miễn phí' : fmt(shippingFee)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-3">
          <span>Tổng cộng</span><span className="text-indigo-600 text-lg">{fmt(grandTotal)}</span>
        </div>
      </div>

      <button onClick={handleSubmit}
        className="w-full mt-5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-xl text-sm transition-colors shadow-md">
        Đặt hàng
      </button>
    </>
  );
};

const QRStep = ({ total, orderInfo, onConfirm, onBack }) => {
  const [countdown, setCountdown] = useState(10);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("✅ QRStep mounted, orderId:", orderInfo?.id);
    console.log("✅ OrderInfo:", orderInfo);

    // Hàm kiểm tra thanh toán
    const checkPayment = async () => {
      if (!orderInfo?.id) {
        console.log("❌ No orderId yet");
        return;
      }
      
      try {
        console.log("🔍 Checking payment for order:", orderInfo.id);
        const response = await OrderApi.checkPaymentStatus(orderInfo.id);
        console.log("📡 Payment status response:", response);
        
        if (response.paid === true) {
          console.log("✅ Payment confirmed! Redirecting to success...");
          setIsChecking(false);
          onConfirm();
        }
      } catch (error) {
        console.error("❌ Check payment error:", error);
      }
    };

    // Gọi ngay lập tức
    checkPayment();
    
    // Gọi mỗi 3 giây
    const interval = setInterval(checkPayment, 3000);
    
    // Timeout 10 giây để test (nếu chưa thanh toán thì vẫn chuyển)
    const timeout = setTimeout(() => {
      console.log("⏰ Timeout after 10 seconds, auto confirming...");
      onConfirm();
    }, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [orderInfo?.id]);

  return (
    <>
      <Stepper current={1} />
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-shrink-0 flex flex-col items-center">
            <div className="w-44 h-44 border-2 border-indigo-200 rounded-xl flex items-center justify-center bg-white shadow-inner overflow-hidden">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ORDER_ID:${orderInfo?.orderNumber || 'DH000000'},AMOUNT:${total}`} 
                alt="Mã QR thanh toán" 
                className="w-full h-full object-contain p-2"
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">Quét bằng ứng dụng ngân hàng</p>
          </div>

          <div className="flex-1 space-y-3 text-sm">
            <h3 className="font-semibold text-base text-gray-700">Thông tin chuyển khoản</h3>
            <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between"><span className="text-gray-500">Chủ tài khoản:</span><span>Vũ Tuấn Anh</span></div>
              <div className="flex justify-between"><span className="text-gray-500">STK:</span><span className="font-mono font-semibold text-indigo-700">0236871151</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ngân hàng:</span><span>MB Bank</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Số tiền:</span><span className="font-bold text-indigo-600 text-base">{fmt(total)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Nội dung CK:</span><span className="font-mono font-semibold text-green-700">{orderInfo?.orderNumber || 'DH000000'}</span></div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
              <p className="font-semibold">⚠️ Lưu ý:</p>
              <p>• Nhập đúng nội dung chuyển khoản để đơn hàng được xử lý tự động.</p>
              <p>• Hotline hỗ trợ: <span className="font-bold">0399.599.188</span></p>
            </div>

            {/* Hiển thị trạng thái */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-500">
                ⏳ Đang chờ thanh toán...
              </p>
              <p className="text-xs text-gray-400">
                Tự động xác nhận sau 10 giây
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div className="bg-green-500 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={onBack} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm hover:bg-gray-50">
            ← Quay lại
          </button>
        </div>
      </div>
    </>
  );
};

const ATMStep = ({ total, orderInfo, onConfirm, onBack }) => {
  const [selectedBank, setSelectedBank] = useState(null);
  const banks = [
    { id: 'vcb', name: 'Vietcombank', color: '#006B32' },
    { id: 'mb', name: 'MB Bank', color: '#0055A0' },
    { id: 'tcb', name: 'Techcombank', color: '#DC241F' },
  ];

  return (
    <>
      <Stepper current={1} />
      <div className="grid md:grid-cols-5 gap-4">
        <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm p-4">
          <h3 className="font-semibold text-sm mb-3">Chọn ngân hàng</h3>
          <div className="space-y-2">
            {banks.map(bank => (
              <button key={bank.id} onClick={() => setSelectedBank(bank)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                  ${selectedBank?.id === bank.id ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-300'}`}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: bank.color }}>{bank.name.slice(0, 2)}</span>
                {bank.name}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-3 bg-white border border-slate-100 rounded-2xl shadow-sm p-5">
          <h3 className="font-semibold text-sm mb-4">{selectedBank ? `Thanh toán qua ${selectedBank.name}` : 'Vui lòng chọn ngân hàng'}</h3>
          {!selectedBank ? (
            <div className="text-center py-10 text-gray-400 text-sm">← Chọn ngân hàng bên trái</div>
          ) : (
            <>
              <div className="bg-indigo-50 rounded-xl p-4 text-sm mb-4">
                <div className="flex justify-between"><span className="text-gray-500">Số tiền:</span><span className="font-bold text-indigo-600">{fmt(total)}</span></div>
                <div className="flex justify-between mt-2"><span className="text-gray-500">Mã đơn:</span><span className="font-mono font-semibold">{orderInfo?.orderNumber}</span></div>
              </div>
              <div className="mb-4">
                <label className="text-xs text-gray-500 mb-1 block">Số thẻ / Số tài khoản</label>
                <input placeholder="Nhập số thẻ" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={onBack} className="flex-1 border border-gray-200 text-gray-600 font-medium py-3 rounded-xl text-sm">Quay lại</button>
                <button onClick={onConfirm} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl text-sm">Xác nhận</button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

const SuccessStep = ({ navigate, orderId }) => (
  <>
    <Stepper current={2} />
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
        <span className="text-4xl">✅</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Đặt hàng thành công!</h2>
      <p className="text-gray-500 text-sm mb-8">Cảm ơn bạn đã mua hàng! Đơn hàng đang được xử lý.</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button onClick={() => navigate(`/orders/detail?id=${orderId || ''}`)} className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl">Xem chi tiết đơn hàng</button>
        <button onClick={() => navigate('/')} className="w-full border border-gray-200 text-gray-600 font-medium py-3 rounded-xl">Tiếp tục mua sắm</button>
      </div>
    </div>
  </>
);

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart } = useCart();
  const { auth: user } = useAuth(); // Lấy user trực tiếp từ AuthContext
  const [step, setStep] = useState('form');
  const [orderInfo, setOrderInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = cartItems.reduce((sum, i) => sum + (i.basePrice || i.price) * i.quantity, 0);

  useEffect(() => {
    if (cartItems.length === 0 && step === 'form') navigate('/cart');
  }, [cartItems, navigate, step]);

  const handlePlaceOrder = async ({ form, delivery, payment }) => {
    if (!user?.id) {
      alert("Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.");
      return;
    }
    setLoading(true);
    try {
      const orderData = {
        userId: user.id,
        receiverName: form.name,
        receiverPhone: form.phone,
        shippingAddress: delivery === 'giao' ? `${form.address}, ${form.district}, ${form.city}` : 'Nhận tại cửa hàng',
        city: form.city || 'Hà Nội',
        paymentMethod: payment === 'cod' ? 'COD' : 'QR_CODE',
        note: form.note || '',
        discountCode: null,
        items: cartItems.map(item => ({
          productId: item.productId || item.id,
          designId: item.designId || null,
          size: item.size || 'M',
          color: item.color || 'Đen',
          quantity: item.quantity,
          unitPrice: item.basePrice || item.price,
          note: ''
        }))
      };

      const response = await OrderApi.create(orderData);
      
      setOrderInfo({
        id: response.id,
        orderNumber: response.orderNumber,
        total: response.totalAmount,
        status: response.status
      });

      if (payment === 'qr') setStep('qr');
      else { clearCart?.(); setStep('success'); }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Đặt hàng thất bại');
    } finally { setLoading(false); }
  };

  const handleConfirmPayment = async () => {
    setLoading(true);
    try {
      if (orderInfo?.id) await OrderApi.updateStatus(orderInfo.id, 'confirmed');
      clearCart?.();
      setStep('success');
    } catch (error) {
      alert('Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <h1 className="text-xl font-bold mb-6">Thanh toán</h1>
      {step === 'qr' && <QRStep total={orderInfo?.total || total} orderInfo={orderInfo} onConfirm={handleConfirmPayment} onBack={() => setStep('form')} />}
      {step === 'success' && <SuccessStep navigate={navigate} orderId={orderInfo?.id} />}
      {step === 'form' && <CheckoutForm cartItems={cartItems} total={total} onPlaceOrder={handlePlaceOrder} user={user} />}
    </PageLayout>
  );
};

export default Checkout;