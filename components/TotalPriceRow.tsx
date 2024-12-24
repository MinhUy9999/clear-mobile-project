import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

const { width } = Dimensions.get('window'); // Get screen width

const TotalPriceRow: React.FC<{
  totalPrice: number;
  onPressBookNow: () => void;
}> = ({ totalPrice, onPressBookNow }) => {
  const handlePress = () => {
    onPressBookNow();
  };

  return (
    <View style={styles.container}>
      {/* Total Price */}
      <Text style={styles.totalPrice}>Total Price: {totalPrice.toLocaleString()} VND</Text>

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
  container: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f40d0d',
    textAlign: 'center', // Center-align the text
    marginBottom: 10, // Add spacing between the price and button
  },
  bookNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Center the content horizontally
    backgroundColor: '#6200EE',
    paddingVertical: 15, // Make the button taller
    borderRadius: 8,
    width: width - 20, // Full-width button with some padding from screen edges
    alignSelf: 'center', // Center the button on the screen
    elevation: 4, // Add shadow for better appearance
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    marginLeft: 10, // Space between icon and text
    fontWeight: 'bold',
  },
  icon: {
    marginRight: 5,
  },
});

export default TotalPriceRow;
