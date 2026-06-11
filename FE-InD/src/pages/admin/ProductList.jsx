// src/pages/admin/ProductList.jsx
import React, { useState, useEffect } from 'react';
import {
  Table, Button, Input, Select, Space, Popconfirm, message,
  Pagination, Card, Modal, Switch, Image
} from 'antd';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import ProductApi from '../../services/api/ProductApi';
import CategoryApi from '../../services/api/CategoryApi';
import ProductForm from './ProductForm';
const { Option } = Select;

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', isActive: null });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchCategories = async () => {
    try {
      const response = await CategoryApi.getAll();
      console.debug('ProductList.fetchCategories response:', response);
      setCategories(response || []);
    } catch (error) {
      message.error('Không thể tải danh mục');
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductApi.getAllForAdmin({
        page: pagination.current - 1,
        size: pagination.pageSize,
        keyword: filters.keyword,
        isActive: filters.isActive
      });
      // SỬA: dùng items thay vì content, totalItems thay vì totalElements
      setProducts(response.items || []);
      setPagination({
        ...pagination,
        total: response.totalItems || 0
      });
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await ProductApi.delete(id);
      message.success('Xóa sản phẩm thành công');
      fetchProducts();
    } catch (error) {
      message.error('Xóa thất bại');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await ProductApi.toggleActive(id);
      message.success('Cập nhật trạng thái thành công');
      fetchProducts();
    } catch (error) {
      message.error('Cập nhật thất bại');
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, current: 1 });
  };

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'defaultImageUrl',
      key: 'image',
      width: 80,
      render: (url) => (url ? (
        <Image src={url} width={50} height={50} style={{ objectFit: 'cover', borderRadius: 4 }} preview={false} />
      ) : null
      ),
    },
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      key: 'categoryName',
    },
    {
      title: 'Giá bán',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => `${price?.toLocaleString()}đ`
    },
    {
      title: 'Tồn kho',
      dataIndex: 'stockQuantity',
      key: 'stockQuantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleActive(record.id)}
          checkedChildren="Bán"
          unCheckedChildren="Ngừng"
        />
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingProduct(record);
              setModalVisible(true);
            }}
          />
          <Popconfirm
            title="Xóa sản phẩm?"
            description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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
      title="Quản lý sản phẩm"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingProduct(null);
            setModalVisible(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      }
    >
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Tìm kiếm theo tên"
          value={filters.keyword}
          onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
          style={{ width: 200 }}
          onPressEnter={handleSearch}
        />
        <Select
          placeholder="Lọc theo trạng thái"
          value={filters.isActive}
          onChange={(value) => setFilters({ ...filters, isActive: value })}
          style={{ width: 150 }}
          allowClear
        >
          <Option value={true}>Đang bán</Option>
          <Option value={false}>Ngừng bán</Option>
        </Select>
        <Button icon={<SearchOutlined />} onClick={handleSearch}>
          Tìm kiếm
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={products}
        rowKey="id"
        loading={loading}
        pagination={false}
        scroll={{ x: 1000 }}
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
        showTotal={(total) => `Tổng ${total} sản phẩm`}
      />

      <Modal
        title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSuccess={() => {
            setModalVisible(false);
            fetchProducts();
          }}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </Card>
  );
};

export default ProductList;