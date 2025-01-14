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

  const navigateToCheckout = () => {
    navigation.navigate('CheckoutScreen');
  };

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
      console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false);
    }
  };

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
      console.error("Error updating quantity on server:", error);
      Alert.alert("Error", "Failed to update quantity. Please try again.");
    }
  };
  

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
        console.error("Error updating quantity on server:", error);
        Alert.alert("Error", "Failed to update quantity. Please try again.");
      }
    } else {
      Alert.alert("Error", "Quantity cannot be less than 1.");
    }
  };
  

  const removeProduct = async (productId: string) => {
    try {
      const response = await removeProductFromCart(productId); 
      console.log("Remove product response:", response);
  
      if (response.success) {
        setCartItems((prevItems) =>
          prevItems.filter((item) => item.product.productId !== productId)
        );
        await fetchCartData(); 
      } else {
        Alert.alert("Error", response.message || "Failed to remove product from cart.");
      }
    } catch (error) {
      console.error("Error removing product from cart:", error);
      Alert.alert("Error", "Failed to remove product from cart.");
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCartData);
    return unsubscribe;
  }, [navigation]);

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
          onPress={() => removeProduct(item.product.productId)} // Sử dụng productId
          style={styles.removeButton}
        >
          <Text style={styles.removeText}>Remove</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Cart</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : cartItems.length > 0 ? (
        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.cartId} 
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>Your cart is empty!</Text>
      )}
      <TouchableOpacity
        onPress={navigateToCheckout}
        style={styles.checkoutButton}
      >
        <Text style={styles.checkoutText}>Proceed to Checkout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, marginBottom: 50 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  list: { paddingBottom: 20 },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  image: { width: 80, height: 80, borderRadius: 8 },
  detailsContainer: { marginLeft: 12, flex: 1 },
  title: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  color: { fontSize: 14, color: '#666', marginTop: 4 },
  price: { fontSize: 14, color: '#002DB7', marginTop: 4 },
  quantity: { fontSize: 14, color: '#333', marginTop: 4 },
  buttonContainer: { flexDirection: 'row', marginTop: 10 },
  adjustButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 5,
  },
  decreaseButton: { backgroundColor: '#ff6f61' },
  increaseButton: { backgroundColor: '#00cc66' },
  buttonText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  removeButton: {
    backgroundColor: '#f44336',
    borderRadius: 4,
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  removeText: { color: '#fff', fontWeight: 'bold' },
  emptyText: { textAlign: 'center', fontSize: 16, color: '#888' },
  checkoutButton: {
    backgroundColor: '#007BFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  checkoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
});

export default CartScreen;
