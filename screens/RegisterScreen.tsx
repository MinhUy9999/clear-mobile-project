import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { NavigationProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { registerUser } from '@/apiConfig/apiUser';


const RegisterScreen = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [email, setEmail] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mobile, setMobile] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !firstname || !lastname || !mobile || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await registerUser({ email, password, firstname, lastname, mobile });
      setLoading(false);
      Alert.alert('Success', 'Registration successful. Go to login.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error) {
      setLoading(false);
      Alert.alert('Registration failed', error.response?.data?.mes || 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Let’s</Text>
        <Text style={styles.headerSubtitle}>Create Your Account</Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        {/* Full Name Input */}
        <View style={styles.inputContainer}>
          <Icon name="account-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#6C757D"
            value={firstname}
            onChangeText={setFirstname}
          />
        </View>

        {/* Last Name Input */}
        <View style={styles.inputContainer}>
          <Icon name="account-details-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Last Name"
            placeholderTextColor="#6C757D"
            value={lastname}
            onChangeText={setLastname}
          />
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Icon name="email-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#6C757D"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Mobile Input */}
        <View style={styles.inputContainer}>
          <Icon name="phone-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor="#6C757D"
            value={mobile}
            onChangeText={setMobile}
            keyboardType="phone-pad"
          />
        </View>

        {/* Password Input */}
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

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <Icon name="lock-check-outline" size={24} color="#6C757D" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Retype Password"
            placeholderTextColor="#6C757D"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          >
            <Icon name={confirmPasswordVisible ? 'eye' : 'eye-off'} size={24} color="#6C757D" />
          </TouchableOpacity>
        </View>

      

        {/* Sign Up Button */}
        <TouchableOpacity
          style={styles.signUpButton}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.signUpButtonText}>{loading ? 'Registering...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerText}>
            Have an account? <Text style={styles.signInText}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#E9F5F8',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#3E4E5E',
  },
  headerSubtitle: {
    fontSize: 24,
    fontWeight: '400',
    color: '#3E4E5E',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#CED4DA',
    paddingHorizontal: 20,
    marginBottom: 15,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#212529',
  },
  eyeIcon: {
    marginLeft: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  termsText: {
    fontSize: 14,
    color: '#6C757D',
  },
  signUpButton: {
    backgroundColor: '#3E4E5E',
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  signUpButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  footerText: {
    fontSize: 14,
    color: '#6C757D',
    textAlign: 'center',
  },
  signInText: {
    fontWeight: '600',
    color: '#3E4E5E',
  },
});

export default RegisterScreen;
