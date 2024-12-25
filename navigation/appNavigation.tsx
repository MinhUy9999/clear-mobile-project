import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '@/screens/HomeScreen';
import CartScreen from '@/screens/CartScreen';
import BlogScreen from '@/screens/BlogScreen'; // Updated from BookingScreen to BlogScreen
import ProfileScreen from '@/screens/ProfileScreen';
import OnboardingScreen from '@/screens/OnboardingScreen';
import ServiceDetailScreen from '@/screens/ServiceDetailScreen';
import CreateBookingScreen from '@/screens/CreateBookingScreen';
import LoginScreen from '@/screens/LoginScreen';
import RegisterScreen from '@/screens/RegisterScreen';
import ProductDetailScreen from '@/screens/ProductDetailScreen';
import EditProfile from '@/screens/EditProfile';
import ForgotPassword from '@/screens/ForgotPassword';
import { getCurrentUser } from '@/apiConfig/apiUser';
import OrdersScreen from '@/screens/OrdersScreen';
import ServicesScreen from '@/screens/ServicesScreen';
import ProductsScreen from '@/screens/ProductsScreen';

type TabParamList = {
  Home: undefined;
  Cart: undefined;
  Blog: undefined;
  Profile: undefined;
};

type StackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<StackParamList>();

// Animation definitions for Tab Buttons
const animateFocused = { 0: { scale: 0.5, translateY: 7 }, 0.92: { translateY: -34 }, 1: { scale: 1.2, translateY: -24 } };
const animateUnfocused = { 0: { scale: 1.2, translateY: -24 }, 1: { scale: 1, translateY: 7 } };
const circleIn = { 0: { scale: 0 }, 0.3: { scale: 0.9 }, 0.5: { scale: 0.2 }, 0.8: { scale: 0.7 }, 1: { scale: 1 } };
const circleOut = { 0: { scale: 1 }, 1: { scale: 0 } };

// Custom Tab Button Component with Cart Badge
const TabButton: React.FC<{
  item: { route: keyof TabParamList; label: string; icon: string };
  onPress: () => void;
  accessibilityState: { selected: boolean };
  cartCount?: number;
}> = ({ item, onPress, accessibilityState, cartCount }) => {
  const focused = accessibilityState.selected;
  const viewRef = useRef<Animatable.View & View>(null);
  const circleRef = useRef<Animatable.View & View>(null);
  const textRef = useRef<Animatable.Text & Text>(null);

  const { colors } = useTheme();
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const bgColor = focused ? colors.primary : 'white';

  useEffect(() => {
    if (focused) {
      viewRef.current?.animate(animateFocused);
      circleRef.current?.animate(circleIn);
      textRef.current?.transitionTo({ scale: 1 });
    } else {
      viewRef.current?.animate(animateUnfocused);
      circleRef.current?.animate(circleOut);
      textRef.current?.transitionTo({ scale: 0 });
    }
  }, [focused]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.container}>
      <Animatable.View ref={viewRef} duration={1000} style={styles.container}>
        <View style={[styles.btn, { backgroundColor: bgColor }]}>
          <Animatable.View ref={circleRef} style={styles.circle} />
          <Ionicons name={item.icon} size={24} color={focused ? 'white' : colors.primary} />
          {/* Badge for Cart */}
          {item.route === 'Cart' && cartCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
        <Animatable.Text ref={textRef} style={[styles.text, { color: textColor }]}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

// Tab Navigator with Cart Badge Logic
const MainTabs: React.FC = () => {
  const [cartCount, setCartCount] = useState<number>(0); // State lưu số lượng sản phẩm trong giỏ hàng

  const fetchCartData = async () => {
    try {
      const response = await getCurrentUser(); // Gọi API lấy thông tin người dùng
      if (response?.success) {
        setCartCount(response.rs.cart?.length || 0); // Cập nhật số lượng giỏ hàng
      } else {
        setCartCount(0); // Nếu không có dữ liệu, đặt số lượng bằng 0
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      setCartCount(0); // Nếu có lỗi, đặt số lượng bằng 0
    }
  };

  useEffect(() => {
    fetchCartData(); // Gọi API khi component mount
  }, []);

  // Danh sách các tab
  const tabItems = [
    { route: 'Home', label: 'Home', icon: 'home-outline' },
    { route: 'Cart', label: 'Cart', icon: 'cart-outline' },
    { route: 'Blog', label: 'Blog', icon: 'book-outline' },
    { route: 'Profile', label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: styles.tabBar }}>
      {tabItems.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.route}
          component={
            item.route === 'Home'
              ? HomeScreen
              : item.route === 'Cart'
              ? () => <CartScreen refreshCartCount={fetchCartData} /> // Truyền `fetchCartData` vào CartScreen
              : item.route === 'Blog'
              ? BlogScreen
              : ProfileScreen
          }
          options={{
            tabBarShowLabel: false, // Ẩn label của tab
            tabBarButton: (props) => <TabButton {...props} item={item} cartCount={cartCount} />, // Sử dụng TabButton custom
          }}
          listeners={{
            focus: fetchCartData, // Cập nhật số lượng giỏ hàng khi tab được focus
          }}
        />
      ))}
    </Tab.Navigator>
  );
};


const AppNavigation: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
      <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="OrdersScreen" component={OrdersScreen} />
      <Stack.Screen name="Services" component={ServicesScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigation;

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 70,
  },
  tabBar: {
    height: 70,
    position: 'absolute',
    margin: 16,
    borderRadius: 16,
  },
  btn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'blue',
    borderRadius: 25,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  badgeContainer: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF6F61',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
