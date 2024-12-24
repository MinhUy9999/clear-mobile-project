import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome } from '@expo/vector-icons';
import { getAllProducts, getAllCategories } from '@/apiConfig/apiProduct';
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

interface Category {
  _id: string;
  title: string;
  brand: string[];
}



export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getAllProducts();
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        setCategories([{ _id: 'All', title: 'All', brand: [] }, ...response.getallCategory]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handlePress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const filterProducts = () => {
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter((product) => product.category === selectedCategory);
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handlePress(item._id)}>
      <Image source={{ uri: item.thumb }} style={styles.productImage} />
      <Text style={styles.productTitle}>{item.title}</Text>
      <View style={styles.priceContainer}>
        <FontAwesome name="money" size={16} color="#002DB7" />
        <Text style={styles.priceText}>{item.price.toLocaleString()} VND</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Products</Text>

      {/* Category Selector */}
      <View style={styles.pickerContainer}>
        {loadingCategories ? (
          <ActivityIndicator size="small" color="#ff6f61" />
        ) : (
          <Picker
            selectedValue={selectedCategory}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
          >
            {categories.map((category) => (
              <Picker.Item key={category._id} label={category.title} value={category.title} />
            ))}
          </Picker>
        )}
      </View>

      {/* Product List */}
      {loadingProducts ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : (
        <FlatList
          data={filterProducts()}
          numColumns={2}
          keyExtractor={(item) => item._id}
          renderItem={renderProductItem}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9F9F9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  pickerContainer: {
    alignSelf: 'flex-end', // Position the picker to the right
    width: '50%', // Set width to half of the screen
    backgroundColor: '#FFE329', // Yellow background
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  picker: {
    color: '#002DB7', // Blue text color
    height: 50,
    width: '100%',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    margin: 8,
    color: '#333',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFE329',
    marginHorizontal: 8,
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
