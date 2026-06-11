import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography, Badge, Button, Input } from 'antd';
import { UserOutlined, ShoppingCartOutlined, LogoutOutlined, HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import logo from '../../assets/images/LOGOO.png';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Header = () => {
  const { auth, isAuthenticated, logout } = useAuth();
  const { totalCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSearch = (value) => {
    if (value) navigate(`/?keyword=${encodeURIComponent(value)}`);
    else navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/profile">Hồ sơ cá nhân</Link>,
    },
    {
      key: 'orders',
      icon: <HistoryOutlined />,
      label: <Link to="/orders">Đơn hàng của tôi</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
      danger: true,
    },
  ];

  return (
    <AntHeader 
      style={{ 
        background: 'rgba(255, 255, 255, 0.95)', 
        padding: '0 24px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        height: '70px',
        backdropFilter: 'blur(4px)'
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="InD Logo" style={{ height: '45px', objectFit: 'contain' }} />
      </Link>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 20px' }} className="hidden md:block">
        <Input.Search
          placeholder="Tìm sản phẩm bạn cần..."
          allowClear
          enterButton
          onSearch={handleSearch}
          defaultValue={searchParams.get('keyword') || ''}
        />
      </div>

      {/* Actions */}
      <Space size="middle">
        <Link to="/cart">
          <Badge count={totalCount} size="small" offset={[2, 0]}>
            <ShoppingCartOutlined style={{ fontSize: '22px', color: '#1f1f1f' }} />
          </Badge>
        </Link>

        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
            <Space style={{ cursor: 'pointer', marginLeft: 8 }}>
              <Avatar src={auth?.avatarUrl} icon={<UserOutlined />} style={{ border: '1px solid #f0f0f0' }} />
              <Text strong className="hidden sm:inline">Xin chào, {auth?.fullName || 'Thành viên'}</Text>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button type="text" onClick={() => navigate('/login')}>Đăng nhập</Button>
            <Button type="primary" onClick={() => navigate('/register')} className="bg-indigo-600 rounded-lg">Đăng ký</Button>
          </Space>
        )}
      </Space>
    </AntHeader>
  );
};

export default Header;