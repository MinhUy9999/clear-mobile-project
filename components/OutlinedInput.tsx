import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type OutlinedInputProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  iconName: string;
  multiline?: boolean; // Support multiline input
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'; // Allow flexible keyboard types
  isNumericOnly?: boolean; // Restrict input to numbers only
};

const OutlinedInput: React.FC<OutlinedInputProps> = ({
  placeholder,
  value,
  onChangeText,
  iconName,
  multiline = false,
  keyboardType = 'default',
  isNumericOnly = false, // Default is no restriction
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.inputContainer, isFocused ? styles.focusedContainer : {}]}>
      <Ionicons name={iconName} size={20} color={isFocused ? '#002DB7' : '#9E9E9E'} style={styles.icon} />
      <View style={styles.inputWrapper}>
        {(value || isFocused) && (
          <Text style={[styles.placeholder, isFocused ? styles.focusedPlaceholder : {}]}>
            {placeholder}
          </Text>
        )}
        <TextInput
          placeholder={isFocused ? '' : placeholder}
          placeholderTextColor="#9E9E9E"
          value={value}
          onChangeText={(text) => {
            if (isNumericOnly) {
              // Restrict input to numbers only
              const numericText = text.replace(/[^0-9]/g, '');
              onChangeText(numericText);
            } else {
              onChangeText(text);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, multiline ? styles.multilineInput : {}]}
          multiline={multiline}
          keyboardType={keyboardType} // Dynamically set keyboard type
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items at the top for multiline
    borderWidth: 2,
    borderColor: '#9E9E9E',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: '#FFF',
  },
  focusedContainer: {
    borderColor: '#002DB7',
  },
  icon: {
    marginTop: 8, // Align icon with the first line of text
    marginRight: 8,
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
  },
  placeholder: {
    position: 'absolute',
    top: -10,
    left: 0,
    fontSize: 12,
    color: '#9E9E9E',
    backgroundColor: '#FFF',
    paddingHorizontal: 4,
  },
  focusedPlaceholder: {
    color: '#002DB7',
  },
  input: {
    fontSize: 16,
    color: '#000',
    paddingVertical: 5,
    paddingTop: 10, // Add padding to prevent overlapping with placeholder
    flex: 1, // Take full vertical space
    textAlignVertical: 'top', // Align text to the top for multiline
  },
  multilineInput: {
    minHeight: 80, // Ensure enough height for multiline input
  },
});

export default OutlinedInput;
