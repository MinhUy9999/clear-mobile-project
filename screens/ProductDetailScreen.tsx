import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { getProductById } from '@/apiConfig/apiProduct';
import { RouteProp, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

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

 

  if (loading) {
    return <ActivityIndicator size="large" color="#ff6f61" />;
  }

  return (
    <ScrollView style={styles.container}>
      {product ? (
        <>
          {/* Product Image and SALE Badge */}
          <View style={styles.imageContainer}>
            <Image source={{ uri: product.thumb }} style={styles.image} />
            <View style={styles.saleBadge}>
              <Text style={styles.saleText}>SALE</Text>
            </View>
            <TouchableOpacity style={styles.favoriteIcon}>
              <Ionicons name="heart-outline" size={24} color="red" />
            </TouchableOpacity>
          </View>

          {/* Title and Ratings */}
          <Text style={styles.title}>{product.title}</Text>
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
          <Text style={styles.description}>{product.description.join(' ')}</Text>

          {/* Specifications */}
          <Text style={styles.specsTitle}>Specifications</Text>
          <View style={styles.specsContainer}>
            <Text style={styles.specText}>Brand: {product.brand}</Text>
            <Text style={styles.specText}>Color: {product.color}</Text>
            <Text style={styles.specText}>Category: {product.category}</Text>
            <Text style={styles.specText}>Quantity: {product.quantity}</Text>
            <Text style={styles.specText}>Sold: {product.sold}</Text>
         
          </View>

          {/* Price and Add To Cart */}
          <View style={styles.bottomContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.currency}>Rp.</Text>
              <Text style={styles.price}>
                {product.price.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>+ Add To Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <Text style={styles.errorText}>Product not found</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 30 },
  imageContainer: { position: 'relative', alignItems: 'center' },
  image: { width: '100%', height: 250, borderRadius: 8 },
  saleBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFC107',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  saleText: { fontSize: 12, fontWeight: 'bold', color: '#fff' },
  favoriteIcon: { position: 'absolute', top: 10, right: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginVertical: 8, color: '#333' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  ratingText: { fontSize: 16, marginLeft: 8, color: '#555', fontWeight: 'bold' },
  description: { fontSize: 14, color: '#666', marginVertical: 8 },
  specsTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  specsContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  specText: { fontSize: 14, color: '#555', marginVertical: 4 },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  priceContainer: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 18, color: '#333', fontWeight: 'bold' },
  price: { fontSize: 24, color: '#002DB7', fontWeight: 'bold' },
  addToCartButton: {
    backgroundColor: '#002DB7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  addToCartText: { fontSize: 16, color: '#fff', fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
});

export default ProductDetailScreen;
