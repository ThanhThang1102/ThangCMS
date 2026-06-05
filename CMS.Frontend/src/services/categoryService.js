import axiosClient from '../api/axiosClient';

const categoryService = {
  getAll: () => axiosClient.get('/categories'),
  getById: (id) => axiosClient.get(`/categories/${id}`),
};

export default categoryService;
