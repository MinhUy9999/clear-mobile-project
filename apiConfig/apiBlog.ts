import axios from 'axios';

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://13.229.115.93:5000/api'
  : 'http://13.229.115.93:5000/api';

// Get all blogs with pagination
// Get all blogs with pagination support
export const getAllBlogs = async (params: { limit: number; page: number }) => {
    try {
      const response = await axios.get(`${BASE_URL}/blog/`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching blogs:', error.message || error);
      throw error;
    }
  }

// // Get single blog details
// export const getBlogById = async (bid) => {
//   return axios.get(`${BASE_URL}/getoneblogs/${bid}`);
// };

// // Add comment to a blog
// export const addCommentToBlog = async (bid, comment, token) => {
//   return axios.post(
//     `${BASE_URL}/createcommentblog/${bid}`,
//     { comment },
//     {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );
// };

// // Like a blog
// export const likeBlog = async (bid, token) => {
//   return axios.put(`${BASE_URL}/likes/${bid}`, {}, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// // Dislike a blog
// export const dislikeBlog = async (bid, token) => {
//   return axios.put(`${BASE_URL}/dislikes/${bid}`, {}, {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };
