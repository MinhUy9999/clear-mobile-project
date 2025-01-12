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
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
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
  const [page, setPage] = useState<number>(1);
const [limit] = useState<number>(10);
const [hasMore, setHasMore] = useState<boolean>(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [loadingCategories, setLoadingCategories] = useState<boolean>(true);
  const [minPrice, setMinPrice] = useState<number>(0);
const [maxPrice, setMaxPrice] = useState<number>(0);
const [searchKeyword, setSearchKeyword] = useState<string>('');

  const navigation = useNavigation();

  const fetchProducts = async (isLoadMore = false) => {
    if (!hasMore && isLoadMore) return;

    try {
      setLoadingProducts(true);
      const response = await getAllProducts(page, limit);

      const newProducts = response.data.products || [];

      if (isLoadMore) {
        setProducts((prevProducts) => [...prevProducts, ...newProducts]);
      } else {
        setProducts(newProducts);
      }

      // Kiểm tra xem còn dữ liệu để load không
      if (newProducts.length < limit) {
        setHasMore(false);
      } else {
        setPage((prevPage) => prevPage + 1);
      }
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleLoadMore = () => {
    if (!loadingProducts) {
      fetchProducts(true);
    }
  };
 
  
  const handlePress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
  };

  const filterProducts = () => {
    let filteredProducts = products;
  
    // Lọc theo danh mục
    if (selectedCategory !== 'All') {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === selectedCategory
      );
    }
  
     // Lọc theo khoảng giá (chỉ áp dụng nếu minPrice hoặc maxPrice khác 0)
  if (minPrice > 0 || maxPrice > 0) {
    filteredProducts = filteredProducts.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice
    );
  }
  
    // Lọc theo từ khóa tìm kiếm
    if (searchKeyword.trim()) {
      filteredProducts = filteredProducts.filter((product) =>
        product.title.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }
  
    return filteredProducts;
  };
  
  

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handlePress(item._id)}>
      <Image source={{ uri: item.thumb }} style={styles.productImage} />

      <Text style={styles.productTitle} numberOfLines={1} ellipsizeMode="tail">{item.title}</Text>

      <View style={styles.priceContainer}>
        <FontAwesome name="money" size={16} color="#002DB7" />
        <Text style={styles.priceText}>{item.price.toLocaleString()} VND</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}><Ionicons name="chevron-back-outline" size={24} color="#fff" /></Text>
        </TouchableOpacity>
  <Text style={styles.sectionTitle}>Available Products</Text>
</View>


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
      <View style={styles.searchContainer}>
  <FontAwesome name="search" size={16} color="#ccc" style={styles.searchIcon} />
  <TextInput
    style={styles.searchInput}
    placeholder="Search by name..."
    value={searchKeyword}
    onChangeText={(text) => setSearchKeyword(text)}
  />
</View>

      <View style={styles.priceFilterContainer}>
  <Text style={styles.filterLabel}>Filter by Price (VND):</Text>
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.priceInput}
      keyboardType="numeric"
      placeholder="Min"
      value={minPrice.toString()}
      onChangeText={(text) => setMinPrice(Number(text))}
    />
    <Text style={styles.filterText}>-</Text>
    <TextInput
      style={styles.priceInput}
      keyboardType="numeric"
      placeholder="Max"
      value={maxPrice.toString()}
      onChangeText={(text) => setMaxPrice(Number(text))}
    />
  </View>
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
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingProducts && hasMore ? <ActivityIndicator size="large" color="#ff6f61" /> : null}
      />
      
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
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
    width: '100%', // Set width to half of the screen
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
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 16,
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
  priceFilterContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInput: {
    width: '40%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    backgroundColor: '#F9F9F9',
  },
  filterText: {
    fontSize: 18,
    color: '#333',
  },
  header: {
    backgroundColor: '#0099FF',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4, 
    marginBottom:20
  },
  goBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFE329',
    borderRadius: 8,
    marginRight: 16,
  },
  goBackText: {
    fontSize: 16,
    color: '#002DB7',
    marginLeft: 8,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#333',
  },
  
});
