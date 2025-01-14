import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import { getCurrentUser, createOrder } from '@/apiConfig/apiUser';
import { useNavigation } from '@react-navigation/native';

interface CartItem {
  cartId: string;
  product: {
    productId: string;
    title: string;
    thumb: string;
    price: number;
    quantity: number;
    sold: number;
  };
  quantity: number;
  color: string;
  price: number;
}

interface CheckoutScreenProps {
  refreshCartCount: () => void;
}

const API_KEY = 'JgyBcd5fd6G1Cg3TEfjTx39IaqElsZDFLVO8jKP2';

const fetchAddressSuggestions = async (input: string) => {
  const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
    params: { api_key: API_KEY, location: '10.77609,106.69508', input },
  });
  return response.data.predictions;
};

const InputForm = ({ label, value, onChange }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChange} />
  </View>
);

const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ refreshCartCount }) => {
  const [user, setUser] = useState<any>(null);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  const navigateToCart = () => {
    navigation.navigate('CartScreen');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const response = await getCurrentUser();
      setUser(response?.rs || null);
      if (response?.success) {
        setAddress(response.rs?.address || '');
        setMobile(response.rs?.mobile || '');
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      const response = await getCurrentUser();
      if (response?.success) {
        const normalizedCartItems = response.rs.cart.map((item: any) => ({
          cartId: item._id,
          product: {
            productId: item.product._id,
            title: item.product.title,
            thumb: item.product.thumb,
            price: item.product.price,
            quantity: item.product.quantity,
            sold: item.product.sold,
          },
          quantity: item.quantity,
          color: item.color,
          price: item.price,
        }));
        setCartItems(normalizedCartItems);
      } else {
        setCartItems([]);
      }
      setLoading(false);
    };

    loadCartData();
  }, []);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (address && address.length > 1) {
        const suggestions = await fetchAddressSuggestions(address);
        setAddressSuggestions(suggestions || []);
      } else {
        setAddressSuggestions([]);
      }
    };
    loadSuggestions();
  }, [address]);

  const calculateTotal = () =>
    cartItems.reduce(
        (total, item) => total + (item.product.price * item.quantity) / 23500,
        0
    ).toFixed(2);

  const handlePlaceOrder = async () => {
    if (!address || !mobile || cartItems.length === 0) {
      Alert.alert('Error', 'Please fill in all fields and add items to your cart.');
      return;
    }
  
    try {
        const orderData = {
          address,
          mobile,
          products: cartItems.map(item => ({
            product: { _id: item.product.productId },
            quantity: item.quantity,
            color: item.color,
            price: item.price,
            title: item.product.title,
            thumb: item.product.thumb,
          })),
          total: calculateTotal(),
        };
      
        console.log('Order Data:', JSON.stringify(orderData, null, 2));
      
        const response = await createOrder(orderData);
      
        if (response.success) {
          Alert.alert('Success', 'Your order has been placed successfully!');
          navigation.navigate('MainTabs'); 
          return; 
        } else {
          Alert.alert('Error', 'Failed to place the order.');
          return; 
        }
      } catch (error) {
        console.error('Error placing order:', error);
        Alert.alert('Error', 'An error occurred while placing your order.');
      }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.header}>Checkout</Text>
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text style={styles.itemText}>{item.product.title}</Text>
              <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
              <Text style={styles.itemText}>
                Price: {(item.product.price * item.quantity).toLocaleString()} VND
              </Text>
            </View>
          )}
          keyExtractor={item => item.cartId}
        />
        <Text style={styles.total}>Total: {calculateTotal().toLocaleString()} VND</Text>
        <InputForm label="Delivery Address" value={address} onChange={setAddress} />
        <InputForm label="Mobile" value={mobile} onChange={setMobile} />
        {addressSuggestions.length > 0 && (
          <FlatList
            data={addressSuggestions}
            renderItem={({ item }) => <Text>{item.description}</Text>}
            keyExtractor={item => item.place_id}
          />
        )}
        <TouchableOpacity onPress={handlePlaceOrder} style={styles.placeOrderButton}>
          <Text style={styles.placeOrderText}>Place an Order</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={navigateToCart} style={styles.backButton}>
          <Text style={styles.backText}>Back to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  breadcrumb: { flexDirection: 'row', marginBottom: 10 },
  breadcrumbText: { fontSize: 16, color: '#777' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  content: { flex: 1 },
  cartItem: { marginBottom: 10, padding: 10, backgroundColor: '#f9f9f9' },
  itemText: { fontSize: 16, color: '#333' },
  total: { fontSize: 20, fontWeight: 'bold', marginTop: 20 },
  inputGroup: { marginBottom: 15 },
  label: { fontSize: 16, color: '#333' },
  input: { padding: 10, fontSize: 16, borderWidth: 1, borderColor: '#ccc', borderRadius: 5 },
  placeOrderButton: { padding: 15, backgroundColor: '#007BFF', borderRadius: 5, marginTop: 20 },
  placeOrderText: { color: '#fff', textAlign: 'center', fontSize: 16 },
  backButton: { padding: 10, backgroundColor: '#ccc', borderRadius: 5, marginTop: 10 },
  backText: { textAlign: 'center', fontSize: 16 },
});

export default CheckoutScreen;
