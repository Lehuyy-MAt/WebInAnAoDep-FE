import React, { useState, useEffect } from 'react';
import { 
  Carousel, Card, Row, Col, Typography, 
  Button, Tag, Input, Space, Empty, Spin, Avatar 
} from 'antd';
import { 
  ShoppingCartOutlined,
  RocketOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  HeartOutlined, // For wishlist button on product card
  UserOutlined,
  SearchOutlined, 
  FireOutlined, 
  CheckCircleOutlined 
} from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageLayout from '../../components/layout/PageLayout';
import ProductApi from '../../services/api/ProductApi';
import CategoryApi from '../../services/api/CategoryApi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { fmt } from '../../utils/fmt';
const { Title, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { auth, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy params từ URL
  const searchKeyword = searchParams.get('keyword') || '';
  const selectedCategory = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchKeyword]);

  const fetchCategories = async () => {
    try {
      const res = await CategoryApi.getAll();
      setCategories(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Failed to fetch categories");
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Sử dụng API lấy sản phẩm, truyền categoryId nếu có lọc
      const response = await ProductApi.getAllForAdmin({ 
        page: 0, 
        size: 12, 
        keyword: searchKeyword,
        isActive: true,
        categoryId: selectedCategory 
      });
      setProducts(response.items || []);
    } catch (error) {
      console.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set('keyword', value);
    else newParams.delete('keyword');
    newParams.delete('page'); // Reset về trang 1
    setSearchParams(newParams);
  };

  const handleCategoryChange = (id) => {
    const newParams = new URLSearchParams(searchParams);
    if (id === selectedCategory) {
      newParams.delete('categoryId');
    } else {
      newParams.set('categoryId', id);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <PageLayout>
      <div 
        className="min-h-screen bg-fixed bg-cover bg-center transition-all duration-500"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1479064566235-aa6742f5a801?q=80&w=2070")' }}
      >
        <div className="bg-white/90 backdrop-blur-[2px] min-h-screen p-4 md:p-10">
          {/* 1. Hero Section */}
          <div className="mb-10">
            <Carousel autoplay effect="fade" className="rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-[300px] md:h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1562157873-818bc0726f68?auto=format&fit=crop&q=80&w=1600" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Banner 1"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                  <div className="ml-10 md:ml-20 text-white max-w-lg">
                    <Tag color="gold" className="mb-4 uppercase font-bold">New Arrival 2024</Tag>
                    <Title className="!text-white !m-0 !text-3xl md:!text-5xl" level={1}>In Dấu Ấn Riêng</Title>
                    <Title className="!text-white !mt-2 !font-light" level={4}>Dịch vụ in áo thun theo yêu cầu chất lượng cao, bền màu và sắc nét.</Title>
                    <Button size="large" type="primary" className="mt-8 h-12 px-10 rounded-full font-bold bg-indigo-600 hover:scale-105 transition-transform border-none">
                      Khám phá ngay
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1572044162444-ad60f128bde2?auto=format&fit=crop&q=80&w=1600" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Banner 2"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="text-center text-white p-8">
                    <Title className="!text-white !m-0 md:!text-6xl" level={1}>Sáng Tạo Không Giới Hạn</Title>
                    <Text className="text-white text-lg block mt-4">Tự tay thiết kế mẫu áo độc bản của riêng bạn</Text>
                    <Button size="large" className="mt-8 h-12 px-10 rounded-full font-bold border-2 border-white bg-transparent text-white hover:bg-white hover:text-black transition-all">
                      Bắt đầu thiết kế
                    </Button>
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] md:h-[500px]">
                <img 
                  src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1600" 
                  className="absolute inset-0 w-full h-full object-cover" 
                  alt="Banner 3"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent flex items-end pb-20 justify-center">
                  <div className="text-center text-white">
                    <Title className="!text-white !m-0" level={2}>Bộ Sưu Tập Premium Cotton</Title>
                    <Button size="large" type="primary" className="mt-6 h-12 px-8 rounded-full font-bold">
                    Mua ngay
                  </Button>
                  </div>
                </div>
              </div>
            </Carousel>
          </div>

          {/* 2. Search & Filter Bar */}
          <div className="bg-white/80 p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 backdrop-blur-md">
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} md={8}>
                <Input.Search
                  placeholder="Tìm sản phẩm bạn yêu thích..."
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  onSearch={handleSearch}
                />
              </Col>
              <Col xs={24} md={16}>
                <Space wrap>
                  <Tag 
                    color={!selectedCategory ? "indigo" : "default"}
                    className={`px-5 py-1.5 cursor-pointer text-sm rounded-full transition-all ${!selectedCategory ? 'shadow-md scale-105' : 'hover:bg-gray-100'}`}
                onClick={() => handleCategoryChange(null)}
                  >
                    Tất cả
                  </Tag>
                  {categories.map(cat => (
                    <Tag 
                      key={cat.id}
                      color={selectedCategory === cat.id ? "indigo" : "default"}
                      className={`px-5 py-1.5 cursor-pointer text-sm rounded-full transition-all ${selectedCategory === cat.id ? 'shadow-md scale-105' : 'hover:bg-gray-100'}`}
                  onClick={() => handleCategoryChange(cat.id)}
                    >
                      {cat.name}
                    </Tag>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { icon: <RocketOutlined className="text-2xl" />, title: 'Giao hàng siêu tốc', desc: 'Nhận hàng trong 24h nội thành' },
          { icon: <SafetyOutlined className="text-2xl" />, title: 'Bảo hành 1 đổi 1', desc: 'Nếu lỗi do nhà sản xuất' },
              { icon: <CustomerServiceOutlined className="text-2xl" />, title: 'Hỗ trợ thiết kế', desc: 'Tư vấn ý tưởng miễn phí' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 bg-white/70 p-5 rounded-2xl border border-gray-50 shadow-sm backdrop-blur-sm hover:bg-white transition-all">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <div className="font-bold text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 3. Product Section */}
          <div className="mb-6 flex justify-between items-center bg-white/40 p-4 rounded-xl backdrop-blur-sm">
            <Title level={3} className="!m-0 flex items-center gap-2">
              <FireOutlined className="text-red-500" /> Sản phẩm mới nhất
            </Title>
        <Space>
          <Text type="secondary" className="font-medium">{products.length} sản phẩm tìm thấy</Text>
          {(searchKeyword || selectedCategory) && (
            <Button type="link" onClick={handleClearFilters} danger className="p-0 h-auto text-xs">
              Xóa bộ lọc
            </Button>
          )}
        </Space>
          </div>

          <Spin spinning={loading}>
            {products.length > 0 ? (
              <Row gutter={[20, 20]}>
                {products.map(product => (
                  <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                    <Card
                      hoverable
                      className="rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border-none group bg-white/80 backdrop-blur-sm"
                      cover={
                        <div className="h-48 md:h-72 overflow-hidden relative" onClick={() => navigate(`/productdetail?id=${product.id}`)}>
                          <img
                            alt={product.name}
                            src={product.defaultImageUrl || 'https://via.placeholder.com/300x400?text=No+Image'}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <Button 
                            icon={<HeartOutlined />} 
                            className="absolute top-3 right-3 border-none bg-white/80 backdrop-blur shadow-sm hover:!text-red-500 rounded-full"
                            shape="circle"
                          />
                        </div>
                      }
                      actions={[
                        <Button 
                          key="add-to-cart"
                          type="primary" 
                          icon={<ShoppingCartOutlined />} 
                          className="w-[90%] bg-indigo-600 rounded-lg h-10 font-medium border-none"
                          onClick={() => {
                            addToCart(product);
                          }}
                        >
                          Thêm vào giỏ
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        title={<div className="truncate text-sm md:text-base font-bold group-hover:text-indigo-600 transition-colors">{product.name}</div>}
                        description={
                          <div className="mt-1">
                            <div className="text-indigo-600 font-bold text-base md:text-lg">
                              {fmt(product.basePrice || 0)}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 uppercase font-semibold">
                              <CheckCircleOutlined className="text-green-500" /> Sẵn có: {product.stockQuantity}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            ) : (
              <Empty description="Không tìm thấy sản phẩm nào" className="py-20 bg-white/50 rounded-3xl" />
            )}
          </Spin>
        </div>
      </div>
    </PageLayout>
  );
};

export default Home;