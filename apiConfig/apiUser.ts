import axios from 'axios';
import  AsyncStorage  from '@react-native-async-storage/async-storage';

// Kiểm tra môi trường để thiết lập baseURL phù hợp
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://192.168.100.27:5000/api' // Địa chỉ IP của máy tính khi dùng Expo (thay đổi tùy theo môi trường thực tế)
  : 'http://localhost:5000/api'; // Địa chỉ khi chạy môi trường production hoặc tạo app build

// Tạo instance của axios với baseURL và header mặc định
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});
// Thêm interceptor để tự động gắn token vào mỗi request
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token'); // Hoặc lấy token từ Context
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// // Thêm interceptor để xử lý lỗi 401 (Unauthorized)
// axiosInstance.interceptors.response.use(
//   (response) => response, // Nếu không có lỗi, tiếp tục xử lý
//   async (error) => {
//     const originalRequest = error.config;

//     // Nếu nhận được lỗi 401 (Unauthorized), tức là token đã hết hạn
//     if (error.response?.status === 401) {
//       console.error('Token expired or invalid. Please login again.');

//       // Xóa token khỏi AsyncStorage
//       await AsyncStorage.removeItem('token');

//       return Promise.reject('Unauthorized. Please log in.');
//     }

//     // Xử lý các lỗi khác (nếu có)
//     return Promise.reject(error);
//   }
// );


export default axiosInstance;

// Đăng ký người dùng
export const registerUser = async (userData: {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
  mobile: string;
}) => {
  try {
    const response = await axiosInstance.post('/user/register', userData);
    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error in registerUser:', error.response || error.message);
    throw error;
  }
};

// Đăng nhập người dùng
export const loginUser = async (email: string, password: string) => {
  try {
    console.log("loginUser", email, password);
    const response = await axiosInstance.post('/user/login', { email, password });
    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error in loginUser:', error.response || error.message);
    throw error;
  }
};

// Quên mật khẩu
export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance.post('/user/forgotpassword', { email });
    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error in forgotPassword:', error.response || error.message);
    throw error;
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await axiosInstance.put('/user/resetpassword', { token, password });
    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error in resetPassword:', error.response || error.message);
    throw error;
  }
};

// Đăng xuất người dùng
export const logoutUser = async () => {
    try {
      console.log("Sending logout request...");
      const token = await AsyncStorage.getItem("token");
      const response = await axiosInstance.get("/user/logout", {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token qua header Authorization
        },
      });
  
      console.log("Logout API success:", response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error("Logout API failed:", error.response || error.message);
      return { success: false, message: error.response?.data?.message || "Logout failed" };
    }
  };
  
  
  

// GET current user
export const getCurrentUser = async () => {
  try {
    const response = await axiosInstance.get('/user/current');
    return response.data; 
  } catch (error: any) {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token'); 

    }
    throw error;
  }
};


export const updateCart = async (cartData: {
  pid: string;
  quantity: number;
  color: string;
  price: number;
  title: string;
  thumb: string;
}) => {
  try {
    const response = await axiosInstance.put('user/cart', cartData);
    return response.data; 
  } catch (error: any) {
    if (error === 'Unauthorized. Please log in.') {
      console.error('Session expired. Please log in.');
    } else {
      console.error('Error updating cart:', error.message);
    }
    throw error;
  }
};

export const removeProductFromCart = async (pid: string): Promise<any> => {
  try {
    const response = await axiosInstance.delete(`user/remove-cart/${pid}`);
    return response.data; // Trả về dữ liệu phản hồi từ API
  } catch (error: any) {
    console.error('Error in removeProductFromCart API:', error.response || error.message);

    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token'); // Xóa token nếu lỗi 401
      throw new Error('Unauthorized. Please log in again.');
    }

    throw new Error(
      error.response?.data?.message || 'Failed to remove product from cart. Try again later.'
    );
  }
};



export const updateCurrentUser = async (userData: {
  firstname?: string;
  lastname?: string;
  email?: string;
  mobile?: string;
  address?: string;
  avatar?: {
    uri: string;
    name?: string;
    type?: string;
  };
}) => {
  try {
    const formData = new FormData();

    Object.entries(userData).forEach(([key, value]) => {
      if (value) {
        if (key === 'avatar' && value.uri) {
          formData.append(
            key,
            {
              uri: value.uri,
              name: value.name || 'avatar.jpg',
              type: value.mimeType || 'image/jpeg',
            } as any
          );
        } else {
          formData.append(key, value as string);
        }
      }
    });

    const response = await axiosInstance.put('/user/current', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error updating current user:', error.response || error.message);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw error;
  }
};

export const getUserOrders = async (queryParams: Record<string, any> = {}) => {
  try {
    const queryString = new URLSearchParams(queryParams).toString();
    const response = await axiosInstance.get(`/order${queryString ? `?${queryString}` : ''}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user orders:', error.response || error.message);
    throw error;
  }
};