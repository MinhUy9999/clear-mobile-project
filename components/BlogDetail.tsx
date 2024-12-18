import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { getBlogById, addCommentToBlog, likeBlog, dislikeBlog } from '@/apiConfig/apiBlog';

const BlogDetail = ({ route }: { route: any }) => {
  const { blogId } = route.params;
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [comment, setComment] = useState<string>('');
  const [token, setToken] = useState<string>('user-auth-token'); // Replace with actual token logic

  useEffect(() => {
    fetchBlogDetails();
  }, []);

  const fetchBlogDetails = async () => {
    setLoading(true);
    try {
      const response = await getBlogById(blogId);
      setBlog(response.blog);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    try {
      const response = await addCommentToBlog(blogId, comment, token);
      if (response.success) {
        setBlog((prev: any) => ({
          ...prev,
          reviews: response.reviews,
        }));
        setComment('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLike = async () => {
    try {
      await likeBlog(blogId, token);
      fetchBlogDetails(); // Refresh data
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleDislike = async () => {
    try {
      await dislikeBlog(blogId, token);
      fetchBlogDetails(); // Refresh data
    } catch (error) {
      console.error('Error disliking blog:', error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f61" />;
  }

  return (
    <View style={styles.container}>
      <Image source={{ uri: blog.thumb }} style={styles.image} />
      <Text style={styles.title}>{blog.title}</Text>
      <Text style={styles.description}>{blog.description.join('\n')}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.actionButton}>
          <Text>Like</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDislike} style={styles.actionButton}>
          <Text>Dislike</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        value={comment}
        onChangeText={setComment}
        placeholder="Add a comment"
        style={styles.commentInput}
      />
      <TouchableOpacity onPress={handleAddComment} style={styles.commentButton}>
        <Text>Post Comment</Text>
      </TouchableOpacity>
      <Text style={styles.sectionTitle}>Comments:</Text>
      {blog.reviews.map((review: any) => (
        <Text key={review._id}>{review.comment}</Text>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  image: { width: '100%', height: 200, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 16 },
  description: { fontSize: 16, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  actionButton: { padding: 8, backgroundColor: '#ddd', borderRadius: 4 },
  commentInput: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginBottom: 8 },
  commentButton: { backgroundColor: '#ff6f61', padding: 8, borderRadius: 4, alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 8 },
});

export default BlogDetail;
