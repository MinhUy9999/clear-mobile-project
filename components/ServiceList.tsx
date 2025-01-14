import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAllServices } from '../apiConfig/apiService'; // Adjust the path as needed
import { useNavigation } from '@react-navigation/native';

// Service interface
interface Service {
  _id: string;
  title: string;
  description: string[];
  thumb: string;
  price: number;
  category: string;
}

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getAllServices();
        setServices(response.data.service); // Adjust based on API response structure
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handlePress = (serviceId: string) => {
    navigation.navigate('ServiceDetail', { serviceId });
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>Book Cleaning Service</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6f61" />
      ) : (
        <FlatList
          data={services}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.serviceCard}>
              <TouchableOpacity onPress={() => handlePress(item._id)}>
                <Image source={{ uri: item.thumb }} style={styles.serviceImage} />
              </TouchableOpacity>
              <Text style={styles.serviceTitle} numberOfLines={1} ellipsizeMode="tail">
                            {item.title}
              </Text>

           
              <TouchableOpacity style={styles.priceButton} onPress={() => handlePress(item._id)}>
                <FontAwesome name="money" size={16} color="#002DB7" />
                <Text style={styles.priceText}>{item.price.toLocaleString()} VND</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  serviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 16,
    width: 200,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    paddingBottom: 8,
  },
  serviceImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 8,
    paddingBottom: 8,
    width: '90%',
    overflow: 'hidden',
  },
  
  priceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', 
    backgroundColor: '#FFE329',
    marginHorizontal: 8,
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 4,
    paddingHorizontal: 12, 
    height: 40,
  },
  priceText: {
    fontSize: 14,
    color: '#002DB7',
    fontWeight: 'bold',
    marginLeft: 4,
  },

});

export default ServiceList;
