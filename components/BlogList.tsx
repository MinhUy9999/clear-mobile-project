import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getAllBlogs } from '@/apiConfig/apiBlog'; // Adjust to your file structure
import { useNavigation } from '@react-navigation/native';

interface Blog {
  _id: string;
  title: string;
  description: string[];
  thumb: string;
  category: string;
  numberView: number;
}

const BlogList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const navigation = useNavigation();

  const fetchBlogs = async (pageNumber: number, limit = 1) => {
    console.log('Fetching blogs with params:', { pageNumber, limit });
    try {
      const data = await getAllBlogs({ limit, page: pageNumber });
      console.log('API Response:', data);

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

  const handleLoadMore = () => {
    if (page < totalPages) {
      console.log('Loading more blogs. Current page:', page);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handlePress = (blogId: string) => {
    console.log('Navigating to BlogDetail with blogId:', blogId);
    navigation.navigate('BlogDetail', { blogId });
  };

  const renderBlogItem = ({ item }: { item: Blog }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handlePress(item._id)}
    >
      <Image source={{ uri: item.thumb }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.category}>{item.category}</Text>
      <Text style={styles.views}>Views: {item.numberView}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Blogs</Text>
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
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  card: { marginBottom: 16, borderRadius: 8, backgroundColor: '#f9f9f9' },
  image: { height: 120, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  title: { fontSize: 18, fontWeight: 'bold', padding: 8, color: '#333' },
  category: { fontSize: 14, padding: 8, color: '#666' },
  views: { fontSize: 12, padding: 8, color: '#888' },
});

export default BlogList;
