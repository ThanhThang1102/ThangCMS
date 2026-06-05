import axiosClient from '../api/axiosClient';

const categoryProductService = {
  getAll: () => axiosClient.get('/categoriesproducts'),
};

export default categoryProductService;
