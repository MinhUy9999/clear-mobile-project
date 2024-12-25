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

// Định nghĩa kiểu dữ liệu cho từng sản phẩm trong giỏ hàng
interface CartItem {
  _id: string; // ID của mục trong giỏ hàng
  product: {
    _id: string; // ID sản phẩm
    title: string; // Tên sản phẩm
    thumb: string; // Hình ảnh sản phẩm
    price: number; // Giá sản phẩm
    quantity: number; // Số lượng còn trong kho
    sold: number; // Số lượng đã bán
  };
  quantity: number; // Số lượng sản phẩm người dùng thêm vào giỏ hàng
  color: string; // Màu sắc sản phẩm
  price: number; // Giá tiền sản phẩm đã nhân với số lượng
}

// Định nghĩa kiểu dữ liệu cho props của `CartScreen`
interface CartScreenProps {
  refreshCartCount: () => void; // Hàm để làm mới số lượng sản phẩm trong giỏ hàng
}

const CartScreen: React.FC<CartScreenProps> = ({ refreshCartCount }) => {
  // Kiểm tra xem `refreshCartCount` có phải là hàm hay không
  console.log('refreshCartCount function provided:', typeof refreshCartCount === 'function');

  // State lưu danh sách sản phẩm trong giỏ hàng
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // State để theo dõi trạng thái loading
  const [loading, setLoading] = useState<boolean>(true);
  // Lấy navigation để điều hướng
  const navigation = useNavigation();

  // Hàm lấy dữ liệu giỏ hàng từ API
  const fetchCartData = async () => {
    console.log('Fetching cart data...');
    setLoading(true); // Bắt đầu loading
    try {
      const response = await getCurrentUser(); // Gọi API lấy thông tin người dùng
      console.log('Cart data fetched successfully:', response?.rs?.cart);
      if (response?.success) {
        setCartItems(response.rs.cart || []); // Lưu danh sách sản phẩm vào state
      } else {
        setCartItems([]); // Nếu không có dữ liệu, đặt giỏ hàng rỗng
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Hàm tăng số lượng sản phẩm
  const increaseQuantity = async (itemId: string, currentQuantity: number) => {
    const newQuantity = currentQuantity + 1; // Tăng số lượng lên 1
    // Cập nhật UI giỏ hàng
    const updatedCartItems = cartItems.map((item) =>
      item._id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCartItems);

    try {
      // Gọi API cập nhật giỏ hàng
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

  // Hàm giảm số lượng sản phẩm
  const decreaseQuantity = async (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1; // Giảm số lượng xuống 1
      // Cập nhật UI giỏ hàng
      const updatedCartItems = cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedCartItems);

      try {
        // Gọi API cập nhật giỏ hàng
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
      Alert.alert('Error', 'Quantity cannot be less than 1.'); // Hiển thị lỗi nếu giảm dưới 1
    }
  };

  // Hàm xóa sản phẩm khỏi giỏ hàng
// Hàm xóa sản phẩm khỏi giỏ hàng
const removeProduct = async (productId: string) => {
  console.log('Attempting to remove product by productId:', productId);

  try {
    const response = await removeProductFromCart(productId); // Gọi API xóa sản phẩm bằng productId
    console.log('Product removed successfully:', response);

    // Cập nhật lại danh sách giỏ hàng sau khi xóa dựa trên productId
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.product._id !== productId)
    );

    refreshCartCount(); // Làm mới số lượng giỏ hàng
  } catch (error) {
    console.error('Error removing product from cart:', error);
    Alert.alert('Error', 'Failed to remove product from cart. Please try again.');
  }
};


  // Sử dụng `navigation` để lắng nghe khi màn hình được focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCartData);
    return unsubscribe; // Cleanup khi component unmount
  }, [navigation]);

  // Render từng sản phẩm trong giỏ hàng
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
  onPress={() => removeProduct(item.product._id)} // Use `item.product._id` as `productId`
  style={styles.removeButton}
>
  <Text style={styles.removeText}>Remove</Text>
</TouchableOpacity>

      </View>
    </View>
  );

  // Giao diện màn hình
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
  // Định nghĩa các style cho giao diện
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
