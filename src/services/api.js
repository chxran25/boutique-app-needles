// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://needles-v1.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Token management
let authToken = null;

// Set token helper
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('authToken', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('authToken');
  }
};

// Get token from localStorage on app start
export const initializeAuth = () => {
  const token = localStorage.getItem('authToken');
  if (token) {
    setAuthToken(token);
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!(authToken || localStorage.getItem('authToken'));
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add token to headers if available
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    } else {
      // Try to get token from localStorage as fallback
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        authToken = token; // Update in-memory token
      }
    }

    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔐 Auth Header:', config.headers.Authorization ? 'Present' : 'Missing');

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.warn('🚨 Unauthorized - clearing auth token');
      setAuthToken(null);
      localStorage.removeItem('boutiqueUserId');

      // Redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Login
export const loginUser = async (credentials) => {
  try {
    console.log('🔐 Attempting login with:', {
      name: credentials.name,
      phone: credentials.phone
    });

    const response = await api.post('/Boutique/login', credentials);

    console.log('✅ Login response:', response.data);

    // Store boutiqueUserId if provided
    if (response.data?.boutiqueUserId) {
      localStorage.setItem('boutiqueUserId', response.data.boutiqueUserId);
    }

    return response;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ OTP Verification - This is where JWT token should be received
export const verifyOtp = async (payload) => {
  try {
    console.log('🔑 Verifying OTP with payload:', payload);

    const response = await api.post('/Boutique/verify-otp', payload);

    console.log('✅ OTP verification response:', response.data);

    // Store JWT token if provided in response
    if (response.data?.token) {
      console.log('🎟️ JWT token received, storing...');
      setAuthToken(response.data.token);
    } else if (response.data?.accessToken) {
      console.log('🎟️ Access token received, storing...');
      setAuthToken(response.data.accessToken);
    } else if (response.data?.authToken) {
      console.log('🎟️ Auth token received, storing...');
      setAuthToken(response.data.authToken);
    } else {
      console.warn('⚠️ No token found in OTP response. Checking for session cookies...');
    }

    // Store user data if provided
    if (response.data?.user) {
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }

    return response;
  } catch (error) {
    console.error('❌ OTP verification failed:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Logout helper
export const logout = () => {
  console.log('🚪 Logging out...');
  setAuthToken(null);
  localStorage.removeItem('boutiqueUserId');
  localStorage.removeItem('userData');
};

// ✅ Fetch pending orders
export const getPendingOrders = async () => {
  try {
    console.log('📋 Fetching pending orders...');

    // Check if we have authentication
    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await api.get('/Boutique/order');
    console.log('✅ Pending orders fetched successfully:', response.data);
    return response.data.orders || [];
  } catch (error) {
    console.error('❌ Failed to fetch pending orders:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error.response || error;
  }
};

// ✅ Create bill
export const createBill = async (payload) => {
  try {
    console.log('💰 Creating bill...');
    const response = await api.post('/Boutique/createBill', payload);
    console.log('✅ Bill created successfully');
    return response.data;
  } catch (error) {
    console.error('❌ API error from createBill:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Fetch boutique catalogue
export const getCatalogueByBoutiqueId = async () => {
  try {
    console.log('📚 Fetching catalogue...');

    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await api.get('/Boutique/catalogue');
    console.log('✅ Catalogue fetched successfully:', response.data);
    return response.data.catalogue || [];
  } catch (error) {
    console.error('❌ Failed to fetch catalogue:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    return [];
  }
};

// ✅ Fetch paid orders
export const getPaidOrders = async () => {
  try {
    console.log('💳 Fetching paid orders...');

    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await api.get('/Boutique/PaidOrders');
    console.log('✅ Paid orders fetched successfully');
    return response.data.orders || [];
  } catch (error) {
    console.error('❌ Failed to fetch paid orders:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    return [];
  }
};

// ✅ Update Order Status
export const updateOrderStatus = async (orderId, status) => {
  console.log(`🔄 Updating order ${orderId} to status: ${status}...`);
  const response = await api.post(`/Boutique/order/${orderId}/status`, { status });
  console.log('✅ Order status updated successfully');
  return response.data;
};

// ✅ Fetch dress types with details
export const getDressTypesWithDetails = async () => {
  try {
    const response = await api.get('/Boutique/dresstypes');
    return response.data.dressTypes || [];
  } catch (error) {
    console.error('❌ Failed to fetch dress types:', error.response?.data || error.message);
    return [];
  }
};

// ✅ Add dress type
export const addDressType = async (formData) => {
  try {
    const response = await api.post('/Boutique/add-dress-type', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add dress type:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Delete dress type
export const deleteDressTypeAPI = async (boutiqueId, dressType) => {
  try {
    const response = await api.delete('/Boutique/delete-dressType', {
      data: { boutiqueId, dressType },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete dress type:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Fetch catalogue with boutique name
export const getBoutiqueCatalogueWithName = async () => {
  try {
    const response = await api.get('/Boutique/catalogue');
    return {
      catalogue: response.data.catalogue || [],
      boutiqueName: response.data.boutiqueName || 'Untitled Boutique',
    };
  } catch (error) {
    console.error('❌ Failed to fetch boutique catalogue with name:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Add catalogue items
export const addCatalogueItems = async (newItems) => {
  try {
    const response = await api.post('/Boutique/add-catalogue-item', { newItems });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add catalogue items:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Delete catalogue items
export const deleteCatalogueItems = async (itemNames) => {
  try {
    const response = await api.delete('/Boutique/delete-catalogue-item', {
      data: { itemNames },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete catalogue items:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Fetch alteration requests
export const getAlterationRequests = async () => {
  try {
    console.log('🔧 Fetching alteration requests...');

    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await api.get('/Boutique/alterations');
    console.log('✅ Alteration requests fetched successfully');
    return response.data.alterationRequests || [];
  } catch (error) {
    console.error('❌ Failed to fetch alteration requests:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error.response || error;
  }
};

// ✅ Mark alteration as reviewed
export const reviewAlterationRequest = async (requestId) => {
  console.log("📦 Reviewing alteration for ID:", requestId);
  const response = await api.patch(`/Boutique/review-alteration/${requestId}`);
  return response.data;
};

export const getReviewedAlterationRequests = async () => {
  try {
    console.log('🔍 Fetching reviewed alteration requests...');
    const response = await api.get('/Boutique/alterations/active');
    console.log('✅ Reviewed alterations fetched:', response.data);
    return response.data.requests || [];
  } catch (error) {
    console.error('❌ Failed to fetch reviewed alterations:', error.response?.data || error.message);
    return [];
  }
};

// =============== PROFILE MANAGEMENT FUNCTIONS ===============

// ✅ Get boutique profile data
export const getBoutiqueProfile = async () => {
  try {
    console.log('👤 Fetching boutique profile...');

    if (!isAuthenticated()) {
      throw new Error('No authentication token found. Please login again.');
    }

    const response = await api.get('/Boutique/');
    console.log('✅ Profile data fetched successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch profile:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      throw new Error('Authentication required. Please log in again.');
    }
    throw error.response || error;
  }
};

// ✅ Update boutique profile details
export const updateBoutiqueProfile = async (profileData) => {
  try {
    console.log('✏️ Updating boutique profile...');
    const response = await api.patch('/Boutique/edit', profileData);
    console.log('✅ Profile updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update profile:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Change password
export const changePassword = async (passwordData) => {
  try {
    console.log('🔐 Changing password...');
    const response = await api.patch('/Boutique/change-password', passwordData);
    console.log('✅ Password changed successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to change password:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Request phone number update
export const requestPhoneUpdate = async (phoneData) => {
  try {
    console.log('📱 Requesting phone number update...');
    const response = await api.post('/Boutique/request-phone-update', phoneData);
    console.log('✅ Phone update request sent successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to request phone update:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Confirm phone number update
export const confirmPhoneUpdate = async (confirmationData) => {
  try {
    console.log('✅ Confirming phone number update...');
    const response = await api.post('/Boutique/confirm-phone-update', confirmationData);
    console.log('✅ Phone number updated successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to confirm phone update:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Add header images
export const addHeaderImages = async (imageFiles) => {
  try {
    console.log('🖼️ Adding header images...');
    
    const formData = new FormData();
    
    // Handle multiple image files
    if (Array.isArray(imageFiles)) {
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });
    } else {
      formData.append('images', imageFiles);
    }

    const response = await api.post('/Boutique/header-image/add', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('✅ Header images added successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to add header images:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Delete individual header image
export const deleteHeaderImage = async ({ imageUrl }) => {
  try {
    console.log('🗑️ Deleting single header image:', imageUrl);
    const response = await api.delete('/Boutique/header-image/delete', {
      data: { imageUrl },
    });
    console.log('✅ Header image deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete single header image:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Delete all header images
export const deleteAllHeaderImages = async (imageData) => {
  try {
    console.log('🗑️ Deleting header image...');
    const response = await api.delete('/Boutique/header-image/delete-all', {
      data: imageData,
    });
    console.log('✅ Header image deleted successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete header image:', error.response?.data || error.message);
    throw error.response || error;
  }
};

// ✅ Logout boutique
export const logoutBoutique = async () => {
  try {
    console.log('🚪 Logging out boutique...');
    const response = await api.post('/Boutique/logout');
    
    // Clear local storage and tokens
    logout();
    
    console.log('✅ Boutique logged out successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Failed to logout boutique:', error.response?.data || error.message);
    
    // Even if the API call fails, clear local data
    logout();
    
    throw error.response || error;
  }
};

export default api;