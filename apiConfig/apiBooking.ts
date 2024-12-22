import axios from 'axios';

// Set up the base URL based on the environment
const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://13.229.115.93:5000/api'
  : 'http://13.229.115.93:5000/api';
  console.log('BASE_URL:', BASE_URL);  // Add this line to confirm the base URL

// Define the type for bookingData
interface BookingData {
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  district: string;
  ward: string;
  date: string;
  timeSlot: string;
  quantity: number;
  notes: string;
  totalPrice: number;
  serviceId: string;
}

// API to create a new bookingexport 
export const createBooking = async (bookingData: BookingData) => {
  return await axios.post(`${BASE_URL}/booking/createbooking`, bookingData);
};
