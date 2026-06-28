import axiosClient from '../api/axiosClient';

const orderService = {
  create: (data) => axiosClient.post('/orders', data),
  getByCustomer: (customerId, page = 1) => axiosClient.get(`/orders/customer/${customerId}?page=${page}&pageSize=5`),
  getById: (id) => axiosClient.get(`/orders/${id}`)
};

export default orderService;

