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
  
  
  

// Lấy thông tin người dùng hiện tại
export const fetchCurrentUser = async () => {
  try {
    console.log('fetchCurrentUser is called');
    const response = await axiosInstance.get('/user/current');
    return { success: true, rs: response.data };
  } catch (error: any) {
    console.error('Error in fetchCurrentUser:', error.response || error.message);
    if (error.response?.status === 401) {
      throw new Error('Unauthorized');
    }
    throw error;
  }
};

// Cập nhật thông tin người dùng
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

    // Duyệt qua từng key trong userData và thêm vào formData
    Object.entries(userData).forEach(([key, value]) => {
      if (value) {
        if (key === 'avatar' && value.uri) {
          formData.append(
            key,
            {
              uri: value.uri,
              name: value.name || 'avatar.jpg',
              type: value.type || 'image/jpeg',
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
