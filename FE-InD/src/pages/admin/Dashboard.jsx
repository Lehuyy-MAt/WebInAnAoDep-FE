// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Button, Space, Tag } from 'antd';
import { ShoppingOutlined, DollarOutlined, UserOutlined, ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductApi from '../../services/api/ProductApi';
import CategoryApi from '../../services/api/CategoryApi';
import OrderApi from '../../services/api/OrderApi';
import UserApi from '../../services/api/UserApi';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
    fetchRecentProducts();
    fetchRecentOrders();
  }, []);

  const fetchStats = async () => {
    try {
      // Gọi đồng thời các API để lấy số lượng tổng quát
      const [prodRes, catRes, orderRes, userRes] = await Promise.all([
        ProductApi.getAllForAdmin({ page: 0, size: 1 }),
        CategoryApi.getAll(),
        OrderApi.getAllOrders(),
        UserApi.getAll({ page: 0, size: 1 })
      ]);

      const orders = Array.isArray(orderRes) ? orderRes : (orderRes.items || orderRes.content || []);
      const totalRevenue = orders.reduce((sum, order) => 
        order.status === 'delivered' ? sum + (order.totalAmount || 0) : sum, 0
      );

      setStats({
        totalProducts: prodRes.totalItems || 0,
        totalCategories: Array.isArray(catRes) ? catRes.length : 0,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        totalUsers: userRes.totalItems || 0
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRecentProducts = async () => {
    try {
      const response = await ProductApi.getAllForAdmin({ page: 0, size: 5 });
      // SỬA: dùng items
      setRecentProducts(response.items || []);
    } catch (error) {
      console.error('Failed to fetch recent products:', error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const response = await OrderApi.getAllOrders();
      const orders = Array.isArray(response) ? response : (response.items || response.content || []);
      setRecentOrders(orders.slice(0, 5)); // Lấy 5 đơn mới nhất
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    }
  };

  const productColumns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
    { title: 'Tên sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Giá bán', dataIndex: 'basePrice', key: 'basePrice', render: (price) => `${price?.toLocaleString()}đ` },
    { title: 'Tồn kho', dataIndex: 'stockQuantity', key: 'stockQuantity' },
  ];

  const orderColumns = [
    { title: 'Mã đơn', dataIndex: 'orderNumber', key: 'orderNumber', render: (text) => <Typography.Text code>{text}</Typography.Text> },
    { title: 'Khách hàng', dataIndex: 'receiverName', key: 'receiverName' },
    { title: 'Tổng tiền', dataIndex: 'totalAmount', key: 'totalAmount', render: (val) => `${val?.toLocaleString()}đ` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => {
        const colors = { pending: 'orange', delivered: 'green', cancelled: 'red', confirmed: 'blue' };
        return <Tag color={colors[status] || 'default'}>{status?.toUpperCase()}</Tag>
      }
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[16, 16]} style={{ marginTop: 20, marginBottom: 30 }}>
        {[
          { title: 'Sản phẩm', value: stats.totalProducts, icon: <ShoppingOutlined />, color: '#3f51b5', path: '/admin/products' },
          { title: 'Đơn hàng', value: stats.totalOrders, icon: <ShoppingCartOutlined />, color: '#ff9800', path: '/admin/orders' },
          { title: 'Danh mục', value: stats.totalCategories, icon: <AppstoreOutlined />, color: '#4caf50', path: '/admin/categories' },
          { title: 'Doanh thu', value: stats.totalRevenue, icon: <DollarOutlined />, color: '#f44336', suffix: 'đ', path: '/admin/orders' },
          { title: 'Người dùng', value: stats.totalUsers, icon: <UserOutlined />, color: '#00bcd4', path: '/admin/users' },
        ].map((item, idx) => (
          <Col xs={24} sm={12} md={8} lg={4} key={idx}>
            <Card 
              hoverable 
              onClick={() => navigate(item.path)}
              style={{ borderLeft: `4px solid ${item.color}` }}
            >
              <Statistic 
                title={item.title} 
                value={item.value} 
                prefix={item.icon} 
                suffix={item.suffix}
                valueStyle={{ color: item.color, fontSize: '20px' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card 
            title="Sản phẩm mới nhất" 
            extra={<Button type="link" onClick={() => navigate('/admin/products')}>Xem tất cả</Button>}
          >
            <Table 
              columns={productColumns} 
              dataSource={recentProducts} 
              rowKey="id" 
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có sản phẩm nào' }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card 
            title="Đơn hàng gần đây" 
            extra={<Button type="link" onClick={() => navigate('/admin/orders')}>Xem tất cả</Button>}
          >
            <Table 
              columns={orderColumns} 
              dataSource={recentOrders} 
              rowKey="id" 
              pagination={false}
              size="small"
              locale={{ emptyText: 'Chưa có đơn hàng nào' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;