// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://needles-v1.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Login
export const loginUser = async (credentials) => {
  try {
    console.log("Sending credentials ", credentials);
    const response = await api.post('/Boutique/login', credentials);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// OTP Verification
export const verifyOtp = async (payload) => {
  try {
    const response = await api.post('/Boutique/verify-otp', payload);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// ✅ Fetch Pending Orders by Boutique ID
export const getPendingOrders = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/order`);
    return response.data.orders;
  } catch (error) {
    throw error.response || error;
  }
};

export default api;
