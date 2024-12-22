// CreateBookingScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { createBooking } from '../apiConfig/apiBooking';
import {
  fetchDistricts,
  fetchWards,
  fetchAddressSuggestions,
  getHotDistricts,
} from '../apiConfig/apiMap';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import OutlinedInput from '@/components/OutlinedInput';
import FloatingPicker from '@/components/FloatingPicker';
import TotalPriceRow from '@/components/TotalPriceRow';
import * as Animatable from 'react-native-animatable';
// Define the Service type
type Service = {
  _id: string;
  title: string;
  price: number;
  description: string[];
  thumb: string;
  category: string;
};

// Define the route parameters
type RouteParams = {
  service: Service;
};

// Define the HotDistrict type
type HotDistrict = {
  name: string;
  percentage: number;
};

// Define the AddressSuggestion type
type AddressSuggestion = {
  description: string;
  place_id: string;
};

// Define the District and Ward types
type District = {
  code: string;
  name: string;
  // Add other fields if necessary
};

type Ward = {
  code: string;
  name: string;
  // Add other fields if necessary
};

const CreateBookingScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const service = route.params?.service;

  if (!service) {
    return <Text>Service not found</Text>;
  }

  // State variables
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [districtName, setDistrictName] = useState(''); // Store district name
  const [districtCode, setDistrictCode] = useState(''); // Store district code
  const [wardName, setWardName] = useState(''); // Store ward name
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeSlot, setTimeSlot] = useState('08:00');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [totalPrice, setTotalPrice] = useState<number>(service.price);
  const [hotDistricts, setHotDistricts] = useState<HotDistrict[]>([]);
  const [districtList, setDistrictList] = useState<District[]>([]);
  const [wardList, setWardList] = useState<Ward[]>([]);
  // const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [notification, setNotification] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Trạng thái loading

  /**
   * Fetch hot districts and all districts on component mount
   */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch hot districts
        const hotDistrictsResponse = await getHotDistricts();
        if (Array.isArray(hotDistrictsResponse)) {
          setHotDistricts(hotDistrictsResponse);
        } else {
          console.error('Invalid hot districts data:', hotDistrictsResponse);
          setHotDistricts([]);
        }

        // Fetch all districts
        const districtsResponse = await fetchDistricts();
        if (Array.isArray(districtsResponse)) {
          setDistrictList(districtsResponse);
        } else {
          console.error('Invalid district data:', districtsResponse);
          setDistrictList([]);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setHotDistricts([]);
        setDistrictList([]);
      }
    };

    fetchInitialData();
  }, []);

  /**
   * Fetch wards whenever a district is selected
   */
  useEffect(() => {
    if (districtCode) { // Use districtCode for fetching wards
      const fetchWardData = async () => {
        try {
          const wards = await fetchWards(districtCode); // Use districtCode
          if (Array.isArray(wards)) {
            setWardList(wards);
            // Reset ward selection when district changes
            setWardName('');
          } else {
            console.error('Invalid ward data:', wards);
            setWardList([]);
          }
        } catch (error) {
          console.error('Error fetching wards:', error);
          setWardList([]);
        }
      };

      fetchWardData();
    } else {
      // If no district is selected, clear wards
      setWardList([]);
      setWardName('');
    }
  }, [districtCode]);

  /**
   * Update percentage and notification when district or hotDistricts change
   */
  useEffect(() => {
    if (districtName && districtList.length > 0) {
      // Check if the selected district is a hot district
      const hotDistrict = hotDistricts.find((hd) => hd.name === districtName);

      if (hotDistrict) {
        setPercentage(hotDistrict.percentage);
        setNotification(
          `Price increase ${hotDistrict.percentage}% because you choose hot district ${hotDistrict.name}.`,
        );
      } else {
        setPercentage(0);
        setNotification('');
      }
    } else {
      setPercentage(0);
      setNotification('');
    }
  }, [districtName, hotDistricts]);

  /**
   * Update total price whenever quantity or percentage changes
   */
  useEffect(() => {
    const basePrice = service.price;
    const updatedPrice = basePrice * (1 + percentage / 100);
    setTotalPrice(updatedPrice * quantity);
  }, [quantity, percentage, service.price]);

  /**
   * Handle booking creation
   */
 // Handle create booking
 const handleCreateBooking = async () => {
  if (!customerName || !email || !phoneNumber || !address || !districtName || !wardName) {
    Alert.alert('Error', 'Please fill in all required fields.');
    return;
  }

  setLoading(true);
  try {
    const bookingData = {
      service: service._id,
      customerName,
      email,
      phoneNumber,
      address,
      district: districtName,
      ward: wardName,
      date: date.toISOString().split('T')[0],
      timeSlot,
      quantity,
      notes,
      totalPrice,
    };

    await createBooking(bookingData);
    setModalVisible(true);
  } catch (error) {
    console.error('Error creating booking:', error);
    Alert.alert('Error', 'Failed to create booking. Please try again later.');
  } finally {
    setLoading(false);
  }
};

  
  const handleDateChange = (day: any) => {
    setDate(new Date(day.dateString));
    setShowDatePicker(false);
  };


  const getAvailableTimeSlots = () => {
    const now = new Date();
    const selectedDate = date;

    const startHour = 7; 
    const endHour = 18;

    const availableSlots: string[] = [];
    for (let hour = startHour; hour <= endHour; hour += 2) {
      const timeString = `${hour < 10 ? '0' + hour : hour}:00`;
      availableSlots.push(timeString);
    }

    if (selectedDate.toDateString() === now.toDateString()) {
      // If selected date is today, filter out past time slots
      return availableSlots.filter((slot) => {
        const [hours, minutes] = slot.split(':').map(Number);
        const slotTime = new Date(now);
        slotTime.setHours(hours, minutes, 0, 0);
        return slotTime > now;
      });
    } else {
      return availableSlots;
    }
  };

  return (
    <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    style={styles.container}
  >
     {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0099FF" />
        </View>
         )}
    <ScrollView contentContainerStyle={styles.scrollContent}>
         {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}><Ionicons name="chevron-back-outline" size={24} color="#fff" /></Text>
        </TouchableOpacity>
        <Text style={styles.title}>{service.title}</Text>
      </View>
      
       {/* Customer Name */}
       <OutlinedInput
        placeholder="Full Name"
        value={customerName}
        onChangeText={setCustomerName}
        iconName="person-outline"
      />
     
     <OutlinedInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        iconName="mail-outline"
      />
     <OutlinedInput
  placeholder="Phone Number"
  value={phoneNumber}
  onChangeText={setPhoneNumber}
  iconName="call-outline"
  keyboardType="phone-pad" 
  isNumericOnly={true}
/>

      <OutlinedInput
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
        iconName="location-outline"
      />
    

<FloatingPicker
  placeholder="Select District"
  selectedValue={districtName}
  onValueChange={(itemValue) => {
    setDistrictName(itemValue);
    const selectedDistrict = districtList.find((d) => d.name === itemValue);
    if (selectedDistrict) setDistrictCode(selectedDistrict.code);
  }}
  items={districtList.map((district) => ({
    label: district.name,
    value: district.name,
  }))}
/>

<FloatingPicker
  placeholder="Select Ward"
  selectedValue={wardName}
  onValueChange={(itemValue) => setWardName(itemValue)}
  items={wardList.map((ward) => ({
    label: ward.name,
    value: ward.name,
  }))}
/>

<FloatingPicker
  placeholder="Select Date"
  selectedValue={date}
  onValueChange={(selectedDate) => setDate(selectedDate)}
  isDatePicker={true}
/>


<FloatingPicker
  placeholder="Select Time Slot"
  selectedValue={timeSlot}
  onValueChange={(selectedSlot) => setTimeSlot(selectedSlot)}
  items={getAvailableTimeSlots().map((slot) => ({
    label: slot,
    value: slot,
  }))}
/>


<OutlinedInput
  placeholder="Quantity"
  value={quantity}
  onChangeText={(value) => setQuantity(value)}
  iconName="list-outline"
  keyboardType="numeric" // Specify numeric input
/>


<OutlinedInput
  placeholder="Note"
  value={notes}
  onChangeText={setNotes}
  iconName="document-text-outline"
  multiline={true} // Enable multiline input
/>


      <Text style={styles.notification}>{notification}</Text>
      <TotalPriceRow
  totalPrice={totalPrice}
  onPressBookNow={handleCreateBooking}
/>

    </ScrollView>
    {/* Modal thông báo thành công */}
    <Modal
      transparent={true}
      visible={modalVisible}
      animationType="slide"
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <Animatable.View  animation="pulse" // Hiệu ứng co giãn (pulse)
        duration={1500}   // Thời gian mỗi lần co giãn (1000ms)
        iterationCount="infinite" // Chạy liên tục
        easing="ease-in-out">
          <Ionicons name="thumbs-up-outline" size={64} color="#4CAF50" />
          </Animatable.View>
          <Text style={styles.modalTitle}>Scheduled successfully!</Text>
          <Text style={styles.modalMessage}>
          Thank you for booking our service.
          </Text>
          <TouchableOpacity
            style={styles.okButton}
            onPress={() => {
              setModalVisible(false);
              navigation.navigate('MainTabs'); // Chuyển về trang chủ
            }}
          >
            <Text style={styles.okButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
   marginTop: 30,
    padding: 10,
    backgroundColor: "#F9F9F9",
  },
  header: {
backgroundColor: '#0099FF',
  paddingHorizontal: 16,
  paddingVertical: 20,
  flexDirection: 'row',
  alignItems: 'center',
  borderBottomLeftRadius: 20, // Rounded bottom-left corner
  borderBottomRightRadius: 20, // Rounded bottom-right corner
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4, // For Android shadow
  marginBottom:20
  },
  backButton: {
    fontSize: 18,
    color: "#007BFF",
    marginRight: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  picker: {
    height: 50,
    marginBottom: 12,
  },
  suggestions: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    padding: 8,
    borderRadius: 4,
  },
  
  button: {
    backgroundColor: '#f0ad4e',
    padding: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  notification:{
    color: '#ff0000',
   fontSize: 14,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#4CAF50',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 10,
  },
  okButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  okButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center', 
    padding: 16, 
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
});

export default CreateBookingScreen;
          