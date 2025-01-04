import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/apiConfig/apiUser';
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
  try {
    const response = await axios.get('https://rsapi.goong.io/Place/AutoComplete', {
      params: {
        api_key: API_KEY,
        location: '10.77609,106.69508',
        input,
      },
    });
    return response.data.predictions;
  } catch (err) {
    throw new Error('Failed to fetch address suggestions.');
  }
};

// InputForm Component
const InputForm = ({ label, value, onChange }: any) => (
  <View style={styles.inputGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value} onChangeText={onChange} />
  </View>
);

// Paypal Component (Mock)
const Paypal = ({ payload, setIsSuccess, amount }: any) => {
  const handlePayment = () => {
    console.log('Processing payment:', payload);
    setTimeout(() => setIsSuccess(true), 2000); // Mock success
  };

  return (
    <TouchableOpacity style={styles.paypalButton} onPress={handlePayment}>
      <Text style={styles.paypalText}>Pay {amount} USD via PayPal</Text>
    </TouchableOpacity>
  );
};

// Breadcrumb Component (Mock)
const Breadcrumb = ({ steps }: any) => (
  <View style={styles.breadcrumb}>
    {steps.map((step: string, index: number) => (
      <Text key={index} style={styles.breadcrumbText}>
        {step} {index < steps.length - 1 ? '>' : ''}
      </Text>
    ))}
  </View>
);

// Main Checkout Component
const CheckoutScreen: React.FC<CheckoutScreenProps> = ({ refreshCartCount }) => {
  const [user, setUser] = useState<any>(null);  // Lưu thông tin người dùng
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
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
      try {
        const response = await getCurrentUser();
        setUser(response?.rs || null);
        if (response?.success) {
          setAddress(response.rs?.address || '');
          setMobile(response.rs?.mobile || '');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const loadCartData = async () => {
      setLoading(true);
      try {
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
      } catch (error) {
        console.error('Error fetching cart data:', error);
      } finally {
        setLoading(false);
      }
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

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity, 
      0
    );
  };

  return (
    <View style={styles.container}>
      <Breadcrumb steps={['Home', 'Cart', 'Checkout']} />

      <View style={styles.content}>
        <Text style={styles.header}>Checkout</Text>

        {/* Cart Items */}
        <FlatList
          data={cartItems}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Text style={styles.itemText}>{item.product.title}</Text>
              <Text style={styles.itemText}>Quantity: {item.quantity}</Text>
              <Text style={styles.itemText}>Price: {(item.product.price * item.quantity).toLocaleString()} VND</Text>
            </View>
          )}
          keyExtractor={(item) => item.cartId}
        />

        <Text style={styles.total}>Total: {calculateTotal().toLocaleString()} VND</Text>

        {/* Address Input */}
        <InputForm label="Delivery Address" value={address} onChange={setAddress} />
        
        {/* Mobile Input */}
        <InputForm label="Mobile" value={mobile} onChange={setMobile} />

        {/* Address Suggestions */}
        {addressSuggestions.length > 0 && (
          <FlatList
            data={addressSuggestions}
            renderItem={({ item }) => <Text>{item.description}</Text>}
            keyExtractor={(item) => item.place_id}
          />
        )}

        {/* Paypal */}
        <Paypal payload={{ address, mobile }} setIsSuccess={setIsSuccess} amount={calculateTotal()} />

        {isSuccess && <Text style={styles.successMessage}>Payment successful!</Text>}

        {/* Back to Cart Button */}
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
  input: { padding: 10, fontSize: 16, borderColor: '#ccc', borderWidth: 1, borderRadius: 8 },
  paypalButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, marginTop: 20 },
  paypalText: { color: '#fff', fontSize: 18, textAlign: 'center' },
  successMessage: { fontSize: 18, color: '#28a745', marginTop: 10, textAlign: 'center' },
  backButton: { backgroundColor: '#f44336', padding: 15, borderRadius: 8, marginTop: 20 },
  backText: { color: '#fff', fontSize: 18, textAlign: 'center' },
});

export default CheckoutScreen;