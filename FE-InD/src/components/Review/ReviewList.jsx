import React, { useState, useEffect } from 'react';
import { Rate, Card, Avatar, Typography, List, Divider, Button, Modal, Form, Input, message, Space, Tag } from 'antd';
import { UserOutlined, StarOutlined } from '@ant-design/icons';
import ReviewApi from '../../services/api/ReviewApi';

const { Text, Title } = Typography;
const { TextArea } = Input;

const ReviewList = ({ productId, productName }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingStats, setRatingStats] = useState({ averageRating: 0, reviewCount: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);

  const getCurrentUser = () => {
    try {
      let userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.id) return user;
      }
      userData = localStorage.getItem('auth');
      if (userData) {
        const auth = JSON.parse(userData);
        if (auth.userId) {
          return { id: auth.userId, fullName: auth.fullName };
        }
      }
      return null;
    } catch (e) {
      console.error('Lỗi parse user:', e);
      return null;
    }
  };

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    fetchReviews();
    fetchRatingStats();
  }, [productId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await ReviewApi.getReviewsByProduct(productId);
      setReviews(response || []);
    } catch (error) {
      console.error('Lỗi tải đánh giá:', error);
      message.error('Không thể tải đánh giá');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await ReviewApi.getProductRating(productId);
      setRatingStats(response || { averageRating: 0, reviewCount: 0 });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  const handleSubmitReview = async (values) => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      message.warning('Vui lòng đăng nhập để đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        productId: productId,
        rating: values.rating,
        title: values.title || '',
        comment: values.comment,
        imageUrls: null,
        orderId: null
      };

      const response = await ReviewApi.createReview(reviewData, currentUser.id);
      
      if (response) {
        message.success('Đánh giá đã được gửi! Chờ admin duyệt.');
        form.resetFields();
        setIsModalOpen(false);
        fetchReviews();
        fetchRatingStats();
      }
    } catch (error) {
      console.error('Lỗi gửi đánh giá:', error);
      message.error(error.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating) => (
    <Rate disabled defaultValue={rating} style={{ fontSize: 14 }} />
  );

  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div>
          <Title level={4}>Đánh giá sản phẩm</Title>
          <Space>
            <Rate disabled value={Math.round(ratingStats.averageRating || 0)} style={{ fontSize: 20 }} />
            <Text strong style={{ fontSize: 20 }}>
              {(ratingStats.averageRating || 0).toFixed(1)}
            </Text>
            <Text type="secondary">({ratingStats.reviewCount || 0} đánh giá)</Text>
          </Space>
        </div>
        {user ? (
          <Button type="primary" icon={<StarOutlined />} onClick={() => setIsModalOpen(true)}>
            Viết đánh giá
          </Button>
        ) : (
          <Button type="default" disabled>
            Đăng nhập để đánh giá
          </Button>
        )}
      </div>

      <Divider />

      <List
        loading={loading}
        dataSource={reviews}
        locale={{ emptyText: 'Chưa có đánh giá nào cho sản phẩm này' }}
        renderItem={(review) => (
          <List.Item>
            <Card style={{ width: '100%' }}>
              <div style={{ display: 'flex', gap: 16 }}>
                <Avatar size={48} src={review.userAvatarUrl} icon={<UserOutlined />} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div>
                      <Text strong>{review.userFullName || 'Người dùng'}</Text>
                      <div>{renderStars(review.rating)}</div>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {review.formattedTime || ''}
                    </Text>
                  </div>
                  {review.title && <Text strong>{review.title}</Text>}
                  <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{review.comment}</p>
                  {review.imageUrls && (
                    <img 
                      src={review.imageUrls} 
                      alt="Review" 
                      style={{ maxWidth: 200, borderRadius: 8, marginTop: 8 }}
                    />
                  )}
                  {!review.isApproved && (
                    <Tag color="orange" style={{ marginTop: 8 }}>Chờ duyệt</Tag>
                  )}
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={`Đánh giá sản phẩm: ${productName}`}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitReview}>
          <Form.Item
            name="rating"
            label="Đánh giá của bạn"
            rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="title"
            label="Tiêu đề"
          >
            <Input placeholder="Tóm tắt đánh giá của bạn..." />
          </Form.Item>

          <Form.Item
            name="comment"
            label="Nhận xét chi tiết"
            rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
          >
            <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Gửi đánh giá
              </Button>
              <Button onClick={() => { setIsModalOpen(false); form.resetFields(); }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReviewList;
