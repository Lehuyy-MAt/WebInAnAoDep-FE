// src/pages/order/Orders.jsx
import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Modal, message, Space, Typography, Tooltip } from 'antd';
import { EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import OrderApi from '../../services/api/OrderApi';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { auth, isAuthenticated } = useAuth();

  useEffect(() => {
    console.log("Current Auth State:", auth);
    if (auth && auth.id) {
      console.log("User found with ID:", auth.id);
      fetchMyOrders(auth.id);
    } else if (auth && (auth.id === undefined || auth.id === null)) {
      console.error("Auth exists but ID is missing! Details:", auth);
      message.error('Lỗi xác thực: Không tìm thấy ID. Vui lòng đăng xuất và đăng nhập lại.');
    } else if (isAuthenticated === false) {
      message.warning('Vui lòng đăng nhập để xem đơn hàng');
    }
  }, [auth, isAuthenticated]);

  const fetchMyOrders = async (userId) => {
    setLoading(true);
    try {
      console.log("Fetching orders for userId:", userId);
      const response = await OrderApi.getMyOrders(userId);
      console.log("Orders response:", response);
      
      // Lấy danh sách đơn hàng từ response (xử lý cả trường hợp API trả về object phân trang)
      const ordersData = Array.isArray(response) ? response : (response.items || response.content || []);
      setOrders(ordersData);
    } catch (error) {
      console.error("Lỗi chi tiết:", error);
      message.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id) => {
    try {
      await OrderApi.cancel(id);
      message.success('Hủy đơn hàng thành công');
      if (auth && auth.id) {
        fetchMyOrders(auth.id);
      }
    } catch (error) {
      message.error('Hủy đơn hàng thất bại');
    }
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

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 120,
      render: (text) => <Text code>{text}</Text>
    },
    {
      title: 'Ngày đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount) => `${amount?.toLocaleString()}đ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={statusColors[status]}>{statusNames[status] || status}</Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button icon={<EyeOutlined />} size="small" onClick={() => handleViewDetail(record.id)} />
          </Tooltip>
          {record.status === 'pending' && (
            <Button danger size="small" onClick={() => handleCancelOrder(record.id)}>
              Hủy
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <PageLayout>
      <Card 
        title="Đơn hàng của tôi" 
        extra={<Button icon={<ReloadOutlined />} onClick={() => {
          if (auth && auth.id) fetchMyOrders(auth.id);
        }}>Làm mới</Button>}>
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
              <div className="mb-4 grid grid-cols-2 gap-3">
                <div><Text strong>Trạng thái: </Text><Tag color={statusColors[selectedOrder.status]}>{statusNames[selectedOrder.status]}</Tag></div>
                <div><Text strong>Người nhận: </Text><Text>{selectedOrder.receiverName}</Text></div>
                <div><Text strong>Số điện thoại: </Text><Text>{selectedOrder.receiverPhone}</Text></div>
                <div><Text strong>Địa chỉ: </Text><Text>{selectedOrder.shippingAddress}</Text></div>
                <div><Text strong>Thành phố: </Text><Text>{selectedOrder.city}</Text></div>
                <div><Text strong>Phương thức TT: </Text><Text>{selectedOrder.paymentMethod}</Text></div>
                <div className="col-span-2"><Text strong>Ghi chú: </Text><Text>{selectedOrder.note || 'Không có'}</Text></div>
              </div>
              
              <div className="mb-4">
                <Text strong>Danh sách sản phẩm:</Text>
                <Table
                  dataSource={selectedOrder.items || []}
                  rowKey="id"
                  pagination={false}
                  size="small"
                  className="mt-2"
                  columns={[
                    { 
                      title: 'Sản phẩm', 
                      dataIndex: 'productName', 
                      key: 'productName',
                      render: (text, record) => (
                        <div className="flex items-center gap-3">
                          {record.productImageUrl ? (
                            <img 
                              src={record.productImageUrl} 
                              alt={text}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">👕</div>
                          )}
                          <span>{text}</span>
                        </div>
                      )
                    },
                    { title: 'Size', dataIndex: 'size', key: 'size', width: 70 },
                    { title: 'Màu', dataIndex: 'color', key: 'color', width: 70 },
                    { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 60, align: 'center' },
                    { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', width: 120, align: 'right', render: (p) => `${p?.toLocaleString()}đ` },
                    { title: 'Thành tiền', dataIndex: 'subtotal', key: 'subtotal', width: 120, align: 'right', render: (t) => `${t?.toLocaleString()}đ` }
                  ]}
                />
              </div>
              
              <div className="text-right border-t pt-3 mt-2">
                <Text strong>Tạm tính: </Text>
                <Text>{selectedOrder.subtotal?.toLocaleString()}đ<br/></Text>
                <Text strong>Phí ship: </Text>
                <Text>{selectedOrder.shippingFee?.toLocaleString()}đ<br/></Text>
                {selectedOrder.discountAmount > 0 && (
                  <><Text strong>Giảm giá: </Text><Text className="text-red-500">-{selectedOrder.discountAmount?.toLocaleString()}đ<br/></Text></>
                )}
                <Text strong style={{ fontSize: 20, color: '#4f46e5' }}>
                  Tổng cộng: {selectedOrder.totalAmount?.toLocaleString()}đ
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </Card>
    </PageLayout>
  );
};

export default Orders;