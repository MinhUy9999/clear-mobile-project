import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, ActivityIndicator, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { getAllBlogs, likeBlog, dislikeBlog } from '@/apiConfig/apiBlog'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  liked: boolean;  
  disliked: boolean; 
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  const fetchBlogs = async (pageNumber: number, limit = 10) => {
    setLoading(true);
    try {
      const data = await getAllBlogs({ limit, page: pageNumber });
  
      if (data?.blogs) {
        const formattedBlogs = data.blogs.map((blog: any) => ({
          ...blog,
          likes: blog.likes.length, 
          dislikes: blog.dislikes.length, 
          liked: blog.liked, 
          disliked: blog.disliked, 
        }));
  
        setBlogs((prevBlogs) =>
          pageNumber === 1 ? formattedBlogs : [...prevBlogs, ...formattedBlogs]
        );
        setTotalPages(Math.ceil(data.counts / limit));
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
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

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBlogs(1); 
    setRefreshing(false);
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  };

  const handleLike = async (blogId: string) => {
    const token = await getToken();
    if (!token) {
      console.error('Token not found');
      return;
    }
  
    try {
      const response = await likeBlog(blogId, token); 
      const updatedBlog = response.rs; 
  
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                likes: updatedBlog.likes.length,
                dislikes: updatedBlog.dislikes.length, 
                liked: updatedBlog.likes.includes(token), 
                disliked: updatedBlog.dislikes.includes(token), 
              }
            : blog
        )
      );
    } catch (error) {
      console.error('Error liking the blog:', error);
    }
  };
  
  const handleDislike = async (blogId: string) => {
    const token = await getToken();
    if (!token) {
      console.error('Token not found');
      return;
    }
  
    try {
      const response = await dislikeBlog(blogId, token); 
      const updatedBlog = response.rs; 
  
      setBlogs((prevBlogs) =>
        prevBlogs.map((blog) =>
          blog._id === blogId
            ? {
                ...blog,
                likes: updatedBlog.likes.length, 
                dislikes: updatedBlog.dislikes.length,
                liked: updatedBlog.likes.includes(token), 
                disliked: updatedBlog.dislikes.includes(token), 
              }
            : blog
        )
      );
    } catch (error) {
      console.error('Error disliking the blog:', error);
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
          style={[styles.likeButton, item.liked && styles.likedButton]}
          onPress={() => handleLike(item._id)}
        >
          <Text style={styles.buttonText}>Like ({item.likes})</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dislikeButton, item.disliked && styles.dislikedButton]}
          onPress={() => handleDislike(item._id)}
        >
          <Text style={styles.buttonText}>Dislike ({item.dislikes})</Text>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
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
  buttonContainer: { flexDirection: 'row', marginTop: 8 },
  likeButton: {
    backgroundColor: '#4caf50',
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dislikedButton: { backgroundColor: '#f44336' },
  likedButton: { backgroundColor: '#8bc34a' },
  dislikeButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 4,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});

export default BlogList;
