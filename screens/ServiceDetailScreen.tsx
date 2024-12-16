import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { getOneService } from '../apiConfig/apiService';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';

// Define the ServiceDetail type
interface ServiceDetail {
  _id: string;
  title: string;
  description: string[];
  thumb: string;
  price: number;
  category: string;
}

const stripHtml = (html: string): string => {
  return html.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, ' ').trim();
};

const ServiceDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<{ params: { serviceId: string } }, 'params'>>();
  const { serviceId } = route.params;
  const navigation = useNavigation();
  const [service, setService] = useState<ServiceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchServiceDetail = async () => {
      try {
        const response = await getOneService(serviceId);
        setService(response.data.service); // Adjust based on the API response
      } catch (error) {
        console.error('Error fetching service details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServiceDetail();
  }, [serviceId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff6f61" />
        <Text>Loading service details...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.errorContainer}>
        <Text>Service not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Image source={{ uri: service.thumb }} style={styles.image} />
      <Text style={styles.title}>{service.title}</Text>
      <Text style={styles.category}>Category: {service.category}</Text>
      <Text style={styles.description}>{stripHtml(service.description.join(', '))}</Text>
      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('CreateBooking', { service })}>
          <Text style={styles.bookButtonText}>BOOK NOW</Text>
          <Animatable.View
            animation={{
              from: { translateX: -5 },
              to: { translateX: 10 },
            }}
            iterationCount="infinite"
            duration={800}
            easing="linear"
            style={styles.iconContainer}
          >
            <Ionicons name="chevron-forward-outline" size={20} color="#fff" />
          </Animatable.View>
        </TouchableOpacity>
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>VND {service.price}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 16,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  category: {
    fontSize: 16,
    color: '#888',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    textAlign: 'justify',
    lineHeight: 20,
    paddingBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  bookButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFE329',
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 8, // Space between text and icon
  },
  iconContainer: {
    marginLeft: 4, // Adjust spacing between icon and text
  },
  priceContainer: {
    padding: 12,
    backgroundColor: '#002DB7',
    borderRadius: 8,
  },
  priceText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ServiceDetailScreen;
