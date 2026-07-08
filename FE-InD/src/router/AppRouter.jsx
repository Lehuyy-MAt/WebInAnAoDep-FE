import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ROLE_ADMIN, normalizeRole } from "../utils/Constants.jsx";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";
import ResetPassword from '../pages/auth/ResetPassword';
// 1. Import component ở đầu file
import UpdateProfile from '../pages/common/UpdateProfile';


import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminLayout from "../components/admin/AdminLayout.jsx";

import Dashboard from "../pages/admin/Dashboard.jsx";
import ProductList from "../pages/admin/ProductList.jsx";
import ProductForm from "../pages/admin/ProductForm.jsx";
import UserList from '../pages/admin/UserList';
import CategoryList from '../pages/admin/CategoryList.jsx';
import OrderList from '../pages/admin/OrderList';
import AdminReviewList from '../pages/admin/ReviewList.jsx';



import Home from '../pages/home/Home.jsx';
import Profile from '../pages/common/Profile.jsx';

import ProductDetail from '../pages/products/ProductDetail.jsx';
import Cart from '../pages/cart/Cart.jsx';
import Checkout from '../pages/cart/Checkout.jsx';
import Orders from '../pages/order/Orders.jsx';
import OrderDetail from '../pages/order/OrderDetail.jsx';
import CancelOrder from '../pages/order/CancelOrder.jsx';
import CartDrawer from '../components/layout/CartDrawer.jsx';
// Placeholder for home page (user page)
const HomePage = () => <div>Trang chủ dành cho User</div>;

const AppRouter = () => {
  const { auth } = useAuth();

  const getRedirectPath = () => {
    if (!auth) return "/login";
    if (normalizeRole(auth.role) === ROLE_ADMIN) return "/admin/dashboard";
    return "/";
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={!auth ? <Login /> : <Navigate to={getRedirectPath()} />} />
      <Route path="/register" element={!auth ? <Register /> : <Navigate to={getRedirectPath()} />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Admin Routes - Chỉ ADMIN mới truy cập được */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[ROLE_ADMIN]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductForm />} />
        <Route path="products/edit/:id" element={<ProductForm />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="users" element={<UserList />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="reviews" element={<AdminReviewList />} />


      </Route>

      {/* User Routes - Dành cho USER đăng nhập */}
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/profile/edit" element={<ProtectedRoute><UpdateProfile /></ProtectedRoute>} />
        <Route path="/productdetail" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/orders/detail" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
        <Route path="/orders/cancel" element={<ProtectedRoute><CancelOrder /></ProtectedRoute>} />

      {/* Unauthorized page */}
      <Route path="/unauthorized" element={<div>Bạn không có quyền truy cập trang này</div>} />

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={getRedirectPath()} />} />
    </Routes>
  );
};

export default AppRouter;