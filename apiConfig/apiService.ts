import axios from 'axios';

// Kiểm tra môi trường để thiết lập baseURL phù hợp
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://13.229.115.93:5000/api' // Địa chỉ IP của máy tính khi dùng Expo
  : 'http://13.229.115.93:5000/api';

// các api services
export const getAllServices = async () => {
    return await axios.get(`${BASE_URL}/service`);
  };

export const getOneService = async (serviceId: string) => {
    return await axios.get(`${BASE_URL}/service/${serviceId}`);
  };