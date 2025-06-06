import axios from 'axios';

const api = axios.create({
  baseURL: 'https://needles-v1.onrender.com',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export const loginUser = async (credentials) => {
  try {
    console.log("Sending credentials ",credentials)
    const response = await api.post('/Boutique/login', credentials);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

export const verifyOtp = async (payload) => {
  try {
    const response = await api.post('/Boutique/verify-otp', payload);
    return response;
  } catch (error) {
    throw error.response || error;
  }
};

export default api;
