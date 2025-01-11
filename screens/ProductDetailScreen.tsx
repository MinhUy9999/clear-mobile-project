import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  TextInput,
} from 'react-native';
import { getProductById, submitProductRating } from '@/apiConfig/apiProduct';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, updateCart } from '@/apiConfig/apiUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Product {
  _id: string;
  title: string;
  brand: string;
  price: number;
  category: string;
  color: string;
  thumb: string;
  quantity: number;
  sold: number;
  totalRatings: number;
  ratings: { star: number; postedBy: string; comment: string }[];
  description: string[];
  images: string[];
}
interface User {
  _id: string;
  firstname: string;
  lastname: string;
}

interface Rating {
  star: number;
  comment: string;
  postedBy: string | User; // `postedBy` có thể là một chuỗi hoặc một đối tượng User
}
type ProductDetailScreenRouteProp = RouteProp<
  { params: { productId: string } },
  'params'
>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { productId } = route.params;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false); 
  const [modalMessage, setModalMessage] = useState(''); 
  const [modalType, setModalType] = useState(''); 
  const [rating, setRating] = useState<number>(0); // Lưu đánh giá của người dùng
const [comment, setComment] = useState<string>(''); // Lưu bình luận của người dùng
const [submitting, setSubmitting] = useState<boolean>(false);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        const response = await getProductById(productId);
        if (response?.success) {
          setProduct(response.productData);
        } else {
          console.error('Error fetching product details');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      const currentUser = await getCurrentUser();

      if (!currentUser || !currentUser.success) {
        // User chưa đăng nhập => yêu cầu đăng nhập
        setModalMessage('You need to log in to add products to your cart.');
        setModalType('error');
        setModalVisible(true);
        setAddingToCart(false);
        return;
      }

      // Thêm sản phẩm vào cart
      const cartData = {
        pid: product._id,
        quantity: 1,
        color: product.color,
        price: product.price,
        title: product.title,
        thumb: product.thumb,
      };

      await updateCart(cartData);

      // Hiển thị Modal thông báo thêm thành công
      setModalMessage('Product added to cart!');
      setModalType('success');
      setModalVisible(true);

      // *** BỎ ĐI DÒNG ĐIỀU HƯỚNG ***
      // navigation.navigate('MainTabs', { screen: 'Cart' });

    } catch (error) {
      setModalMessage('Unable to add product to cart.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setAddingToCart(false);
    }
  };

  // Đóng Modal
  const closeModal = () => {
    setModalVisible(false);
    if (modalType === 'error') {
      //@ts-ignore
      navigation.navigate('Login'); // Nếu là lỗi => chuyển hướng sang Login
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f61" />;
  }

  // Hàm để gửi đánh giá
  const handleSubmitRating = async () => {
    if (!rating || !comment.trim()) {
      Alert.alert('Error', 'Please provide both a rating and a comment.');
      return;
    }
  
    try {
      setSubmitting(true);
  
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'You need to log in to submit a rating.');
        return;
      }
  
      console.log('Submitting rating...');
      const response = await submitProductRating(productId, rating, comment, token);
      console.log('API response for submitted rating:', response);
  
      // Cập nhật lại state sản phẩm để hiển thị đánh giá mới
      setProduct(response.updateProduct);
      console.log('Updated product data with new rating:', response.updateProduct.ratings);
  
      setRating(0);
      setComment('');
      Alert.alert('Success', 'Your rating has been submitted!');
    } catch (error) {
      console.error('Error submitting rating:', error.message);
      Alert.alert('Error', 'Failed to submit your rating. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.goBackButton}>
        <Ionicons name="chevron-back-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {product ? (
        <>
          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.thumb }} style={styles.image} />
           
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

       {/* Ratings Section */}
{/* Ratings Section */}
{/* Ratings Section */}
<Text style={styles.specsTitle}>Ratings</Text>
<View style={styles.ratingContainer}>
{product?.ratings?.length ? (
  product.ratings.map((rating, index) => (
    <View key={index} style={styles.ratingCommentContainer}>
      <Text style={styles.commentStar}>⭐ {rating.star}</Text>
      <Text style={styles.commentText}>{rating.comment}</Text>
      <Text style={styles.commentUser}>
        - By {typeof rating.postedBy === 'object' && 'firstname' in rating.postedBy
        //@ts-ignore
          ? rating.postedBy.firstname
          : 'Anonymous'}
      </Text>
    </View>
  ))
) : (
  <Text style={styles.emptyRatingsText}>No ratings yet. Be the first to rate!</Text>
)}

</View>

<View style={styles.addRatingContainer}>
  <Text style={styles.formTitle}>Add Your Rating</Text>
  <View style={styles.ratingInputContainer}>
    <Text style={styles.label}>Your Rating:</Text>
    <View style={styles.ratingStars}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => setRating(star)}
          // style={[styles.star, star <= rating && styles.selectedStar]}
        >
          <Ionicons
            name="star"
            size={24}
            color={star <= rating ? '#FFD700' : '#ccc'}
          />
        </TouchableOpacity>
      ))}
    </View>
  </View>
  <Text style={styles.label}>Your Comment:</Text>
  <TextInput
    style={styles.commentInput}
    value={comment}
    onChangeText={setComment}
    placeholder="Write your comment here..."
    multiline
  />
  <TouchableOpacity
    style={styles.submitButton}
    onPress={handleSubmitRating}
    disabled={submitting}
  >
    <Text style={styles.submitButtonText}>
      {submitting ? 'Submitting...' : 'Submit'}
    </Text>
  </TouchableOpacity>
</View>



          {/* Description */}
          <Text style={styles.specsTitle}>Description</Text>
          <Text style={styles.description}>{product.description.join('\n')}</Text>

          {/* Product Specifications */}
          <Text style={styles.specsTitle}>Product Details</Text>
          <View style={styles.specsContainer}>
            <Text style={styles.specText}>Brand: {product.brand}</Text>
            <Text style={styles.specText}>Category: {product.category}</Text>
            <Text style={styles.specText}>Color: {product.color}</Text>
            <Text style={styles.specText}>Quantity: {product.quantity}</Text>
            <Text style={styles.specText}>Sold: {product.sold}</Text>
            <Text style={styles.specText}>Total Ratings: {product.totalRatings}</Text>
          </View>

      

          {/* Price & Add to Cart */}
          <View style={styles.bottomContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{product.price.toLocaleString()} VND</Text>
            </View>

            <Animatable.View animation="pulse" iterationCount="infinite" duration={1500}>
              <TouchableOpacity
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                disabled={addingToCart}
              >
                <Text style={styles.addToCartText}>
                  {addingToCart ? 'Adding...' : '+ Add To Cart'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>Product not found</Text>
      )}

      {/* Modal */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={[styles.modalTitle, modalType === 'error' && styles.errorText]}>
              {modalType === 'success' ? 'Success' : 'Error'}
            </Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalButton}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 30,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 8,
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  ratingText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#555',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginVertical: 8,
  },
  specsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  specsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  specText: {
    fontSize: 14,
    color: '#555',
    marginVertical: 4,
  },
  ratingCommentContainer: {
    marginTop: 10,
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
  },
  commentStar: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
    marginTop: 4,
  },
  commentUser: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
    color: '#555',
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  priceContainer: {
    padding: 12,
    backgroundColor: '#002DB7',
    borderRadius: 8,
  },
  price: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addToCartButton: {
    backgroundColor: '#FFE329',
    padding: 10,
    borderRadius: 4,
  },
  addToCartText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  goBackButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 16,
  },
  /* Modal Styles */
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  modalButton: {
    fontSize: 16,
    color: '#002DB7',
    fontWeight: 'bold',
  },
  // ratingContainer: {
  //   marginTop: 10,
  //   backgroundColor: '#f1f1f1',
  //   padding: 10,
  //   borderRadius: 5,
  // },
  // ratingCommentContainer: {
  //   marginBottom: 10,
  //   backgroundColor: '#fff',
  //   padding: 10,
  //   borderRadius: 5,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 1 },
  //   shadowOpacity: 0.2,
  //   shadowRadius: 2,
  //   elevation: 2,
  // },
  // commentStar: {
  //   fontSize: 14,
  //   fontWeight: 'bold',
  // },
  // commentText: {
  //   fontSize: 14,
  //   marginTop: 4,
  //   color: '#555',
  // },
  // commentUser: {
  //   fontSize: 12,
  //   fontStyle: 'italic',
  //   marginTop: 2,
  //   color: '#777',
  // },
  emptyRatingsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  addRatingContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ratingInputContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  ratingStars: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  star: {
    marginHorizontal: 5,
  },
  selectedStar: {
    color: '#FFD700',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: '#002DB7',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
});

export default ProductDetailScreen;
