import axiosClient from '../api/axiosClient';

const postService = {
  getAll: () => axiosClient.get('/posts'),
  getById: (id) => axiosClient.get(`/posts/${id}`),
  getByCategory: (categoryId) => axiosClient.get(`/posts/category/${categoryId}`),
};

export default postService;
