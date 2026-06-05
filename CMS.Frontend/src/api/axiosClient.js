import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:5035/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export default axiosClient;
