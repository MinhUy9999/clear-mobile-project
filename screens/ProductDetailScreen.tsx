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
} from 'react-native';
import { getProductById } from '@/apiConfig/apiProduct';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { getCurrentUser, updateCart } from '@/apiConfig/apiUser';

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
        // User is not logged in, show modal
        setModalMessage('You need to log in to add products to your cart.');
        setModalType('error');
        setModalVisible(true);
        setAddingToCart(false);
        return;
      }

      // Add product to cart
      const cartData = {
        pid: product._id,
        quantity: 1,
        color: product.color,
        price: product.price,
        title: product.title,
        thumb: product.thumb,
      };

      await updateCart(cartData);

      setModalMessage('Product added to cart!');
      setModalType('success');
      setModalVisible(true);
      navigation.navigate('MainTabs', { screen: 'Cart' }); // Navigate to Cart tab
    } catch (error) {
      // console.error('Error adding to cart:', error);
      setModalMessage('Unable to add product to cart.');
      setModalType('error');
      setModalVisible(true);
    } finally {
      setAddingToCart(false);
    }
  };

  // Close Modal
  const closeModal = () => {
    setModalVisible(false);
    if (modalType === 'error') {
      navigation.navigate('Login'); // Redirect to Login screen on error
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f61" />;
  }

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
            <TouchableOpacity style={styles.favoriteIcon}>
              <Ionicons name="heart-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>{product.title}</Text>

          {/* Ratings */}
          <View style={styles.ratingContainer}>
            {[...Array(5)].map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.round(product.totalRatings) ? 'star' : 'star-outline'}
                size={20}
                color="#FFC107"
              />
            ))}
            <Text style={styles.ratingText}>{product.totalRatings} / 5</Text>
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

          {/* Ratings Comments */}
          <Text style={styles.specsTitle}>Customer Ratings</Text>
          {product.ratings.length > 0 ? (
            product.ratings.map((rating, index) => (
              <View key={index} style={styles.ratingCommentContainer}>
                <Text style={styles.commentStar}>Rating: {rating.star} / 5</Text>
                <Text style={styles.commentText}>Comment: {rating.comment}</Text>
                <Text style={styles.commentUser}>By: {rating.postedBy}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.specText}>No ratings yet</Text>
          )}

          {/* Price */}
          <View style={styles.bottomContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.price}>{product.price.toLocaleString()} VND</Text>
            </View>

            {/* Add To Cart Button */}
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
    padding: 5,
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
  favoriteIcon: { position: 'absolute', top: 10, right: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, color: '#333' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  ratingText: { fontSize: 16, marginLeft: 8, color: '#555' },
  description: { fontSize: 14, color: '#666', marginVertical: 8 },
  specsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  specsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  specText: { fontSize: 14, color: '#555', marginVertical: 4 },
  ratingCommentContainer: {
    marginTop: 10,
    backgroundColor: '#f1f1f1',
    padding: 10,
    borderRadius: 5,
  },
  commentStar: { fontSize: 14, fontWeight: 'bold' },
  commentText: { fontSize: 14, marginTop: 4 },
  commentUser: { fontSize: 12, fontStyle: 'italic', marginTop: 2, color: '#555' },
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
  currency: { fontSize: 18, color: '#333', fontWeight: 'bold' },
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
  addToCartText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },

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
  goBackButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 16,
  }
});

export default ProductDetailScreen;
