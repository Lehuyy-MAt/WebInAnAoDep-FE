/**
 * Định dạng số tiền sang VNĐ.
 * Ví dụ: fmt(199000) => "199.000 đ"
 */
export const fmt = (price) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
    .format(price)
    .replace('₫', 'đ');
