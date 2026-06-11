// src/pages/common/Profile.jsx
import React, { useState, useEffect } from 'react';
import {
  Card, Button, message, Space, Avatar, 
  Modal, Typography, Spin, Upload, Descriptions, Divider, Form, Input
} from 'antd';
import { UserOutlined, EditOutlined, LockOutlined, UploadOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import ProfileApi from '../../services/api/ProfileApi';
import { ROLE_ADMIN } from '../../utils/Constants';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';

const { Title } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [passwordForm] = Form.useForm();
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  const isAdmin = auth?.role === ROLE_ADMIN;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await ProfileApi.getProfile();
      setProfile(response);
    } catch (error) {
      message.error('Không thể tải thông tin profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    setLoading(true);
    try {
      await ProfileApi.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      message.success('Đổi mật khẩu thành công');
      setChangePasswordVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      console.error("Change password error:", error);
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    setAvatarLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await ProfileApi.uploadAvatar(formData);
      setProfile({ ...profile, avatarUrl: response.avatarUrl });
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      message.error('Upload ảnh thất bại');
    } finally {
      setAvatarLoading(false);
    }
    return false;
  };

  if (loading && !profile) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <PageLayout>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 20 }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <Avatar
              size={100}
              src={profile?.avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <Upload
              showUploadList={false}
              beforeUpload={handleAvatarUpload}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={avatarLoading}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
            <Title level={3} style={{ marginTop: 16 }}>
              {profile?.fullName}
            </Title>
            <p style={{ color: '#666' }}>
              {isAdmin ? 'Quản trị viên' : 'Khách hàng'} | {profile?.email}
            </p>
          </div>

          <Descriptions title="Thông tin tài khoản" bordered column={1}>
            <Descriptions.Item label="Họ và tên">{profile?.fullName}</Descriptions.Item>
            <Descriptions.Item label="Email">{profile?.email}</Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">{profile?.phoneNumber || profile?.phone || 'Chưa cập nhật'}</Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">{profile?.address || 'Chưa cập nhật'}</Descriptions.Item>
          </Descriptions>

          <Divider />
          <Space style={{ width: '100%', justifyContent: 'center' }} wrap>
            <Button icon={<HomeOutlined />} onClick={() => navigate('/')}>
              Về trang chủ
            </Button>
            <Button type="primary" icon={<EditOutlined />} onClick={() => navigate('/profile/edit')}>
              Chỉnh sửa thông tin
            </Button>
            <Button icon={<LockOutlined />} onClick={() => setChangePasswordVisible(true)}>
              Đổi mật khẩu
            </Button>
          </Space>
        </Card>
      </div>

      <Modal
        title="Đổi mật khẩu"
        open={changePasswordVisible}
        onCancel={() => {
          setChangePasswordVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="oldPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
              <Button onClick={() => {
                setChangePasswordVisible(false);
                passwordForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  );
};

export default Profile;