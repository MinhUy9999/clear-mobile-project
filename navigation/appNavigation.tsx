import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '@/screens/HomeScreen';
import CartScreen from '@/screens/CartScreen';
import BookingScreen from '@/screens/BookingScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import OnboardingScreen from '@/screens/OnboardingScreen'; // Import your OnboardingScreen here
import ServiceDetailScreen from '@/screens/ServiceDetailScreen';
import CreateBookingScreen from '@/screens/CreateBookingScreen';

type TabParamList = {
  Home: undefined;
  Cart: undefined;
  Booking: undefined;
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

// Custom Tab Button Component
const TabButton: React.FC<{
  item: { route: keyof TabParamList; label: string; icon: string };
  onPress: () => void;
  accessibilityState: { selected: boolean };
}> = ({ item, onPress, accessibilityState }) => {
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
        </View>
        <Animatable.Text ref={textRef} style={[styles.text, { color: textColor }]}>
          {item.label}
        </Animatable.Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

// Tab Navigator
const MainTabs: React.FC = () => {
  const tabItems = [
    { route: 'Home', label: 'Home', icon: 'home-outline' },
    { route: 'Cart', label: 'Cart', icon: 'cart-outline' },
    { route: 'Booking', label: 'Booking', icon: 'calendar-outline' },
    { route: 'Profile', label: 'Profile', icon: 'person-outline' },
  ];

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {tabItems.map((item, index) => (
        <Tab.Screen
          key={index}
          name={item.route}
          component={
            item.route === 'Home'
              ? HomeScreen
              : item.route === 'Cart'
              ? CartScreen
              : item.route === 'Booking'
              ? BookingScreen
              : ProfileScreen
          }
          options={{
            tabBarShowLabel: false,
            tabBarButton: (props) => <TabButton {...props} item={item} />,
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

// Main Navigation
const AppNavigation: React.FC = () => {
  return (

      <Stack.Navigator initialRouteName="Onboarding" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="ServiceDetail" component={ServiceDetailScreen} />
        <Stack.Screen name="CreateBooking" component={CreateBookingScreen} />
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
});
