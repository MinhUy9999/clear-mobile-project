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
  _id: string;
  product: {
    _id: string;
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

  const fetchCartData = async () => {
    console.log('Fetching cart data...');
    setLoading(true);
    try {
      const response = await getCurrentUser();
      console.log('Cart data fetched successfully:', response?.rs?.cart);
      if (response?.success) {
        setCartItems(response.rs.cart || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      // console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const increaseQuantity = async (itemId: string, currentQuantity: number) => {
    const newQuantity = currentQuantity + 1;
    const updatedCartItems = cartItems.map((item) =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems);

    try {
      const itemToUpdate = cartItems.find((item) => item._id === itemId);
      if (itemToUpdate) {
        await updateCart({
          pid: itemToUpdate.product._id,
          quantity: newQuantity,
          color: itemToUpdate.color,
          price: itemToUpdate.product.price,
          title: itemToUpdate.product.title,
          thumb: itemToUpdate.product.thumb,
        });
      }
    } catch (error) {
      console.error('Error updating quantity on server:', error);
    }
  };

  const decreaseQuantity = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      const updatedCartItems = cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCartItems);

      try {
        const itemToUpdate = cartItems.find((item) => item._id === itemId);
        if (itemToUpdate) {
          await updateCart({
            pid: itemToUpdate.product._id,
            quantity: newQuantity,
            color: itemToUpdate.color,
            price: itemToUpdate.product.price,
            title: itemToUpdate.product.title,
            thumb: itemToUpdate.product.thumb,
          });
        }
      } catch (error) {
        console.error('Error updating quantity on server:', error);
      }
    } else {
      Alert.alert('Error', 'Quantity cannot be less than 1.');
    }
  };

  const removeProduct = async (productId: string) => {
    Alert.alert(
      'Confirm Removal',
      'Are you sure you want to remove this product from your cart?',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => console.log('Remove cancelled.') },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              const response = await removeProductFromCart(productId);
              console.log('Product removed successfully from server:', response);

              setCartItems((prevItems) => {
                const updatedItems = prevItems.filter((item) => item._id !== productId);
                console.log('Updated cart items after removal:', updatedItems);
                return updatedItems;
              });

              refreshCartCount();
            } catch (error) {
              console.error('Error removing product from cart:', error);
              Alert.alert('Error', 'Failed to remove the product. Please try again.');
            }
          },
        },
      ]
    );
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
            onPress={() => decreaseQuantity(item._id, item.quantity)}
            style={[styles.adjustButton, styles.decreaseButton]}
          >
            <Text style={styles.buttonText}>-</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => increaseQuantity(item._id, item.quantity)}
            style={[styles.adjustButton, styles.increaseButton]}
          >
            <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() => removeProduct(item._id)}
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
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>Your cart is empty!</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16 },
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
});

export default CartScreen;
