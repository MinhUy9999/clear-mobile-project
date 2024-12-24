import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateCurrentUser, getCurrentUser } from '../apiConfig/apiUser';
import { fetchAddressSuggestions } from '../apiConfig/apiMap';

const EditProfile = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false); // Loading state for update
  const [avatar, setAvatar] = useState(null);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await getCurrentUser();
      const user = response?.rs;
      if (user) {
        setFirstname(user.firstname || '');
        setLastname(user.lastname || '');
        setEmail(user.email || '');
        setMobile(user.mobile || '');
        setAddress(user.address || '');
        setAvatar(user.avatar ? { uri: user.avatar } : null);
      }
    } catch (error) {
      // console.error('Error fetching user data:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });
      if (!result.canceled) {
        setAvatar(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const handleUpdate = async () => {
    setLoadingUpdate(true); // Show loading spinner
    const userData = {
      firstname,
      lastname,
      email,
      mobile,
      address,
      avatar: avatar?.uri
        ? {
            uri: avatar.uri,
            name: avatar.uri.split('/').pop(),
            type: avatar.type || 'image/jpeg',
          }
        : undefined,
    };

    try {
      const response = await updateCurrentUser(userData);
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', response.mes || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    } finally {
      setLoadingUpdate(false); // Hide loading spinner
    }
  };

  const handleAddressChange = useCallback(
    (input: string) => {
      setAddress(input);

      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }

      debounceTimeout.current = setTimeout(async () => {
        if (!input.trim()) {
          setAddressSuggestions([]);
          return;
        }
        setLoadingSuggestions(true);
        try {
          const suggestions = await fetchAddressSuggestions(input);
          setAddressSuggestions(suggestions);
        } catch (error) {
          console.error('Error fetching address suggestions:', error);
        } finally {
          setLoadingSuggestions(false);
        }
      }, 300); // Debounce delay for faster feedback
    },
    [setAddress]
  );

  const handleAddressSelect = (selectedAddress: string) => {
    setAddress(selectedAddress);
    setAddressSuggestions([]);
  };

  return (
    <FlatList
      data={addressSuggestions}
      keyExtractor={(item) => item.place_id}
      ListHeaderComponent={
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleImagePick}>
              {avatar ? (
                <Image source={{ uri: avatar.uri }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>+</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.headerText}>Edit Profile</Text>
          </View>
          <View style={styles.formContainer}>
            <InputField
              label="First Name"
              value={firstname}
              onChangeText={setFirstname}
              placeholder="Enter your first name"
            />
            <InputField
              label="Last Name"
              value={lastname}
              onChangeText={setLastname}
              placeholder="Enter your last name"
            />
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
            />
            <InputField
              label="Mobile"
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter your mobile number"
              keyboardType="phone-pad"
            />
            <InputField
              label="Address"
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Enter your address"
            />
            {loadingSuggestions && <ActivityIndicator size="small" color="#0000ff" />}
          </View>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleAddressSelect(item.description)}>
          <Text style={styles.suggestion}>{item.description}</Text>
        </TouchableOpacity>
      )}
      ListFooterComponent={
        <>
          {loadingUpdate ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
              <Text style={styles.updateButtonText}>Update Profile</Text>
            </TouchableOpacity>
          )}
        </>
      }
    />
  );
};

const InputField = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginVertical: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 36,
    color: '#aaa',
  },
  formContainer: {
    alignItems: 'center',
  },
  inputContainer: {
    width: '90%',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  suggestion: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '90%',
    alignSelf: 'center',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
    width: '90%',
    alignSelf: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default EditProfile;
