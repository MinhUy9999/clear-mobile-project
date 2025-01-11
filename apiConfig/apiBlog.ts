import axios from 'axios';

// Set base URL depending on environment
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:5000/api'
  : 'https://project3-dq33.onrender.com/api';

// Get all blogs with pagination
export const getAllBlogs = async (params: { limit: number; page: number }) => {
  try {
    const response = await axios.get(`${BASE_URL}/blog/`, { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching blogs:', error.message || error);
    throw error;
  }
};

// Get single blog details by ID
export const getBlogById = async (bid: string) => {
  try {
    const response = await axios.get(`${BASE_URL}/blog/getoneblogs/${bid}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching blog by ID:', error.message || error);
    throw error;
  }
};

// Add a comment to a blog
export const addCommentToBlog = async (blogId: string, comment: string, token: string) => {
  const response = await fetch(`http://localhost:5000/api/blog/createcommentblog/${blogId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ comment }),
  });

  if (!response.ok) {
    throw new Error(`Failed to add comment: ${response.statusText}`);
  }
  return await response.json();
};


// Like a blog
export const likeBlog = async (bid: string, token: string) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/blog/likes/${bid}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error liking blog:', error.message || error);
    throw error;
  }
};

// Dislike a blog
export const dislikeBlog = async (bid: string, token: string) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/blog/dislikes/${bid}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error disliking blog:', error.message || error);
    throw error;
  }
};
