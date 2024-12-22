import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { loginUser } from '@/apiConfig/apiUser';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(email, password);

      console.log('API Response:', response);

      if (response.success) {
        const { Accesstoken, userData } = response.rs;

        await AsyncStorage.setItem('token', Accesstoken);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        console.log('Token and userData saved to AsyncStorage.');

        navigation.navigate('MainTabs');
      } else {
        Alert.alert('Error', 'Invalid credentials');
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      Alert.alert(
        'Login failed',
        error.response?.data?.message || 'An unexpected error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
      <TouchableOpacity
  style={styles.goBackButton}
  onPress={() => navigation.navigate('MainTabs')} 
>
  <Icon name="arrow-left" size={28} color="#3E4E5E" />
</TouchableOpacity>

        <Image source={require('../assets/images/logo.png')} style={styles.headerImage} />
        <Text style={styles.headerTitle}>Cleeny</Text>
        <Text style={styles.headerSubtitle}>Cleaning Service Booking App</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email or Phone"
            placeholderTextColor="#6C757D"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#6C757D"
            secureTextEntry={!passwordVisible}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            <Icon name={passwordVisible ? 'eye' : 'eye-off'} size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.actionButton, styles.loginButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.actionButtonText}>Login</Text>}
      </TouchableOpacity>
      <Text style={styles.orText}>or</Text>
      <TouchableOpacity
        style={[styles.actionButton, styles.createAccountButton]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.actionButtonText}>Create an account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E9F5F8',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    width: '100%',
  },
  goBackButton: {
    position: 'absolute',
    left: 0,
    top: 10,
    padding: 10,
  },
  headerImage: {
    width: '80%',
    height: undefined,
    aspectRatio: 1,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3E4E5E',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#3E4E5E',
  },
  formContainer: {
    width: '100%',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CED4DA',
    marginBottom: 15,
    paddingHorizontal: 20,
    height: 50,
    width: '100%',
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  forgotPasswordText: {
    color: '#6C757D',
    fontSize: 14,
    textAlign: 'right',
    marginTop: 5,
  },
  actionButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#3E4E5E',
  },
  createAccountButton: {
    backgroundColor: '#A9D5E6',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    fontSize: 16,
    color: '#6C757D',
    marginVertical: 10,
  },
});

export default LoginScreen;
