import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { getUserOrders } from '@/apiConfig/apiUser';

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getUserOrders({ page: 1, limit: 10 });
        if (response.success) {
          setOrders(response.Order || []);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await getUserOrders({ page: 1, limit: 10 });
      if (response.success) {
        setOrders(response.Order || []);
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
      <Text style={styles.orderId}>Order ID: {item._id}</Text>
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
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={renderOrderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: { padding: 16, backgroundColor: '#FFF', marginBottom: 10, borderRadius: 8 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
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
});

export default OrdersScreen;
