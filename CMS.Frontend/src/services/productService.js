import axiosClient from '../api/axiosClient';

const productService = {
  getAll: () => axiosClient.get('/products'),
  getById: (id) => axiosClient.get(`/products/${id}`),
  getByCategory: (categoryProductId) => axiosClient.get(`/products/category/${categoryProductId}`),
  getNewest: () => axiosClient.get('/products/newest'),
  getBestSellers: () => axiosClient.get('/products/bestsellers'),
};

export default productService;
