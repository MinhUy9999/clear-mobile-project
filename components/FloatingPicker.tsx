import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';

type FloatingPickerProps = {
  placeholder: string;
  selectedValue: string | Date;
  onValueChange: (value: string | Date) => void;
  items?: { label: string; value: string }[]; // For Picker only
  isDatePicker?: boolean; // To differentiate between a Date Picker and regular Picker
};

const FloatingPicker: React.FC<FloatingPickerProps> = ({
  placeholder,
  selectedValue,
  onValueChange,
  items,
  isDatePicker = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false); // For Calendar toggle

  return (
    <>
      <View style={[styles.inputContainer, isFocused ? styles.focusedContainer : {}]}>
        {(selectedValue || isFocused) && (
          <Text style={[styles.placeholder, isFocused ? styles.focusedPlaceholder : {}]}>
            {placeholder}
          </Text>
        )}
        {isDatePicker ? (
          <TouchableOpacity
            onPress={() => {
              setShowCalendar(true);
              setIsFocused(true);
            }}
            style={styles.touchable}
          >
            <Text style={styles.dateText}>
              {selectedValue instanceof Date
                ? selectedValue.toLocaleDateString()
                : placeholder}
            </Text>
          </TouchableOpacity>
        ) : (
          <Picker
            selectedValue={typeof selectedValue === 'string' ? selectedValue : ''}
            style={styles.picker}
            onValueChange={(itemValue) => {
              onValueChange(itemValue);
              setIsFocused(true);
            }}
            dropdownIconColor="#002DB7" // Change dropdown icon color
            mode="dropdown" // Use dropdown mode for better UI
          >
            <Picker.Item label={placeholder} value="" style={styles.pickerItem} />
            {items &&
              items.map((item) => (
                <Picker.Item
                  key={item.value}
                  label={item.label}
                  value={item.value}
                  style={styles.pickerItem}
                />
              ))}
          </Picker>
        )}
      </View>

      {/* Calendar for Date Picker */}
      {isDatePicker && showCalendar && (
        <Calendar
          markedDates={{
            [selectedValue instanceof Date
              ? selectedValue.toISOString().split('T')[0]
              : '']: { selected: true, selectedColor: 'blue' },
          }}
          onDayPress={(day) => {
            setShowCalendar(false);
            setIsFocused(false);
            onValueChange(new Date(day.dateString));
          }}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 2,
    borderColor: '#9E9E9E',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 0,
    marginBottom: 12,
    backgroundColor: '#FFF',
    height: 70, // Set a consistent height for the container
    justifyContent: 'center', // Center content vertically
  },
  focusedContainer: {
    borderColor: '#002DB7',
  },
  placeholder: {
    position: 'absolute',
    top: -10,
    left: 10,
    fontSize: 12,
    color: '#9E9E9E',
    backgroundColor: '#FFF',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  focusedPlaceholder: {
    color: '#002DB7',
  },
  picker: {
    flex: 1, // Allow the picker to take all available space
    fontSize: 16, // Set a readable font size
    color: '#000',
  },
  pickerItem: {
    fontSize: 16,
    color: '#000',
  },
  touchable: {
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
});

export default FloatingPicker;
