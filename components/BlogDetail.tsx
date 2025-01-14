import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { getBlogById, addCommentToBlog } from '@/apiConfig/apiBlog'; // Adjust according to your API config
import { RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface BlogDetailProps {
  _id: string;
  title: string;
  description: string[];
  thumb: string;
  category: string;
  numberView: number;
  reviews: { user: { firstname: string; lastname: string }; comment: string }[];
}

const BlogDetail = () => {
  const route = useRoute<RouteProp<{ params: { blogId: string } }, 'params'>>();
  const { blogId } = route.params;
  const [blog, setBlog] = useState<BlogDetailProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false); // Modal visibility state
  const [errorMessage, setErrorMessage] = useState<string>(''); // Error message state


  const navigation = useNavigation();

  const fetchBlogDetails = async () => {
    try {
      const data = await getBlogById(blogId);
      setBlog(data.blog);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchToken = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    } catch (error) {
      console.error('Error fetching token:', error);
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCommentSubmit = async () => {
    if (!token || !comment) {
      setErrorMessage('Vui lòng đăng nhập và nhập bình luận!');
      setErrorModalVisible(true);
      return;
    }
  
    try {
      const response = await addCommentToBlog(blogId, comment, token);
      setBlog((prevBlog) => {
        if (prevBlog) {
          return {
            ...prevBlog,
            reviews: [...(prevBlog.reviews || []), response.review],
          };
        }
        return prevBlog;
      });
      setComment('');
    } catch (error) {
      // Kiểm tra lỗi từ server
      if (error.response?.data?.message === 'You can only update your comment every 20 minutes') {
        setErrorMessage('Bạn chỉ có thể cập nhật bình luận sau mỗi 20 phút.');
      } else {
        setErrorMessage('Bạn chỉ có thể cập nhật bình luận sau mỗi 20 phút.');
      }
      setErrorModalVisible(true);
    }
  };
  

  useEffect(() => {
    fetchBlogDetails();
    fetchToken();
  }, [blogId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f61" />;
  }

  if (!blog) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Không tìm thấy bài viết.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Image source={{ uri: blog.thumb }} style={styles.image} />
      <Text style={styles.title}>{blog.title}</Text>
      <Text style={styles.category}>{blog.category}</Text>
      <Text style={styles.views}>Views: {blog.numberView}</Text>
      <Text style={styles.description}>{(blog.description || []).join('\n\n')}</Text>

      <TextInput
        style={styles.commentInput}
        placeholder="Nhập bình luận..."
        value={comment}
        onChangeText={setComment}
      />
      <TouchableOpacity onPress={handleCommentSubmit} style={styles.submitButton}>
        <Text style={styles.buttonText}>Gửi Bình Luận</Text>
      </TouchableOpacity>

      <Text style={styles.commentsTitle}>Bình luận:</Text>
      {(blog.reviews || []).length > 0 ? (
  blog.reviews.map((review, index) => {
    if (review && review.user) {
      return (
        <View key={index} style={styles.comment}>
          <Text style={styles.commentUser}>
            {review.user.firstname} {review.user.lastname}
          </Text>
          <Text style={styles.commentText}>{review.comment}</Text>
        </View>
      );
    }
    return null; // Return null if review or review.user is undefined
  })
) : (
  <Text>Chưa có bình luận nào.</Text>
)}


      {/* Error Modal */}
      {/* Error Modal */}
<Modal
  animationType="slide"
  transparent={true}
  visible={errorModalVisible}
  onRequestClose={() => setErrorModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalText}>{errorMessage}</Text>
      <TouchableOpacity
        onPress={() => setErrorModalVisible(false)}
        style={styles.modalButton}
      >
        <Text style={styles.modalButtonText}>Đóng</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#333' },
  category: { fontSize: 16, marginVertical: 8, color: '#666' },
  views: { fontSize: 14, color: '#888' },
  description: { fontSize: 16, marginTop: 16, color: '#333' },
  commentsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 24 },
  comment: { marginTop: 8, padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  commentUser: { fontWeight: 'bold', color: '#333' },
  commentText: { color: '#555' },
  commentInput: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginTop: 16 },
  submitButton: { backgroundColor: '#ff6f61', padding: 10, borderRadius: 5, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  errorText: { color: '#f44336', fontSize: 18, fontWeight: 'bold' },
  goBackButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#333', // Square button color
    borderRadius: 50, // Round button shape
    padding: 10,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#ff6f61',
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default BlogDetail;
