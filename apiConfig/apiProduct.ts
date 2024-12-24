import axios from 'axios';

// Kiểm tra môi trường để thiết lập baseURL phù hợp
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://192.168.100.27:5000/api' 
  : 'http://localhost:5000:5000/api';

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
export const updateProductRating = async (pid: string, star: number, comment: string, token: string) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/products/ratings`,
      { pid, star, comment },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Add user token for verification
        },
      }
    );
    return response.data; // Return updated product data
  } catch (error: any) {
    console.error('Error updating product rating:', error.message);
    throw error;
  }
};
