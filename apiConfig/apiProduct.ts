import axios from 'axios';

// Kiểm tra môi trường để thiết lập baseURL phù hợp
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://13.229.115.93:5000/api' 
  : 'http://localhost:5000/api';

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
  export const getAllCategories = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/productCategory`);
      return response.data; // Return category data
    } catch (error: any) {
      console.error('Error fetching categories:', error.message);
      throw error;
    }
  };

  // Update product rating
  export const submitProductRating = async (
    pid: string,
    star: number,
    comment: string,
    token: string | null
  ) => {
    console.log('Calling updateProductRating API...');
    console.log('Payload:', { pid, star, comment });
    console.log('Token:', token);
  
    try {
      const response = await axios.put(
        `${BASE_URL}/products/ratings`,
        { pid, star, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('API response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error calling updateProductRating API:', error.message);
      throw error;
    }
  };
  
