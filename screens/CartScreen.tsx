import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getCurrentUser, removeProductFromCart, updateCart } from '@/apiConfig/apiUser';
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

interface CartScreenProps {
  refreshCartCount: () => void;
}

const CartScreen: React.FC<CartScreenProps> = ({ refreshCartCount }) => {
  console.log('refreshCartCount function provided:', typeof refreshCartCount === 'function');

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  // Navigate to Checkout Screen
  const navigateToCheckout = () => {
    navigation.navigate('CheckoutScreen');
  };

  // Fetch Cart Data
  const fetchCartData = async () => {
    console.log('Fetching cart data...');
    setLoading(true);
    try {
      const response = await getCurrentUser();
      console.log('Cart data fetched successfully:', response?.rs?.cart);

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
    } finally {
      setLoading(false);
    }
  };

  // Increase Quantity
  const increaseQuantity = async (cartId: string, currentQuantity: number) => {
    const newQuantity = currentQuantity + 1;

    const updatedCartItems = cartItems.map((item) =>
      item.cartId === cartId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems);

    try {
      const itemToUpdate = cartItems.find((item) => item.cartId === cartId);
      if (itemToUpdate) {
        await updateCart({
          pid: itemToUpdate.product.productId,
          quantity: newQuantity,
          color: itemToUpdate.color,
          price: itemToUpdate.product.price,
          title: itemToUpdate.product.title,
          thumb: itemToUpdate.product.thumb,
        });
      }
    } catch (error) {
      console.error('Error updating quantity on server:', error);
      Alert.alert('Error', 'Failed to update quantity. Please try again.');
    }
  };

  // Decrease Quantity
  const decreaseQuantity = async (cartId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;

      const updatedCartItems = cartItems.map((item) =>
        item.cartId === cartId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCartItems);

      try {
        const itemToUpdate = cartItems.find((item) => item.cartId === cartId);
        if (itemToUpdate) {
          await updateCart({
            pid: itemToUpdate.product.productId,
            quantity: newQuantity,
            color: itemToUpdate.color,
            price: itemToUpdate.product.price,
            title: itemToUpdate.product.title,
            thumb: itemToUpdate.product.thumb,
          });
        }
      } catch (error) {
        console.error('Error updating quantity on server:', error);
        Alert.alert('Error', 'Failed to update quantity. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Quantity cannot be less than 1.');
    }
  };

  // Remove Product from Cart
  const removeProduct = async (productId: string) => {
    try {
      const response = await removeProductFromCart(productId);
      console.log('Remove product response:', response);

      if (response.success) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product.productId !== productId)
        );
        await fetchCartData();
      } else {
        Alert.alert('Error', response.message || 'Failed to remove product from cart.');
      }
    } catch (error) {
      console.error('Error removing product from cart:', error);
      Alert.alert('Error', 'Failed to remove product from cart.');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCartData);
    return unsubscribe;
  }, [navigation]);

  // Render Cart Item
  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.product.thumb }} style={styles.image} />
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{item.product.title}</Text>
        <Text style={styles.color}>Color: {item.color}</Text>
        <Text style={styles.price}>
          Price: {(item.price * item.quantity).toLocaleString()} VND
        </Text>
        <Text style={styles.quantity}>Quantity: {item.quantity}</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => increaseQuantity(item.cartId, item.quantity)}
            style={[styles.adjustButton, styles.increaseButton]}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => decreaseQuantity(item.cartId, item.quantity)}
            style={[styles.adjustButton, styles.decreaseButton]}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => removeProduct(item.product.productId)}
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Your Cart</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.cartId}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={() => (
            <TouchableOpacity
              onPress={navigateToCheckout}
              style={[
                styles.checkoutButton,
                { backgroundColor: cartItems.length === 0 ? '#ccc' : '#007BFF' },
              ]}
              disabled={cartItems.length === 0}
            >
              <Text style={styles.checkoutText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  container: { flex: 1, backgroundColor: '#fff', padding: 16, marginBottom: 50, marginLeft: 16, },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  itemContainer: { flexDirection: 'row', backgroundColor: '#f9f9f9', borderRadius: 8, padding: 12, marginBottom: 10 },
  image: { width: 80, height: 80, borderRadius: 8 },
  detailsContainer: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  color: { fontSize: 14, color: '#666', marginTop: 4 },
  price: { fontSize: 14, color: '#002DB7', marginTop: 4 },
  buttonContainer: { flexDirection: 'row', marginTop: 10 },
  adjustButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', borderRadius: 20, marginHorizontal: 5 },
  decreaseButton: { backgroundColor: '#ff6f61' },
  increaseButton: { backgroundColor: '#00cc66' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  removeButton: { backgroundColor: '#f44336', borderRadius: 4, marginTop: 10, paddingVertical: 6, paddingHorizontal: 10, alignItems: 'center' },
  removeText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888' },
  checkoutButton: { 
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center', },
  checkoutText: { color: '#fff', fontWeight: 'bold', fontSize: 18},
  listContent: { paddingBottom: 100 },
});

export default CartScreen;
