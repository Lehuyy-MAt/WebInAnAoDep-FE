const PromoBanner = ({
  text = 'Giải Pháp Tối Giản Cho Tủ Đồ Khó Chọn: Mặc Đẹp Mỗi Ngày Không Cần Suy Nghĩ!',
  phone = '0399599188',
}) => (
  <div className="bg-gray-800 text-white text-center text-xs py-2 px-4">
    {text}
    <a
      href={`tel:${phone}`}
      className="ml-4 bg-red-500 hover:bg-red-600 text-white px-3 py-0.5 rounded text-xs font-semibold transition-colors inline-block"
    >
      {phone}
    </a>
  </div>
);

export default PromoBanner;
