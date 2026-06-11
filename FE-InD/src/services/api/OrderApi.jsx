// src/services/api/OrderApi.jsx
import AxiosClient from "./AxiosClient";

const OrderApi = {
  // Tạo đơn hàng mới
  create: (data) => {
    console.log("📡 Calling POST /orders", data);
    return AxiosClient.post("/orders", data); // 👈 Bỏ /api
  },

  // src/services/api/OrderApi.jsx
  getMyOrders: (userId) => {
    console.log("📡 Getting orders for user:", userId);
    return AxiosClient.get(`/orders/user/${userId}`);
  },

  // Lấy chi tiết đơn hàng
  getById: (id) => {
    console.log("📡 Calling GET /orders/", id);
    return AxiosClient.get(`/orders/${id}`); // 👈 Bỏ /api
  },

  // Lấy tất cả đơn hàng (admin)
  getAllOrders: () => {
    console.log("📡 Calling GET /orders");
    return AxiosClient.get("/orders"); // 👈 Bỏ /api
  },

  // Cập nhật trạng thái (admin)
  updateStatus: (id, status) => {
    console.log("📡 Calling PUT /orders/", id, "/status?status=", status);
    return AxiosClient.put(`/orders/${id}/status?status=${status}`); // 👈 Bỏ /api
  },

  // Hủy đơn hàng
  cancel: (id) => {
    console.log("📡 Calling PUT /orders/", id, "/cancel");
    return AxiosClient.put(`/orders/${id}/cancel`); // 👈 Bỏ /api
  },

  checkPaymentStatus: (orderId) => {
    return AxiosClient.get(`/orders/${orderId}/payment-status`);
  },
};

export default OrderApi;
