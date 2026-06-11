// src/services/api/ProductApi.jsx
import AxiosClient from "./AxiosClient";

const ProductApi = {
  // Lấy danh sách cho admin
  getAllForAdmin: (params) => {
    const { page = 0, size = 10, keyword = '', isActive = null, categoryId = null } = params;
    // Bỏ /api ở đầu
    let url = `/products/admin?page=${page}&size=${size}`;
    if (keyword) url += `&keyword=${keyword}`;
    if (isActive !== null) url += `&isActive=${isActive}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    return AxiosClient.get(url);
  },

  getById: (id) => {
    return AxiosClient.get(`/products/${id}`);
  },

  create: (data) => {
    return AxiosClient.post('/products', data);
  },

  update: (id, data) => {
    return AxiosClient.put(`/products/${id}`, data);
  },

  delete: (id) => {
    return AxiosClient.delete(`/products/${id}`);
  },

  toggleActive: (id) => {
    return AxiosClient.patch(`/products/${id}/toggle-active`);
  },

  // Ảnh sản phẩm
  getImages: (productId) => {
    return AxiosClient.get(`/products/${productId}/images`);
  },

  addImageByUrl: (productId, data) => {
    return AxiosClient.post(`/products/${productId}/images`, data);
  },

  uploadImageFile: (productId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return AxiosClient.post(`/products/${productId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  deleteImage: (productId, imageId) => {
    return AxiosClient.delete(`/products/${productId}/images/${imageId}`);
  }
};

export default ProductApi;