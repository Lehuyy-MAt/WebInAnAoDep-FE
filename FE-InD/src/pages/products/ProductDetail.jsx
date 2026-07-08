import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ProductService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import ReviewList from '../../components/Review/ReviewList'; // 👈 THÊM

import logoInT from '../../assets/images/LOGOO.png'; 
// 1. Thêm import ảnh bảng size áo (đảm bảo bạn có file này trong thư mục)
import bangsizeao from '../../assets/images/bangsizeao.jpg'; 

const ProductDetail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get('id');
  const { cart, addToCart } = useCart();
  const { auth, logout } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('XS');
  const [printOption, setPrintOption] = useState('1mat');
  const [gender, setGender] = useState('Nam');
  const [uploadedText, setUploadedText] = useState('Anh yêu em <3');
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeImage, setActiveImage] = useState(undefined);

  const fmt = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price).replace('₫', 'đ');

  const sizeOptions = useMemo(() => {
    return product?.availableSizes?.split(',').map((s) => s.trim()).filter(Boolean) || ['XS', 'S', 'M', 'L', 'XL'];
  }, [product]);

  const colorOptions = useMemo(() => {
    return product?.availableColors?.split(',').map((c) => c.trim()).filter(Boolean) || ['White', 'Black', 'Gray', 'Navy'];
  }, [product]);

  const imageList = useMemo(() => {
    if (!product) return [];
    const images = product.images || [];
    const firstUrl = product.imageUrl || product.defaultImageUrl || product.image;
    const list = images.map((img) => img.imageUrl).filter(Boolean);
    if (firstUrl && !list.includes(firstUrl)) list.unshift(firstUrl);
    return list;
  }, [product]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setProduct(null);
      return;
    }

    setLoading(true);
    ProductService.detail(id)
      .then((res) => {
        setProduct(res);
        setActiveImage(res?.imageUrl || res?.defaultImageUrl || res?.image || undefined);
        setSelectedSize(res?.availableSizes?.split(',')[0]?.trim() || 'XS');
        setSelectedColor(res?.availableColors?.split(',')[0]?.trim() || 'white');
      })
      .catch((err) => {
        console.error('Lỗi lấy chi tiết sản phẩm:', err);
        setProduct(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const cartItem = {
      ...product,
      selectedColor,
      selectedSize,
      printOption,
      gender,
      uploadedText,
      uploadedImage: imageFile ? URL.createObjectURL(imageFile) : null,
    };
    addToCart(cartItem, qty);
    alert('Đã thêm sản phẩm vào giỏ hàng!');
  };

  const handleBuyNow = () => {
    if (!product) return;
    handleAddToCart();
    navigate('/cart');
  };

  const handleEditDesign = () => {
    alert('Kích hoạt trình chỉnh sửa thiết kế thành công!');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-sm text-slate-500">Đang tải chi tiết sản phẩm...</div>;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-slate-800">Không tìm thấy sản phẩm</h1>
        <p className="text-slate-500 mb-6">Xin lỗi, sản phẩm bạn yêu cầu hiện không tồn tại hoặc đã bị xóa.</p>
        <Link to="/" className="rounded-full bg-indigo-600 text-white px-6 py-3 hover:bg-indigo-700 transition">
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfdfd] font-sans min-h-screen text-[#2d3748] antialiased">
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-[#2d3a4b] text-white text-[12px] py-2 px-6 flex justify-between items-center relative font-light">
        <div className="mx-auto text-center opacity-95">
          Giải Pháp Tối Giản Cho Tủ Đồ Khó Chọn: <span className="font-normal text-white">Mặc Đẹp Mỗi Ngày Không Cần Suy Nghĩ</span>
        </div>
      </div>

      {/* 2. PREMIUM BRAND HEADER */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-10">
          <Link to="/" className="flex items-center flex-shrink-0 transition-opacity hover:opacity-90">
            <img src={logoInT} alt="IN.T Logo" className="h-11 md:h-12 w-auto object-contain" />
          </Link>

          <div className="flex-1 max-w-2xl relative hidden md:block">
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm... (Ấn Enter)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchTerm.trim() && navigate(`/?keyword=${encodeURIComponent(searchTerm)}`)}
              className="w-full pl-5 pr-12 py-2 h-10 bg-[#f8fafc] border border-slate-200/80 rounded-lg focus:outline-none focus:border-[#4f46e5] focus:bg-white text-sm"
            />
          </div>

          <div className="flex items-center gap-6 text-[13px] text-slate-600">
            {/* Cart Button */}
            <Link to="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors group">
              <span className="text-xl">🛒</span>
              {cart?.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white group-hover:scale-110 transition-transform">
                  {cart.length}
                </span>
              )}
            </Link>

            {auth ? (
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline">Chào, <span className="font-semibold">{auth.username || auth.email}</span></span>
                <button onClick={logout} className="text-red-500 hover:underline transition-colors">Đăng xuất</button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="hover:text-[#4f46e5] flex items-center gap-1.5 transition-colors">
                <span className="text-slate-400">👤</span>
                <span>Đăng nhập / Tài khoản</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. NAVIGATION SUBMENU */}
      <nav className="bg-white border-b border-slate-100 hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 text-[13px] font-medium h-11">
          <div onClick={() => navigate('/')} className="bg-[#ff5a36] text-white px-5 h-full flex items-center gap-2 cursor-pointer font-semibold rounded-t-sm">
            <span>🔶</span> Shop cá nhân hóa <span className="text-[8px]">▼</span>
          </div>
          <div className="flex gap-8 text-slate-500 pl-6">
            <Link to="/" className="hover:text-[#4f46e5] h-11 flex items-center">Trang chủ</Link>
            <Link to="/" className="hover:text-[#4f46e5] h-11 flex items-center">Sản phẩm</Link>
          </div>
        </div>
      </nav>

      {/* 4. BREADCRUMB */}
      <div className="bg-slate-50 border-b border-slate-100 py-3 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-2">
          <Link to="/" className="hover:text-slate-800">Trang chủ</Link>
          <span>&gt;</span>
          <span className="text-slate-400">{product.categoryName || 'Danh mục'}</span>
        </div>
      </div>

      {/* 5. MAIN PRODUCT LAYOUT */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-[#1e293b]">{product.name}</h1>
          <button
            onClick={() => navigate('/')}
            className="self-start md:self-auto bg-white border border-slate-300 text-slate-700 px-5 py-3 rounded-xl shadow-sm hover:bg-slate-50 transition"
          >
            Quay về trang chủ
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* CỘT TRÁI: HÌNH ẢNH & THUMBNAILS */}
          <div className="lg:col-span-5 space-y-4">
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white p-2 shadow-sm">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imageList.map((imgUrl, index) => (
                <button
                  key={`${imgUrl}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(imgUrl)}
                  className={`aspect-square rounded-lg overflow-hidden border transition ${activeImage === imgUrl ? 'border-indigo-500' : 'border-slate-200'} `}
                >
                  <img
                    src={imgUrl || undefined}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: KHỐI CẤU HÌNH CUSTOM & ĐẶT HÀNG */}
          <div className="lg:col-span-7 space-y-6 bg-white p-2 lg:p-4 rounded-xl">
            
            {/* Giá cả & Số lượng hàng đầu */}
            <div className="flex flex-wrap items-center justify-between border-b border-dashed border-slate-200 pb-5 gap-4">
              <div>
                <div className="text-3xl font-bold text-[#ff5a36]">{fmt(product.basePrice)}</div>
                <div className="text-xs text-slate-400 mt-1">{fmt(product.basePrice)} / sp</div>
                <div className="text-xs text-slate-500 mt-2">Danh mục: {product.categoryName || 'Không rõ'}</div>
                <div className="text-xs text-slate-500">Kho: {product.stockQuantity ?? 'N/A'}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-medium text-slate-500">Số lượng:</span>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-16 text-center border border-slate-300 py-1 px-1.5 rounded text-sm focus:outline-none focus:border-slate-500"
                />
                <button
                  onClick={handleBuyNow}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition"
                >
                  Mua ngay
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl shadow-lg transition"
                >
                  Thêm vào giỏ
                </button>
              </div>
            </div>

            {/* Thuộc tính Màu sắc */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Màu sắc</label>
              <div className="flex flex-wrap gap-2.5 items-center">
                {colorOptions.map((color) => {
                  const normalized = color.toLowerCase();
                  const bgClass = normalized === 'white'
                    ? 'bg-white border border-slate-300'
                    : normalized === 'black'
                    ? 'bg-black'
                    : normalized === 'pink'
                    ? 'bg-pink-300'
                    : normalized === 'yellow'
                    ? 'bg-yellow-400'
                    : normalized === 'blue'
                    ? 'bg-blue-500'
                    : normalized === 'gray'
                    ? 'bg-gray-400'
                    : normalized === 'red'
                    ? 'bg-red-600'
                    : 'bg-slate-300';

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-7 h-7 rounded-full ${bgClass} transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'hover:scale-105'}`}
                      title={color}
                    />
                  );
                })}
              </div>
            </div>

            {/* Thuộc tính Size */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Size</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              >
                {sizeOptions.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>

            {/* Thuộc tính Mặt in */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Mặt in</label>
              <select 
                value={printOption}
                onChange={(e) => setPrintOption(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="1mat">In 1 mặt</option>
                <option value="2mat">In 2 mặt</option>
              </select>
            </div>

            {/* Thuộc tính Giới tính */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Giới tính</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-slate-300 bg-white rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="Nam">Nam</option>
                <option value="Nu">Nữ</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            {/* Upload ảnh mẫu */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Upload ảnh</label>
              <div className="relative border border-slate-300 rounded-lg p-2.5 flex items-center justify-between text-xs bg-white text-slate-400">
                <span className="truncate max-w-[200px]">
                  {imageFile ? imageFile.name : 'Tải ảnh lên'}
                </span>
                <span className="text-slate-500">📤</span>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>

            {/* Nhập nội dung Chữ in */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 block">Chữ in</label>
              <input 
                type="text" 
                value={uploadedText}
                onChange={(e) => setUploadedText(e.target.value)}
                placeholder="Nhập nội dung chữ in..."
                className="w-full border border-slate-300 rounded-lg p-2.5 text-xs text-slate-700 focus:outline-none focus:border-slate-400"
              />
            </div>

            {/* Nút Chỉnh sửa thiết kế nhanh */}
            <div className="pt-2">
              <button 
                onClick={handleEditDesign}
                className="w-full sm:w-auto bg-[#10b981] hover:bg-[#059669] text-white text-xs font-medium px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <span>📝</span> Chỉnh sửa thiết kế
              </button>
            </div>

          </div>
        </div>

        {/* 6. THÔNG SỐ CHI TIẾT & MÔ TẢ SẢN PHẨM */}
        <section className="mt-16 max-w-4xl">
          <h2 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-200 pb-2">Mô tả sản phẩm</h2>
          <p className="text-sm text-slate-600 mb-6">{product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm text-xs">
            <table className="w-full text-left border-collapse">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50 w-1/3">Danh mục</td>
                  <td className="p-3.5 text-slate-700">{product.categoryName || 'Không rõ'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Trạng thái</td>
                  <td className="p-3.5 text-slate-700">{product.isActive ? 'Đang bán' : 'Tạm dừng'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Kích thước</td>
                  <td className="p-3.5 text-slate-700 leading-relaxed">
                    {product.availableSizes || 'XS, S, M, L, XL'}
                  </td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Chất liệu</td>
                  <td className="p-3.5 text-slate-700">{product.material || 'Chưa có thông tin'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Màu sắc</td>
                  <td className="p-3.5 text-slate-700">{product.availableColors || 'Không xác định'}</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Số lượng</td>
                  <td className="p-3.5 text-slate-700">{product.stockQuantity ?? 'Không giới hạn'}</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-500 bg-slate-50/50">Mô tả ngắn</td>
                  <td className="p-3.5 text-slate-700">{product.description || 'Chưa có mô tả cho sản phẩm này.'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. BẢNG SIZE ÁO & ĐẶC ĐIỂM CHẤT LIỆU */}
        <section className="mt-10 max-w-4xl bg-white border border-slate-200 rounded-xl p-5 shadow-sm text-[13px] leading-relaxed space-y-6">
          <div className="bg-[#fffdf9] border border-amber-100 rounded-xl p-6 text-center space-y-4">
            <h3 className="text-xl font-extrabold text-amber-900 tracking-tight">BẢNG SIZE ÁO THUN COTTON</h3>
            <p className="text-xs text-amber-700/80">Vui lòng đối chiếu Chiều cao & Cân nặng để chọn kích cỡ chính xác nhất</p>
            
            {/* 2. CHÈN ẢNH BẢNG SIZE VÀO ĐÂY */}
            <div className="w-full flex justify-center mt-4">
              <img 
                src={bangsizeao} 
                alt="Bảng size áo thun cotton" 
                className="max-w-full h-auto rounded-lg shadow-sm border border-slate-100"
              />
            </div>

            {/* Đã tạm ẩn bảng HTML cũ đi, bạn có thể xóa hẳn nếu muốn */}
            {/* <div className="overflow-x-auto">
              <table className="w-full text-center border-collapse text-xs mt-2 bg-white rounded-lg overflow-hidden shadow-sm">
                ... (bảng cũ) ...
              </table>
            </div> */}
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <h4 className="font-bold text-blue-600 text-sm">Đặc điểm vải Cotton của áo</h4>
              <p className="text-slate-600 text-xs mt-1">- Vải 100% Cotton mang lại cảm giác thoáng mát, thoải mái cho người mặc bởi khả năng hút ẩm và độ thấm hút tốt.</p>
              <p className="text-slate-600 text-xs">- Dễ in hình và hình in sắc nét với độ bền màu cao.</p>
            </div>

            <div>
              <h4 className="font-bold text-blue-600 text-sm">Áp dụng công nghệ in: Phương pháp in Decal màu</h4>
              <p className="text-slate-600 text-xs mt-1">Đặc điểm phương pháp in Decal màu: Sử dụng phương pháp ép nhiệt phẳng để Decal bám dính hoàn toàn trên bề mặt áo:</p>
              <p className="text-slate-600 text-xs">- Thiết kế được in trên giấy Decal và sẽ được cắt sát theo mép viền của thiết kế.</p>
              <p className="text-slate-600 text-xs">- Có thể in rõ cả đường nét, chi tiết và màu sắc của thiết kế trên áo.</p>
              <p className="text-slate-600 text-xs">- Áp dụng để in trên tất cả các loại màu của Áo thun.</p>
            </div>
          </div>
        </section>

        {/* ĐÁNH GIÁ SẢN PHẨM */}
        <ReviewList productId={product.id} productName={product.name} />
      </main>

      {/* FOOTER */}
      <footer className="bg-[#111827] text-slate-400 py-12 border-t border-slate-900 text-xs mt-20">
        <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-slate-800/60 text-center text-slate-600 text-[11px]">
          © 2026 IN.T - Thời Trang & In Áo Theo Yêu Cầu. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;