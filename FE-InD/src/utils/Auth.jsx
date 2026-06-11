// src/utils/Auth.jsx
export const getAuth = () => {
  const token = localStorage.getItem('accessToken');
  const userStr = localStorage.getItem('user');
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      return { token, user };
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const setAuth = (token, user) => {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!getAuth();
};

export const getUser = () => {
  const auth = getAuth();
  return auth ? auth.user : null;
};

export const getToken = () => {
  const auth = getAuth();
  return auth ? auth.token : null;
};