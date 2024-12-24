import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { getUserOrders } from '@/apiConfig/apiUser';

const OrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <View style={styles.orderCard}>
          <Text style={styles.orderId}>Order ID: {item._id}</Text>
          <Text style={styles.status}>Status: {item.status}</Text>
          <Text style={styles.total}>Total: ${item.total}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: { padding: 16, backgroundColor: '#FFF', marginBottom: 10, borderRadius: 8 },
  orderId: { fontWeight: 'bold' },
  status: { color: '#555' },
  total: { fontWeight: '600' },
});

export default OrdersScreen;
