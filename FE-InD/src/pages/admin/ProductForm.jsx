// src/pages/admin/ProductForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Select, Button, message, Space, Upload, Image, Spin, Radio, Alert } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import ProductApi from '../../services/api/ProductApi';

const { TextArea } = Input;
const { Option } = Select;

const ProductForm = ({ product, categories, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [uploadType, setUploadType] = useState('url');
  const [imageUrl, setImageUrl] = useState('');
  const [pendingImages, setPendingImages] = useState([]);

  useEffect(() => {
    if (product?.id) {
      setCreatedProductId(product.id);
      fetchImages(product.id);
    } else {
      setCreatedProductId(null);
      setImageList([]);
      setPendingImages([]);
    }
  }, [product]);

  const fetchImages = async (productId) => {
    setLoadingImages(true);
    try {
      const response = await ProductApi.getImages(productId);
      setImageList(response || []);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const uploadPendingImages = async (productId) => {
    console.log("=== uploadPendingImages called ===");
    console.log("ProductId:", productId);
    console.log("Pending images:", pendingImages);
    
    for (const img of pendingImages) {
      try {
        console.log("Uploading image:", img);
        if (img.isFile && img.file) {
          const response = await ProductApi.uploadImageFile(productId, img.file);
          console.log("Upload file response:", response);
        } else if (img.imageUrl && !img.isFile) {
          const response = await ProductApi.addImageByUrl(productId, { imageUrl: img.imageUrl });
          console.log("Add URL response:", response);
        }
      } catch (error) {
        console.error('Upload ảnh thất bại:', error);
      }
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }
    
    const newImage = {
      id: Date.now(),
      imageUrl: imageUrl.trim(),
      isPending: true,
      isFile: false
    };
    setPendingImages([...pendingImages, newImage]);
    setImageUrl('');
    message.success('Đã thêm ảnh vào danh sách, sẽ upload khi lưu sản phẩm');
  };

  const handleUploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = {
        id: Date.now(),
        file: file,
        imageUrl: e.target.result,
        isPending: true,
        isFile: true
      };
      setPendingImages([...pendingImages, newImage]);
      message.success('Đã thêm ảnh vào danh sách, sẽ upload khi lưu sản phẩm');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const handleDeletePendingImage = (imageId) => {
    setPendingImages(pendingImages.filter(img => img.id !== imageId));
    message.success('Đã xóa ảnh khỏi danh sách');
  };

  const handleDeleteImage = async (imageId) => {
    const productId = product?.id || createdProductId;
    try {
      await ProductApi.deleteImage(productId, imageId);
      setImageList(imageList.filter(img => img.id !== imageId));
      message.success('Xóa ảnh thành công');
    } catch (error) {
      message.error('Xóa ảnh thất bại');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      let savedProduct;
      console.debug('ProductForm.onFinish payload:', values);
      
      if (product) {
        // Update existing product
        await ProductApi.update(product.id, values);
        
        // Upload ảnh khi edit sản phẩm
        if (pendingImages.length > 0) {
          message.loading('Đang upload ảnh...', 1);
          await uploadPendingImages(product.id);
          message.success(`Đã upload ${pendingImages.length} ảnh thành công`);
          setPendingImages([]);
        }
        
        message.success('Cập nhật sản phẩm thành công');
        onSuccess();
      } else {
        // Create new product
        savedProduct = await ProductApi.create(values);
        setCreatedProductId(savedProduct.id);
        message.success('Thêm sản phẩm thành công!');
        
        // Upload ảnh đã thêm vào lúc tạo
        if (pendingImages.length > 0) {
          message.loading('Đang upload ảnh...', 1);
          await uploadPendingImages(savedProduct.id);
          message.success(`Đã upload ${pendingImages.length} ảnh thành công`);
          setPendingImages([]);
        }
        onSuccess();
      }
    } catch (error) {
      console.error('Error:', error, error?.response);
      const serverData = error?.response?.data || error?.response || error;
      const serverMsgString = typeof serverData === 'string' ? serverData : JSON.stringify(serverData);
      console.error('Product create server response:', serverMsgString);
      message.error(serverMsgString || (product ? 'Cập nhật thất bại' : 'Thêm sản phẩm thất bại'));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!product && pendingImages.length > 0) {
      message.warning('Bạn đã thêm ảnh nhưng chưa lưu sản phẩm. Ảnh sẽ bị hủy.');
    }
    onCancel();
  };

  const hasPendingImages = pendingImages.length > 0;
  const hasSavedImages = imageList.length > 0;
  const hasCategories = Array.isArray(categories) && categories.length > 0;
  const submitDisabled = !hasCategories && !product;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={product || {
        availableSizes: 'S,M,L,XL,XXL',
        availableColors: 'White,Black,Gray,Navy',
        stockQuantity: 0,
        basePrice: 0,
        originalPrice: 0
      }}
    >
      <Form.Item
        name="name"
        label="Tên sản phẩm"
        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }]}
      >
        <Input placeholder="Nhập tên sản phẩm" size="large" />
      </Form.Item>

      <Form.Item
        name="categoryId"
        label="Danh mục"
        rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
      >
        {!hasCategories ? (
          <div>
            <Alert title="Chưa có danh mục. Vui lòng tạo danh mục trước." type="warning" showIcon style={{ marginBottom: 8 }} />
            <Select placeholder="Không có danh mục" size="large" disabled />
          </div>
        ) : (
          <Select placeholder="Chọn danh mục" size="large">
            {categories.map(cat => (
              <Option key={cat.id} value={cat.id}>{cat.name}</Option>
            ))}
          </Select>
        )}
      </Form.Item>

      <Form.Item
        name="description"
        label="Mô tả"
        rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
      >
        <TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
      </Form.Item>

      <Form.Item
        name="material"
        label="Chất liệu"
        rules={[{ required: true, message: 'Vui lòng nhập chất liệu!' }]}
      >
        <Input placeholder="Ví dụ: Cotton, Polyester..." />
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item
          name="basePrice"
          label="Giá bán"
          rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
          style={{ flex: 1 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={1000}
            placeholder="Nhập giá bán"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>

        <Form.Item
          name="originalPrice"
          label="Giá gốc"
          rules={[{ required: true, message: 'Vui lòng nhập giá gốc!' }]}
          style={{ flex: 1 }}
        >
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            step={1000}
            placeholder="Nhập giá gốc"
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            parser={value => value.replace(/\$\s?|(,*)/g, '')}
          />
        </Form.Item>
      </div>

      <Form.Item
        name="stockQuantity"
        label="Số lượng tồn kho"
        rules={[{ required: true, message: 'Vui lòng nhập số lượng!' }]}
      >
        <InputNumber
          style={{ width: '100%' }}
          min={0}
          step={1}
          placeholder="Nhập số lượng"
        />
      </Form.Item>

      <div style={{ display: 'flex', gap: 16 }}>
        <Form.Item
          name="availableSizes"
          label="Kích thước có sẵn"
          tooltip="Cách nhau bằng dấu phẩy"
          style={{ flex: 1 }}
        >
          <Input placeholder="Ví dụ: S,M,L,XL,XXL" />
        </Form.Item>

        <Form.Item
          name="availableColors"
          label="Màu sắc có sẵn"
          tooltip="Cách nhau bằng dấu phẩy"
          style={{ flex: 1 }}
        >
          <Input placeholder="Ví dụ: Trắng,Đen,Xám,Navy" />
        </Form.Item>
      </div>

      {/* Phần thêm ảnh */}
      <Form.Item label="Thêm ảnh sản phẩm">
        <Radio.Group value={uploadType} onChange={(e) => setUploadType(e.target.value)}>
          <Radio value="url">Nhập URL ảnh</Radio>
          <Radio value="file">Upload file ảnh</Radio>
        </Radio.Group>
      </Form.Item>

      {uploadType === 'url' ? (
        <Space.Compact style={{ width: '100%', marginBottom: 16 }}>
          <Input
            placeholder="Dán URL ảnh tại đây (ví dụ: https://example.com/image.jpg)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          <Button type="primary" onClick={handleAddImageUrl}>
            Thêm ảnh
          </Button>
        </Space.Compact>
      ) : (
        <Upload 
          beforeUpload={handleUploadFile} 
          showUploadList={false} 
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>
            Chọn ảnh từ máy tính
          </Button>
        </Upload>
      )}

      {/* Hiển thị ảnh đã thêm (pending) */}
      {hasPendingImages && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold', color: '#ff9800' }}>
            📷 Ảnh sẽ được upload sau khi lưu sản phẩm ({pendingImages.length} ảnh)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {pendingImages.map((img) => (
              <div key={img.id} style={{ position: 'relative', border: '1px solid #ff9800', borderRadius: 8, padding: 4, background: '#fff8e1' }}>
                <Image
                  src={img.imageUrl}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ position: 'absolute', top: -8, right: -8 }}
                  onClick={() => handleDeletePendingImage(img.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hiển thị ảnh đã có (khi edit) */}
      {hasSavedImages && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 'bold' }}>📷 Ảnh đã có:</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {imageList.map((img) => (
              <div key={img.id} style={{ position: 'relative', border: '1px solid #ddd', borderRadius: 8, padding: 4 }}>
                <Image
                  src={img.imageUrl}
                  width={80}
                  height={80}
                  style={{ objectFit: 'cover', borderRadius: 4 }}
                />
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                  style={{ position: 'absolute', top: -8, right: -8 }}
                  onClick={() => handleDeleteImage(img.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thông báo khi chưa thêm ảnh nào */}
      {!hasPendingImages && !hasSavedImages && (
        <div style={{ color: '#999', marginTop: 8, fontSize: 13, fontStyle: 'italic' }}>
          💡 Bạn có thể thêm ảnh ngay bây giờ, ảnh sẽ tự động upload sau khi lưu sản phẩm.
        </div>
      )}

      <Form.Item style={{ marginTop: 16 }}>
        <Space>
          <Button type="primary" htmlType="submit" loading={loading} disabled={submitDisabled}>
            {product ? 'Cập nhật' : 'Tạo sản phẩm'}
          </Button>
          <Button onClick={handleClose}>Đóng</Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default ProductForm;