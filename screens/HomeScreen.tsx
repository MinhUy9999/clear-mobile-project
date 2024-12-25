import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ServiceList from '@/components/ServiceList';
import ProductList from '@/components/ProductList';
import { getCurrentUser } from '@/apiConfig/apiUser'; // Adjust path as needed

const categories = [
  { id: '1', name: 'All', icon: 'apps', screen: 'Home' },
  { id: '2', name: 'Services', icon: 'event', screen: 'Services' },
  { id: '3', name: 'Products', icon: 'shopping-cart', screen: 'Products' },
];

const HomeScreen: React.FC<{ navigation: any; route: any }> = ({ navigation }) => {
  const [userAvatar, setUserAvatar] = useState('https://example.com/default-avatar.jpg');
  const [userFirstName, setUserFirstName] = useState('Guest');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUserData = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response && response.rs) {
        const user = response.rs;
        setUserAvatar(user.avatar || 'https://example.com/default-avatar.jpg');
        setUserFirstName(user.firstname || 'Guest');
      } else {
        console.error('Invalid response:', response);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUserData(); 
    setRefreshing(false);
  };

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{
            uri: userAvatar,
          }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.name}>{userFirstName}</Text>
          <Text style={styles.welcomeText}>Welcome back!</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            onPress={() => navigation.navigate(category.screen)}
          >
            <MaterialIcons name={category.icon} size={20} color="#FFE329" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Default Home Content */}
      <Text style={styles.sectionTitle}>All Items</Text>
      <ServiceList />
      <ProductList />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DDD',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#002DB7',
    padding: 10,
    marginRight: 8,
    borderRadius: 8,
    width: 80,
    justifyContent: 'center',
  },
  categoryText: {
    color: '#FFE329',
    fontSize: 13,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
});

export default HomeScreen;
