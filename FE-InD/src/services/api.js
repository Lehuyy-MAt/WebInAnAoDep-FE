import AxiosClient from './api/AxiosClient';
import ProductApi from './api/ProductApi.jsx';

export const HomeService = {
  get: async () => {
    try {
      return await AxiosClient.get('/home');
    } catch (error) {
      console.error("Lỗi kết nối API Home:", error);
      throw error;
    }
  }
};

export const CategoryService = {
  all: async () => {
    const normalizeCategories = (res) => {
      return res?.items || res?.content || res?.data?.items || res?.data?.content || res || [];
    };
    try {
      const res = await AxiosClient.get('/categories');
      return normalizeCategories(res);
    } catch (error) {
      console.error("Lỗi kết nối API Categories:", error);
      throw error;
    }
  },
  create: async (data) => {
    try {
      return await AxiosClient.post('/categories', data);
    } catch (error) {
      console.error("Lỗi tạo danh mục:", error);
      throw error;
    }
  },
  update: async (id, data) => {
    try {
      return await AxiosClient.put(`/categories/${id}`, data);
    } catch (error) {
      console.error(`Lỗi cập nhật danh mục ID ${id}:`, error);
      throw error;
    }
  },
  delete: async (id) => {
    try {
      return await AxiosClient.delete(`/categories/${id}`);
    } catch (error) {
      console.error(`Lỗi xóa danh mục ID ${id}:`, error);
      throw error;
    }
  }
};

export const ProductService = {
  search: async (params) => {
    try {
      const response = await ProductApi.getAllForAdmin({
        page: 0,
        size: 1000,
        keyword: params.keyword,
        isActive: true
      });
      let products = response.items || [];
      if (params.categoryId) {
        products = products.filter(p => p.categoryId === Number(params.categoryId));
      }
      if (params.minPrice) {
        products = products.filter(p => p.basePrice >= Number(params.minPrice));
      }
      if (params.maxPrice) {
        products = products.filter(p => p.basePrice <= Number(params.maxPrice));
      }
      return products;
    } catch (error) {
      console.error("Lỗi kết nối API Product Search:", error);
      return [];
    }
  },
  detail: async (id) => {
    try {
      return await AxiosClient.get(`/products/${id}`);
    } catch (error) {
      console.error(`Lỗi kết nối API Product ID ${id}:`, error);
      throw error;
    }
  }
};

// OrderService đã được chuyển sang OrderApi.jsx