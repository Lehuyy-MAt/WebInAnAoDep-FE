// src/pages/admin/UserList.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Select, Space, Popconfirm, message,
  Pagination, Card, Modal, Form, Switch, Avatar, Tooltip
} from 'antd';
import {
  SearchOutlined, EditOutlined, DeleteOutlined,
  UserOutlined, LockOutlined, ReloadOutlined
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import UserApi from '../../services/api/UserApi';
import { ROLE_ADMIN, ROLE_USER } from '../../utils/Constants';  // ← SỬA

const { Option } = Select;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', role: null });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await UserApi.getAll({
        page: pagination.current - 1,
        size: pagination.pageSize,
        keyword: filters.keyword,
        role: filters.role
      });
      setUsers(response.items || []);
      setPagination({
        ...pagination,
        total: response.totalItems || 0
      });
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await UserApi.toggleStatus(id);
      message.success('Cập nhật trạng thái thành công');
      fetchUsers();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleChangeRole = async (id, role) => {
    try {
      await UserApi.changeRole(id, role);
      message.success('Thay đổi role thành công');
      fetchUsers();
    } catch (error) {
      message.error('Thay đổi role thất bại');
    }
  };

  const handleDelete = async (id) => {
    try {
      await UserApi.delete(id);
      message.success('Xóa người dùng thành công');
      fetchUsers();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      address: user.address
    });
    setModalVisible(true);
  };

  const handleUpdate = async (values) => {
    try {
      await UserApi.update(editingUser.id, values);
      message.success('Cập nhật thông tin thành công');
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  const handleReset = () => {
    setFilters({ keyword: '', role: null });
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70
    },
    {
      title: 'Avatar',
      dataIndex: 'avatarUrl',
      key: 'avatarUrl',
      width: 70,
      render: (avatar) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      )
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleChangeRole(record.id, value)}
          style={{ width: 130 }}
        >
          <Option value={ROLE_USER}>Khách hàng</Option>  {/* ← SỬA */}
          <Option value={ROLE_ADMIN}>Quản trị viên</Option>
        </Select>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 120,
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record.id)}
          checkedChildren="Hoạt động"
          unCheckedChildren="Khóa"
        />
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-'
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa người dùng?"
            description="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button icon={<DeleteOutlined />} danger size="small" />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Card
      title={
        <Space>
          <UserOutlined />
          <span>Quản lý người dùng</span>
        </Space>
      }
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm kiếm theo tên hoặc email"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={{ width: 250 }}
          onPressEnter={handleSearch}
          prefix={<SearchOutlined />}
        />
        <Select
          placeholder="Lọc theo role"
          value={filters.role}
          onChange={(value) => setFilters({ ...filters, role: value })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value={ROLE_ADMIN}>Quản trị viên</Option>
          <Option value={ROLE_USER}>Khách hàng</Option>  {/* ← SỬA */}
        </Select>
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
        <Button icon={<ReloadOutlined />} onClick={handleReset}>
          Làm mới
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1200 }}
      />

      <Pagination
        style={{ marginTop: 16, textAlign: 'right' }}
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onChange={(page, pageSize) => {
          setPagination({ ...pagination, current: page, pageSize });
        }}
        showSizeChanger
        showTotal={(total) => `Tổng ${total} người dùng`}
      />

      <Modal
        title="Chỉnh sửa người dùng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
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
            <Input placeholder="Nhập họ tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" disabled />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
          >
            <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default UserList;