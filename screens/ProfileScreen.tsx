import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { logoutUser, getCurrentUser } from '@/apiConfig/apiUser';

const LogoutButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name="log-out-outline" size={24} color="#FF4D4D" />
    <Text style={[styles.menuText, { color: '#FF4D4D' }]}>Logout</Text>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const LoginButton = ({ onPress }: { onPress: () => void }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name="log-in-outline" size={24} color="#4CAF50" />
    <Text style={[styles.menuText, { color: '#4CAF50' }]}>Login</Text>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const [userFirstName, setUserFirstName] = useState<string>('Guest');
  const [userEmail, setUserEmail] = useState<string>('No Email');
  const [userAvatar, setUserAvatar] = useState<string>('https://example.com/default-avatar.jpg');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getCurrentUser();
        if (response && response.rs) {
          const user = response.rs; // Lấy dữ liệu từ trường rs
          setUserFirstName(user.firstname || 'Guest');
          setUserEmail(user.email || 'No Email');
          setUserAvatar(user.avatar || 'https://example.com/default-avatar.jpg');
          setIsLoggedIn(true);
        } else {
          console.error('Invalid response:', response);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, []);
  const handleLogout = async () => {
    try {
      const response = await logoutUser();
      await AsyncStorage.clear();
  
      if (response.success) {
        setIsLoggedIn(false);
        setShowLogoutModal(false); 
        navigation.replace('Login'); 
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setShowLogoutModal(false);
    }
  };

  const handleLogin = () => {
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: userAvatar }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{userFirstName}</Text>
        <Text style={styles.email}>{userEmail}</Text>
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem
          icon="person-outline"
          text="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        {isLoggedIn ? (
          <LogoutButton onPress={() => setShowLogoutModal(true)} />
        ) : (
          <LoginButton onPress={handleLogin} />
        )}
      </View>

      {/* Logout Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showLogoutModal}
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalText}>Are you sure you want to log out?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={handleLogout}>
                <Text style={styles.modalButtonText}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>NO</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// MenuItem Component
const MenuItem = ({ icon, text, color = '#333', onPress = () => {} }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={color} />
    <Text style={[styles.menuText, { color }]}>{text}</Text>
    <Ionicons name="chevron-forward" size={20} color="#666" />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', paddingHorizontal: 16, paddingTop: 50 },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#DDD' },
  name: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
  email: { fontSize: 14, color: '#888', marginVertical: 5 },
  menu: { marginTop: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  menuText: { flex: 1, fontSize: 16, marginLeft: 10 },

  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalText: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalButton: {
    flex: 1, paddingVertical: 10, marginHorizontal: 10, backgroundColor: '#FF4D4D', borderRadius: 5, alignItems: 'center',
  },
  cancelButton: { backgroundColor: '#CCCCCC' },
  modalButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  cancelButtonText: { color: '#333' },
});

export default ProfileScreen;
