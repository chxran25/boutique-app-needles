// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://needles-v1.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ✅ Login
export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/Boutique/login', credentials);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// ✅ OTP Verification
export const verifyOtp = async (payload) => {
  try {
    const response = await api.post('/Boutique/verify-otp', payload);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

// ✅ Fetch pending orders
export const getPendingOrders = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/order`);
    return response.data.orders;
  } catch (error) {
    throw error.response || error;
  }
};

// ✅ Create bill (replaces acceptOrder)
export const createBill = async (boutiqueId, payload) => {
  try {
    const endpoint = `/Boutique/${boutiqueId}/createBill`;
    console.log("📦 API: Posting to", endpoint);
    const response = await api.post(endpoint, payload);
    return response.data;
  } catch (error) {
    console.error("❌ API error from createBill:", error);
    throw error.response || error;
  }
};

// ✅ Fetch boutique catalogue
export const getCatalogueByBoutiqueId = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/catalogue`);
    return response.data.catalogue;
  } catch (error) {
    console.error("❌ Failed to fetch catalogue:", error);
    return [];
  }
};

// ✅ Fetch paid orders
export const getPaidOrders = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/PaidOrders`);
    return response.data.orders;
  } catch (error) {
    console.error("❌ Failed to fetch paid orders:", error);
    return [];
  }
};

export default api;
