import React, { createContext, useState, useContext } from 'react';
import * as AuthApi from '../services/api/AuthApi';
import { getAuth, setAuth, clearAuth } from '../utils/Auth';
import { ROLE_ADMIN, normalizeRole } from '../utils/Constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(() => {
    const authData = getAuth();
    if (!authData) return null;
    return {
      ...authData.user,
      role: normalizeRole(authData.user.role),
    };
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    try {
        const response = await AuthApi.login({ email, password });
        console.log("1. Raw login response:", response);
        
        // Lấy dữ liệu từ response
        const token = response.token;
        const userEmail = response.email || response.user?.email || response.data?.email;
        const fullName = response.fullName || response.user?.fullName || response.data?.fullName;
        const rawRole = response.role || response.user?.role || response.data?.role;
        // Trích xuất thêm số điện thoại và địa chỉ
        const phoneNumber = response.phoneNumber || response.user?.phoneNumber || response.data?.phoneNumber || response.phone || response.user?.phone;
        const address = response.address || response.user?.address || response.data?.address;
        
        // Kiểm tra tất cả các khả năng ID có thể nằm trong response (thêm response.data.id)
        const userId = response.userId || response.id || response.user?.id || response.user?.userId || response.data?.id || response.data?.userId;
        
        console.log("2. Extracted - token:", token);
        console.log("3. Extracted - email:", userEmail);
        console.log("4. Extracted - role:", rawRole);
        console.log("4.2. Extracted - phone:", phoneNumber);
        
        const normalizedRole = normalizeRole(rawRole);
        const user = { 
          id: userId, 
          email: userEmail, 
          fullName, 
          role: normalizedRole, 
          phoneNumber, 
          address 
        }; 
        
        console.log("5. User object:", user);
        
        if (token) {
            setAuth(token, user);
            console.log("6. setAuth called - token saved");
        } else {
            console.error("No token in response!");
        }
        
        setAuthState(user);
        console.log("7. Auth state updated");
        
        // Kiểm tra localStorage sau khi lưu
        console.log("8. localStorage accessToken:", localStorage.getItem('accessToken'));
        console.log("9. localStorage user:", localStorage.getItem('user'));
        
        return user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

const register = async (userData) => {
    const response = await AuthApi.register(userData);
    // Response trả về { token, email, fullName, role }
    // Không cần lưu token ở đây, chỉ cần đăng ký xong chuyển sang login
    return response;
};

  const forgotPassword = async (email) => {
    const response = await AuthApi.forgotPassword({ email });
    return response;
  };

  const resetPassword = async (token, newPassword) => {
    const response = await AuthApi.resetPassword({ token, newPassword });
    return response;
  };

  const logout = () => {
    clearAuth();
    setAuthState(null);
  };

  const updateAuth = (userData) => {
    const updatedUser = { ...auth, ...userData };
    // Lưu vào localStorage để không bị mất khi F5 trang
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      setAuth(accessToken, updatedUser);
    }
    // Cập nhật state trong React
    setAuthState(updatedUser);
  };

  const value = {
    auth,
    loading,
    login,
    register,
    updateAuth,
    forgotPassword,
    resetPassword,
    logout,
    isAdmin: auth?.role === ROLE_ADMIN,
    isAuthenticated: !!auth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};