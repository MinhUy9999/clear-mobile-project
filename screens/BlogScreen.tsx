import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BlogList from '@/components/BlogList'; // Update the path based on your project structure

export default function BlogScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Blogs</Text>
      <BlogList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
});
