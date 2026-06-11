// src/services/api/UserApi.jsx
import AxiosClient from "./AxiosClient";

const UserApi = {
  getAll: (params) => {
    const { page = 0, size = 10, keyword = '', role = null } = params;
    // Bỏ /api ở đầu vì AxiosClient đã có baseURL = 'http://localhost:8080/api'
    let url = `/users/admin/list?page=${page}&size=${size}`;
    if (keyword) url += `&keyword=${keyword}`;
    if (role) url += `&role=${role}`;
    return AxiosClient.get(url);
  },

  getById: (id) => {
    return AxiosClient.get(`/users/admin/${id}`);
  },

  update: (id, data) => {
    return AxiosClient.put(`/users/admin/update/${id}`, data);
  },

  delete: (id) => {
    return AxiosClient.delete(`/users/admin/delete/${id}`);
  },

  toggleStatus: (id) => {
    return AxiosClient.put(`/users/admin/toggle-status/${id}`);
  },

  changeRole: (id, role) => {
    return AxiosClient.put(`/users/admin/change-role/${id}?role=${role}`);
  }
};

export default UserApi;