// src/services/api/CategoryApi.jsx
import AxiosClient from "./AxiosClient";

const hardcodedCategories = [
  { name: 'Áo thun', description: '', slug: 'ao-thun', imageUrl: '', isActive: true },
  { name: 'Áo sơ mi', description: '', slug: 'ao-so-mi', imageUrl: '', isActive: true },
  { name: 'Áo khoác', description: '', slug: 'ao-khoac', imageUrl: '', isActive: true },
  { name: 'Áo len', description: '', slug: 'ao-len', imageUrl: '', isActive: true }
];

const normalizeCategories = (res) => {
  return res?.items || res?.content || res?.data?.items || res?.data?.content || res || [];
};

const CategoryApi = {
  getAll: async () => {
    try {
      const res = await AxiosClient.get('/categories');
      const categories = normalizeCategories(res);
      if (Array.isArray(categories) && categories.length > 0) {
        return categories;
      }

      await Promise.all(
        hardcodedCategories.map((cat) =>
          AxiosClient.post('/categories', cat).catch((err) => {
            console.warn('CategoryApi seed category failed:', cat, err?.message || err);
            return null;
          })
        )
      );

      const resumed = normalizeCategories(await AxiosClient.get('/categories'));
      return Array.isArray(resumed) && resumed.length > 0 ? resumed : hardcodedCategories;
    } catch (error) {
      console.error('CategoryApi.getAll error:', error);
      return hardcodedCategories;
    }
  },
  create: (data) => {
    return AxiosClient.post('/categories', data);
  }
};

export default CategoryApi;