// src/App.jsx
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from './context/CartContext.jsx';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppRouter from './router/AppRouter.jsx';
import ScrollToTop from './pages/common/ScrollToTop.jsx';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        {/* Đã xóa <BrowserRouter> ở đây */}
        <ScrollToTop />
        <AppRouter />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;