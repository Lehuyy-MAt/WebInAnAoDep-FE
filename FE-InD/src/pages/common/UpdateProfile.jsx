import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Spin, Typography } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProfileApi from '../../services/api/ProfileApi';
import PageLayout from '../../components/layout/PageLayout';
import { useAuth } from '../../context/AuthContext';

const UpdateProfile = () => {
  const navigate = useNavigate();
  const { updateAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await ProfileApi.getProfile();
      // Đảm bảo lấy dữ liệu SDT dù key backend trả về là gì
      form.setFieldsValue({
        ...response,
        phoneNumber: response.phoneNumber || response.phone
      });
    } catch (error) {
      message.error('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      // Gửi cả phoneNumber và phone để chắc chắn backend nhận được
      const payload = {
        ...values,
        phone: values.phoneNumber
      };
      await ProfileApi.updateProfile(payload);
      
      // Đồng bộ thông tin mới vào Context và LocalStorage
      updateAuth(values);
      message.success('Cập nhật thông tin thành công');
      navigate('/profile');
    } catch (error) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div style={{ maxWidth: 600, margin: '20px auto', padding: '0 20px' }}>
        <Card 
          title={
            <Space>
              <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/profile')} />
              <span>Chỉnh sửa thông tin cá nhân</span>
            </Space>
          }
        >
          <Spin spinning={loading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
            >
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item name="email" label="Email">
                <Input prefix={<MailOutlined />} placeholder="Email" disabled />
              </Form.Item>

              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>

              <Form.Item name="address" label="Địa chỉ">
                <Input.TextArea prefix={<HomeOutlined />} placeholder="Địa chỉ" rows={3} />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    Lưu thay đổi
                  </Button>
                  <Button onClick={() => navigate('/profile')}>
                    Hủy
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Spin>
        </Card>
      </div>
    </PageLayout>
  );
};

export default UpdateProfile;