import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { getAllBlogs, likeBlog, dislikeBlog, updateBlogView } from '@/apiConfig/apiBlog'; // Điều chỉnh theo đường dẫn của bạn
import AsyncStorage from '@react-native-async-storage/async-storage'; // Đảm bảo bạn đã cài AsyncStorage
import { useNavigation } from 'expo-router';

interface Blog {
  _id: string;
  title: string;
  description: string[];
  thumb: string;
  category: string;
  numberView: number;
  content: string;
  likes: number;
  dislikes: number;
  liked: boolean;   // Thêm trường liked để theo dõi trạng thái like của người dùng
  disliked: boolean; // Thêm trường disliked để theo dõi trạng thái dislike của người dùng
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigation = useNavigation();
  // Fetch blog data based on page and limit
  const fetchBlogs = async (pageNumber: number, limit = 10) => {
    setLoading(true);
    try {
      const data = await getAllBlogs({ limit, page: pageNumber });
      if (data?.blogs) {
        setBlogs((prevBlogs) =>
          pageNumber === 1 ? data.blogs : [...prevBlogs, ...data.blogs]
        );
        setTotalPages(Math.ceil(data.counts / limit));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error.response?.data || error.message || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);
  const handleNavigate = (blogId: string) => {
    navigation.navigate('BlogDetail', { blogId });
  };
  const handleLoadMore = () => {
    if (page < totalPages) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  // Get the token from AsyncStorage
  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  // API call to like a blog
  const handleLike = async (blogId: string) => {
    const token = await getToken();
    if (!token) {
      console.error('Token not found');
      return;
    }

    // Kiểm tra trạng thái like
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId
          ? {
              ...blog,
              likes: blog.liked ? blog.likes - 1 : blog.likes + 1, // Nếu đã like, giảm lượt like đi
              liked: !blog.liked,  // Đảo ngược trạng thái like
              numberView: blog.liked ? blog.numberView - 1 : blog.numberView + 1, // Nếu đã like, giảm view, nếu chưa like, tăng view
            }
          : blog
      )
    );

    try {
      const response = await likeBlog(blogId, token);
      const viewResponse = await updateBlogView(blogId, token); // Update view count in backend
      if (response?.data && viewResponse?.data) {
        // Số lượt like và view đã được cập nhật
      }
    } catch (error) {
      console.error('Error liking the blog:', error);
      // Nếu có lỗi, đảo ngược lại trạng thái (like và view)
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                likes: blog.liked ? blog.likes + 1 : blog.likes - 1,
                liked: !blog.liked,
                numberView: blog.liked ? blog.numberView + 1 : blog.numberView - 1,
              }
            : blog
        )
      );
    }
  };

  // API call to dislike a blog
  const handleDislike = async (blogId: string) => {
    const token = await getToken();
    if (!token) {
      console.error('Token not found');
      return;
    }

    // Kiểm tra trạng thái dislike
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog._id === blogId
          ? {
              ...blog,
              dislikes: blog.disliked ? blog.dislikes - 1 : blog.dislikes + 1, // Nếu đã dislike, giảm lượt dislike đi
              disliked: !blog.disliked,  // Đảo ngược trạng thái dislike
              numberView: blog.disliked ? blog.numberView - 1 : blog.numberView + 1, // Nếu đã dislike, giảm view, nếu chưa dislike, tăng view
            }
          : blog
      )
    );

    try {
      const response = await dislikeBlog(blogId, token);
      const viewResponse = await updateBlogView(blogId, token); // Update view count in backend
      if (response?.data && viewResponse?.data) {
        // Số lượt dislike và view đã được cập nhật
      }
    } catch (error) {
      console.error('Error disliking the blog:', error);
      // Nếu có lỗi, đảo ngược lại trạng thái (dislike và view)
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                dislikes: blog.disliked ? blog.dislikes + 1 : blog.dislikes - 1,
                disliked: !blog.disliked,
                numberView: blog.disliked ? blog.numberView + 1 : blog.numberView - 1,
              }
            : blog
        )
      );
    }
  };

  const renderBlogItem = ({ item }: { item: Blog }) => (
    <View style={styles.card}>
        <TouchableOpacity onPress={() => handleNavigate(item._id)}>
      <Image source={{ uri: item.thumb }} style={styles.image} />
    </TouchableOpacity>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.views}>Views: {item.numberView}</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.likeButton, item.liked && styles.likedButton]} // Thêm lớp likedButton nếu đã like
          onPress={() => handleLike(item._id)}
        >
          <Text style={styles.buttonText}>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dislikeButton, item.disliked && styles.dislikedButton]} // Thêm lớp dislikedButton nếu đã dislike
          onPress={() => handleDislike(item._id)}
        >
          <Text style={styles.buttonText}>Dislike</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && blogs.length === 0 ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : (
        <FlatList
          data={blogs}
          keyExtractor={(item) => item._id}
          renderItem={renderBlogItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && page < totalPages ? (
              <ActivityIndicator size="small" color="#ff6f61" />
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: { marginBottom: 16, borderRadius: 8, backgroundColor: '#f9f9f9', elevation: 3, padding: 16 },
  image: { height: 120, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  category: { fontSize: 14, color: '#666' },
  views: { fontSize: 12, color: '#888' },
  likes: { fontSize: 12, color: '#ff6f61', marginTop: 8 },
  buttonContainer: { flexDirection: 'row', marginTop: 8 },
  likeButton: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dislikedButton: { backgroundColor: '#f44336' }, // Thêm màu cho nút dislike khi đã bấm
  likedButton: { backgroundColor: '#8bc34a' }, // Thêm màu cho nút like khi đã bấm
  dislikeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default BlogList;
