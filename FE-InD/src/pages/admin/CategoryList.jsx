import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Popconfirm, Modal, Form, Card, message, Switch, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { CategoryService } from '../../services/api';

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await CategoryService.all();
      setCategories(data);
    } catch (error) {
      message.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await CategoryService.delete(id);
      message.success('Xóa danh mục thành công');
      fetchCategories();
    } catch (error) {
      message.error('Xóa thất bại. Danh mục có thể đang chứa sản phẩm.');
    }
  };

  const handleSave = async (values) => {
    const payload = {
      ...values,
      isActive: !!values.isActive // Đảm bảo luôn là boolean true/false
    };
    console.log("Dữ liệu gửi lên server:", payload);
    try {
      if (editingCategory) {
        await CategoryService.update(editingCategory.id, payload);
        message.success('Cập nhật thành công');
      } else {
        await CategoryService.create(payload);
        message.success('Thêm mới thành công');
      }
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      message.error('Lưu danh mục thất bại');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => {
        // Nếu isActive là undefined hoặc null, mặc định hiển thị là Hoạt động
        const status = isActive !== false; 
        return <Tag color={status ? 'green' : 'red'}>{status ? 'Hoạt động' : 'Đã ẩn'}</Tag>;
      },
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              const editData = {
                ...record,
                isActive: record.isActive !== false // Nếu undefined hoặc null thì coi là true
              };
              setEditingCategory(record);
              form.setFieldsValue(editData);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Xóa danh mục này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="Quản lý danh mục"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingCategory(null);
            form.resetFields();
              form.setFieldsValue({ isActive: true }); // Mặc định bật khi thêm mới
            setModalVisible(true);
          }}
        >
          Thêm danh mục
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            name="name"
            label="Tên danh mục"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="isActive" label="Trạng thái hiển thị" valuePropName="checked">
            <Switch checkedChildren="Hiện" unCheckedChildren="Ẩn" />
          </Form.Item>
          <Form.Item name="slug" label="Slug (Đường dẫn)">
            <Input placeholder="ví dụ: ao-thun" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default CategoryList;