import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { cartItems, toggleCart } = useCart();
  const navigate = useNavigate();
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/products?keyword=${encodeURIComponent(e.target.value)}`);
    }
  };

  return (
    <header>
      <div className="nav-container">
        <Link to="/" className="logo">IN.T</Link>
        <nav className="nav-menu">
          <Link to="/">Trang chủ</Link>
          <Link to="/products">Sản phẩm</Link>
        </nav>
        <div className="nav-actions">
          <input 
            type="text" 
            placeholder="Tìm sản phẩm..." 
            onKeyDown={handleSearch} 
          />
          <button className="cart-btn-nav" onClick={toggleCart}>
            <i className="fas fa-shopping-cart"></i>
            <span className="cart-badge">{totalCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;