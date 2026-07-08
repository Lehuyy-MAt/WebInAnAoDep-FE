import AxiosClient from "./AxiosClient";

const ReviewApi = {
  // Lấy đánh giá theo sản phẩm
  getReviewsByProduct: (productId) => {
    return AxiosClient.get(`/reviews/product/${productId}`);
  },

  // Lấy đánh giá theo user
  getReviewsByUser: (userId) => {
    return AxiosClient.get(`/reviews/user/${userId}`);
  },

  // Admin: Lấy tất cả đánh giá
  getAllReviews: () => {
    return AxiosClient.get('/reviews/admin/all');
  },

  // Admin: Lấy đánh giá chờ duyệt
  getPendingReviews: () => {
    return AxiosClient.get('/reviews/admin/pending');
  },

  // Tạo đánh giá mới
  createReview: (data, userId) => {
    return AxiosClient.post(`/reviews?userId=${userId}`, data);
  },

  // Xóa đánh giá
  deleteReview: (reviewId) => {
    return AxiosClient.delete(`/reviews/${reviewId}`);
  },

  // Admin: Duyệt đánh giá
  approveReview: (reviewId) => {
    return AxiosClient.put(`/reviews/${reviewId}/approve`);
  },

  // Lấy thống kê đánh giá
  getProductRating: (productId) => {
    return AxiosClient.get(`/reviews/product/${productId}/rating`);
  }
};

export default ReviewApi;
