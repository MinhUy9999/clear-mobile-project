import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import ServiceList from '../components/ServiceList'; // Import the ServiceList component
import ProductList from '@/components/ProductList';

const categories = [
  { id: '1', name: 'All', icon: 'apps' },
  { id: '2', name: 'Beaches', icon: 'beach-access' },
  { id: '3', name: 'Mountains', icon: 'terrain' },
];

const HomeScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services..."
            placeholderTextColor="#888"
          />
        </View>
        <TouchableOpacity style={styles.profileIcon}>
          <Ionicons name="person" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Categories */}
      <View style={styles.categories}>
        {categories.map((category) => (
          <TouchableOpacity key={category.id} style={styles.categoryButton}>
            <MaterialIcons name={category.icon} size={20} color="#fff" />
            <Text style={styles.categoryText}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Service List */}
      <ServiceList />
      <View style={{marginTop: 15}}>
      <ProductList/>
      </View>
      
    </ScrollView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    marginRight: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  profileIcon: {
    backgroundColor: '#FFE329',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  categoryButton: {
    alignItems: 'center',
    backgroundColor: '#FFE329',
    padding: 8,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default HomeScreen;
