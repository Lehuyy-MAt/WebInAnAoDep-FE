// src/pages/admin/OrderList.jsx - Phiên bản đơn giản
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Select, Space, message, Input,
  Card, Tag, Modal, Typography, Tooltip
} from 'antd';
import { EyeOutlined, ReloadOutlined, SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import OrderApi from '../../services/api/OrderApi';

const { Option } = Select;
const { Text } = Typography;

const statusColors = {
  'pending': 'orange',
  'confirmed': 'blue',
  'shipping': 'geekblue',
  'delivered': 'green',
  'cancelled': 'red'
};

const statusNames = {
  'pending': 'Chờ xác nhận',
  'confirmed': 'Đã xác nhận',
  'shipping': 'Đang giao hàng',
  'delivered': 'Đã giao',
  'cancelled': 'Đã hủy'
};

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: '', status: null });
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let response = await OrderApi.getAllOrders();
      
      // Nếu response là object có items, lấy items, nếu không thì coi như mảng
      let ordersData = Array.isArray(response) ? response : (response.items || response.content || []);
      
      // Lọc theo status
      if (filters.status) {
        ordersData = ordersData.filter(order => order.status === filters.status);
      }
      
      // Lọc theo keyword
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        ordersData = ordersData.filter(order => 
          order.orderNumber?.toLowerCase().includes(keyword) ||
          order.receiverName?.toLowerCase().includes(keyword)
        );
      }
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Lỗi:", error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await OrderApi.updateStatus(id, status);
      message.success('Cập nhật trạng thái thành công');
      fetchOrders();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleReset = () => {
    setFilters({ keyword: '', status: null });
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await OrderApi.getById(id);
      setSelectedOrder(response);
      setDetailVisible(true);
    } catch (error) {
      message.error('Không thể tải chi tiết đơn hàng');
    }
  };

  // 👉 HÀM XUẤT EXCEL
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const response = await OrderApi.exportExcel(filters.status, filters.keyword);
      
      const blob = new Blob([response], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `don_hang_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success('Xuất Excel thành công!');
    } catch (error) {
      console.error("Lỗi:", error);
      message.error('Xuất Excel thất bại');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Khách hàng',
      dataIndex: 'receiverName',
      key: 'receiverName',
    },
    {
      title: 'SĐT',
      dataIndex: 'receiverPhone',
      key: 'receiverPhone',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount?.toLocaleString()}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleUpdateStatus(record.id, value)}
          style={{ width: 130 }}
        >
          <Option value="pending">Chờ xác nhận</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="shipping">Đang giao</Option>
          <Option value="delivered">Đã giao</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
      )
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record.id)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <Card 
      title="Quản lý đơn hàng" 
      extra={
        <Space>
          <Button 
            icon={<DownloadOutlined />} 
            onClick={handleExportExcel}
            type="primary"
            ghost
          >
            Xuất Excel
          </Button>
          <Button icon={<ReloadOutlined />} onClick={fetchOrders}>
            Làm mới
          </Button>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Mã đơn hoặc tên khách..."
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={{ width: 220 }}
          onPressEnter={fetchOrders}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={filters.status}
          onChange={(value) => setFilters({ ...filters, status: value })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value="pending">Chờ xác nhận</Option>
          <Option value="confirmed">Đã xác nhận</Option>
          <Option value="shipping">Đang giao</Option>
          <Option value="delivered">Đã giao</Option>
          <Option value="cancelled">Đã hủy</Option>
        </Select>
        <Button onClick={handleReset}>
          Làm mới bộ lọc
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showTotal: (total) => `Tổng ${total} đơn hàng` }}
      />

      <Modal
        title={`Chi tiết đơn hàng #${selectedOrder?.orderNumber}`}
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={700}
      >
        {selectedOrder && (
          <div>
            <div className="mb-4">
              <Text strong>Trạng thái: </Text>
              <Tag color={statusColors[selectedOrder.status]}>
                {statusNames[selectedOrder.status]}
              </Tag>
            </div>
            <div className="mb-4">
              <Text strong>Người nhận: </Text>
              <Text>{selectedOrder.receiverName}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Số điện thoại: </Text>
              <Text>{selectedOrder.receiverPhone}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Địa chỉ: </Text>
              <Text>{selectedOrder.shippingAddress}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Thành phố: </Text>
              <Text>{selectedOrder.city}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Phương thức TT: </Text>
              <Text>{selectedOrder.paymentMethod}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Ghi chú: </Text>
              <Text>{selectedOrder.note || 'Không có'}</Text>
            </div>
            <div className="mb-4">
              <Text strong>Danh sách sản phẩm:</Text>
              <Table
                dataSource={selectedOrder.items || []}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  { title: 'Sản phẩm', dataIndex: 'productName', key: 'productName' },
                  { title: 'Size', dataIndex: 'size', key: 'size', width: 80 },
                  { title: 'Màu', dataIndex: 'color', key: 'color', width: 80 },
                  { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60 },
                  { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (p) => `${p?.toLocaleString()}đ` }
                ]}
              />
            </div>
            <div className="text-right">
              <Text strong>Tạm tính: </Text>
              <Text>{selectedOrder.subtotal?.toLocaleString()}đ<br/></Text>
              <Text strong>Phí ship: </Text>
              <Text>{selectedOrder.shippingFee?.toLocaleString()}đ<br/></Text>
              {selectedOrder.discountAmount > 0 && (
                <>
                  <Text strong>Giảm giá: </Text>
                  <Text>-{selectedOrder.discountAmount?.toLocaleString()}đ<br/></Text>
                </>
              )}
              <Text strong style={{ fontSize: 18, color: '#4f46e5' }}>
                Tổng cộng: {selectedOrder.totalAmount?.toLocaleString()}đ
              </Text>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default OrderList;