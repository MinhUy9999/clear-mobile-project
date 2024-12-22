import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { updateCurrentUser, getCurrentUser } from '../apiConfig/apiUser'; // Import API functions

const EditProfile = () => {
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await getCurrentUser();
        setFirstname(user.firstname);
        setLastname(user.lastname);
        setEmail(user.email);
        setMobile(user.mobile);
        setAddress(user.address);
        setAvatar(user.avatar ? { uri: user.avatar } : null);
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };
    fetchUserData();
  }, []);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleUpdate = async () => {
    if (!firstname || !lastname || !email || !mobile || !address) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }
  
    const userData = {
      firstname,
      lastname,
      email,
      mobile,
      address,
    };
  
    if (avatar && avatar.uri) {
      userData.avatar = {
        uri: avatar.uri,
        name: avatar.uri.split('/').pop(),
        type: avatar.type || 'image/jpeg',
      };
    }
  
    try {
      const response = await updateCurrentUser(userData);
  
      if (response.success) {
        Alert.alert('Success', 'Profile updated successfully!');
      } else {
        Alert.alert('Error', response.mes || 'Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update profile.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>First Name</Text>
      <TextInput
        style={styles.input}
        value={firstname}
        onChangeText={setFirstname}
        placeholder="Enter your first name"
      />

      <Text style={styles.label}>Last Name</Text>
      <TextInput
        style={styles.input}
        value={lastname}
        onChangeText={setLastname}
        placeholder="Enter your last name"
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
      />

      <Text style={styles.label}>Mobile</Text>
      <TextInput
        style={styles.input}
        value={mobile}
        onChangeText={setMobile}
        placeholder="Enter your mobile number"
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Address</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter your address"
      />

      <TouchableOpacity onPress={handleImagePick} style={styles.avatarPicker}>
        {avatar ? (
          <Image source={{ uri: avatar.uri }} style={styles.avatar} />
        ) : (
          <Text style={styles.avatarPlaceholder}>Pick an Avatar</Text>
        )}
      </TouchableOpacity>

      <Button title="Update Profile" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  avatarPicker: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    fontSize: 16,
    color: '#aaa',
  },
});

export default EditProfile;
