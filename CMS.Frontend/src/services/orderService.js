import axiosClient from '../api/axiosClient';

const orderService = {
  create: (data) => axiosClient.post('/orders', data),
  getByCustomer: (customerId) => axiosClient.get(`/orders/customer/${customerId}`),
  getById: (id) => axiosClient.get(`/orders/${id}`)
};

export default orderService;

