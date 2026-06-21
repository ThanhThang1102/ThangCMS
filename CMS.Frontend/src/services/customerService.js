import axiosClient from '../api/axiosClient';

const customerService = {
  login: (data) => axiosClient.post('/customers/login', data),
  register: (data) => axiosClient.post('/customers', data),
  update: (id, data) => axiosClient.put(`/customers/${id}`, data),
  forgotPassword: (data) => axiosClient.post('/customers/forgot-password', data),
  changePassword: (id, data) => axiosClient.post(`/customers/${id}/change-password`, data)
};

export default customerService;

