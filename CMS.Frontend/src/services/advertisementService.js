import axiosClient from '../api/axiosClient';

const advertisementService = {
  getAll: () => axiosClient.get('/advertisements')
};

export default advertisementService;
