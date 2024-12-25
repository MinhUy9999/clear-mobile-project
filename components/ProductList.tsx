import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAllProducts } from '@/apiConfig/apiProduct';
import { useNavigation } from '@react-navigation/native';

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
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handlePress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
       <TouchableOpacity onPress={() => handlePress(item._id)}>
        <Image source={{ uri: item.thumb }} style={styles.productImage} />
      </TouchableOpacity>
      <Text style={styles.productTitle}>{item.title}</Text>
      <TouchableOpacity
        style={styles.priceButton}
        onPress={() => handlePress(item._id)}
      >
        <FontAwesome name="money" size={16} color="#002DB7" />
        <Text style={styles.priceText}>
          {item.price.toLocaleString()} VND
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      <Text style={styles.sectionTitle}>Available Products</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : (
        <FlatList
          data={products}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 0,
    color: '#333',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    margin: 8,
    color: '#333',
  },
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE329',
    marginHorizontal: 8,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 4,
  },
  priceText: {
    fontSize: 14,
    color: '#002DB7',
    fontWeight: 'bold',
    marginLeft: 4,
  },
});
