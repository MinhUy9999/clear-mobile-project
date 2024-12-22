import axios from 'axios';

// Kiểm tra môi trường để thiết lập baseURL phù hợp
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://13.229.115.93:5000/api' 
  : 'http://13.229.115.93:5000/api';

// Lấy tất cả sản phẩm
export const getAllProducts = async () => {
    return await axios.get(`${BASE_URL}/products`);
  };
// Lấy chi tiết sản phẩm theo ID
export const getProductById = async (pid: string) => {
    try {
      const response = await axios.get(`${BASE_URL}/products/${pid}`);
      return response.data; // Trả về dữ liệu sản phẩm
    } catch (error: any) {
      console.error('Error fetching product by ID:', error.message);
      throw error;
    }
  };