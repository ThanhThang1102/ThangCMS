import axiosClient from '../api/axiosClient';

const customerService = {
  login: (data) => axiosClient.post('/customers/login', data),
  register: (data) => axiosClient.post('/customers', data)
};

export default customerService;
