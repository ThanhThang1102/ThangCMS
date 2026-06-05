import axiosClient from '../api/axiosClient';

const orderService = {
  create: (data) => axiosClient.post('/orders', data)
};

export default orderService;
