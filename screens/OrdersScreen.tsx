import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { getUserOrders } from '@/apiConfig/apiUser';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);

  const navigation = useNavigation();

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders({ page: 1, limit: 10 });
        if (response.success) {
          setOrders(response.Order || []);
          setFilteredOrders(response.Order || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Search functionality
// Search functionality with multiple keywords
useEffect(() => {
  const searchOrders = () => {
    if (searchQuery.trim()) {
      // Chia searchQuery thành các từ khóa riêng biệt
      const keywords = searchQuery.toLowerCase().split(' ');

      // Lọc các đơn hàng chứa tất cả từ khóa
      const filtered = orders.filter(order =>
        order.products.some(product =>
          keywords.every(keyword => product.title.toLowerCase().includes(keyword))
        )
      );

      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(orders);
    }
  };

  searchOrders();
}, [searchQuery, orders]);


  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await getUserOrders({ page: 1, limit: 10 });
      if (response.success) {
        setOrders(response.Order || []);
        setFilteredOrders(response.Order || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderCard}>
      <Text style={styles.date}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.status}>Status: {item.status}</Text>
      <Text style={styles.total}>Total: {formatCurrency(item.total)}</Text>
      <Text style={styles.payment}>Payment Method: {item.paymentMethod}</Text>
      <View style={styles.products}>
        <Text style={styles.productsHeader}>Products:</Text>
        {item.products.map((product: any, index: number) => (
          <View key={index} style={styles.productItem}>
            <Text style={styles.productName}>{product.title}</Text>
            <Text style={styles.productQuantity}>Qty: {product.quantity}</Text>
            <Text style={styles.productPrice}>Price: {formatCurrency(product.price)}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#fff" />
          </Text>
        </TouchableOpacity>
        <Text style={styles.headerText}>Your Orders</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          placeholder="Search by product name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: { padding: 16, backgroundColor: '#FFF', marginBottom: 10, borderRadius: 8 },
  date: { color: '#888', marginBottom: 5 },
  status: { color: '#555' },
  total: { fontWeight: '600', marginTop: 5 },
  payment: { fontWeight: '400', marginTop: 5, color: '#555' },
  products: { marginTop: 10 },
  productsHeader: { fontWeight: 'bold', fontSize: 14, marginBottom: 5 },
  productItem: { marginBottom: 5 },
  productName: { fontWeight: '500' },
  productQuantity: { color: '#555' },
  productPrice: { fontWeight: '400', color: '#333' },
  header: {
    height: 60,
    backgroundColor: '#007BFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: '#0056b3',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    margin: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
});

export default OrdersScreen;
