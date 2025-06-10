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

// ✅ Update Order Status
export const updateOrderStatus = async (boutiqueId, orderId, status) => {
  try {
    const response = await api.post(`/Boutique/${boutiqueId}/order/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to update order status:", error);
    throw error.response || error;
  }
};

// ✅ Fetch dress types with details
export const getDressTypesWithDetails = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/dresstypes`);
    return response.data.dressTypes;
  } catch (error) {
    console.error("❌ Failed to fetch dress types:", error);
    return [];
  }
};

export const deleteDressTypeAPI = async (boutiqueId, dressType) => {
  try {
    const response = await api.delete(`/Boutique/${boutiqueId}/delete-dressType`, {
      data: { boutiqueId, dressType },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to delete dress type:", error);
    throw error.response || error;
  }
};

// ✅ Fetch catalogue with boutique name (used in DressView.vue)
export const getBoutiqueCatalogueWithName = async (boutiqueId) => {
  try {
    const response = await api.get(`/Boutique/${boutiqueId}/catalogue`);
    return {
      catalogue: response.data.catalogue || [],
      boutiqueName: response.data.boutiqueName || 'Untitled Boutique',
    };
  } catch (error) {
    console.error("❌ Failed to fetch boutique catalogue with name:", error);
    throw error.response || error;
  }
};


export default api;
