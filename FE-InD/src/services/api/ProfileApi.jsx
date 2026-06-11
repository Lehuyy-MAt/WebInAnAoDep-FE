// src/services/api/ProfileApi.jsx
import AxiosClient from "./AxiosClient";

const ProfileApi = {
  getProfile: () => {
    return AxiosClient.get('/users/profile');
  },

  updateProfile: (data) => {
    return AxiosClient.put('/users/profile', data);
  },

  changePassword: (data) => {
    return AxiosClient.post('/users/change-password', data);
  },

  uploadAvatar: (formData) => {
    return AxiosClient.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};

export default ProfileApi;