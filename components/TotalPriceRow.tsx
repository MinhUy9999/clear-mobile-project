import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const TotalPriceRow: React.FC<{
  totalPrice: number;
  onPressBookNow: () => void;
}> = ({ totalPrice, onPressBookNow }) => {
  const handlePress = () => {
    onPressBookNow();
  };

  return (
    <View style={styles.row}>
      {/* Total Price */}
      <Text style={styles.totalPrice}>Total Price: {totalPrice} VND</Text>

      {/* Animated Book Now Button */}
      <Animatable.View
        animation="pulse" // Continuous pulsing effect
        iterationCount="infinite" // Loop the animation infinitely
        duration={1500} // Duration of one pulse cycle
      >
        <TouchableOpacity onPress={handlePress} style={styles.bookNowButton}>
          <Ionicons name="cash-outline" size={20} color="#FFF" style={styles.icon} />
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFE329',
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200EE',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    elevation: 4, // Add shadow for better appearance
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    marginLeft: 5, // Space between icon and text
  },
  icon: {
    marginRight: 5,
  },
});

export default TotalPriceRow;
