import React, { useState, useEffect } from 'react';
import { Layout, theme } from 'antd';
import AdminHeader from './AdminHeader';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    // Nhúng Google Fonts vào head để hiển thị tiếng Việt chuẩn
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Ép phông chữ cho toàn bộ ứng dụng, kể cả antd components
    const style = document.createElement('style');
    style.innerHTML = `
      * { font-family: 'Be Vietnam Pro', sans-serif !important; }
      .ant-typography, .ant-btn, .ant-menu, .ant-table, .ant-modal-title { font-family: 'Be Vietnam Pro', sans-serif !important; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <Layout style={{ minHeight: '100vh', fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif" }}>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <AdminHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content
          style={{
            margin: '16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;