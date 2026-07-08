import React, { useState, useEffect } from 'react';
import {
  Table, Button, Space, message, Card, Tag, Modal,
  Typography, Rate, Avatar, Tooltip, Popconfirm
} from 'antd';
import { CheckOutlined, DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import ReviewApi from '../../services/api/ReviewApi';

const { Text } = Typography;

const AdminReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const fetchAllReviews = async () => {
    setLoading(true);
    try {
      const response = await ReviewApi.getAllReviews();
      setReviews(response || []);
    } catch (error) {
      console.error('Lỗi:', error);
      message.error('Không thể tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    try {
      await ReviewApi.approveReview(reviewId);
      message.success('Duyệt đánh giá thành công!');
      fetchAllReviews();
    } catch (error) {
      message.error('Duyệt thất bại');
    }
  };

  const handleDelete = async (reviewId) => {
    try {
      await ReviewApi.deleteReview(reviewId);
      message.success('Xóa đánh giá thành công!');
      fetchAllReviews();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleViewDetail = (review) => {
    setSelectedReview(review);
    setDetailVisible(true);
  };

  const columns = [
    {
      title: 'STT',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>ID: {record.productId}</Text>
          </div>
        </div>
      )
    },
    {
      title: 'Người dùng',
      dataIndex: 'userFullName',
      key: 'userFullName',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar size={32} src={record.userAvatarUrl} />
          <Text style={{ marginLeft: 8 }}>{text}</Text>
        </div>
      )
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating) => <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (text) => (
        <Text ellipsis={{ tooltip: text }} style={{ maxWidth: 200 }}>
          {text}
        </Text>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isApproved',
      key: 'isApproved',
      render: (isApproved) => (
        <Tag color={isApproved ? 'green' : 'orange'}>
          {isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'formattedTime',
      key: 'formattedTime',
      width: 150
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          {!record.isApproved && (
            <Tooltip title="Duyệt đánh giá">
              <Button
                type="primary"
                icon={<CheckOutlined />}
                size="small"
                onClick={() => handleApprove(record.id)}
                ghost
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa đánh giá">
            <Popconfirm
              title="Xóa đánh giá này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card
      title="Quản lý đánh giá"
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchAllReviews}>
          Làm mới
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={reviews}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        expandable={{
          expandedRowRender: (record) => (
            <div style={{ maxWidth: 500 }}>
              <Text strong>Nội dung đánh giá:</Text>
              <p>{record.comment}</p>
              {record.imageUrls && (
                <img src={record.imageUrls} alt="Review" style={{ maxWidth: 200, borderRadius: 8 }} />
              )}
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Tiêu đề: {record.title || 'Không có'}</Text>
              </div>
            </div>
          )
        }}
      />

      <Modal
        title="Chi tiết đánh giá"
        open={detailVisible}
        onCancel={() => setDetailVisible(false)}
        footer={null}
        width={600}
      >
        {selectedReview && (
          <div>
            <div style={{ display: 'flex', gap: 16 }}>
              <Avatar size={48} src={selectedReview.userAvatarUrl} />
              <div>
                <Text strong>{selectedReview.userFullName}</Text>
                <div><Rate disabled value={selectedReview.rating} /></div>
              </div>
            </div>
            <div style={{ marginTop: 16 }}>
              <Text strong>Sản phẩm: </Text>
              <Text>{selectedReview.productName}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text strong>Tiêu đề: </Text>
              <Text>{selectedReview.title || 'Không có'}</Text>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text strong>Nội dung: </Text>
              <p>{selectedReview.comment}</p>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text strong>Trạng thái: </Text>
              <Tag color={selectedReview.isApproved ? 'green' : 'orange'}>
                {selectedReview.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
              </Tag>
            </div>
            <div style={{ marginTop: 8 }}>
              <Text strong>Ngày tạo: </Text>
              <Text>{selectedReview.formattedTime}</Text>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AdminReviewList;
