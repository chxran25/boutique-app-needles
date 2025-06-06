import axios from 'axios';

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: 'https://needles-v1.onrender.com', // Replace with your actual API base URL
  headers: {
    'Content-Type': 'application/json', // Ensure you're sending JSON content
  },
  withCredentials: true, // Include cookies (httpOnly) with requests
});

// Function to handle login
export const loginUser = async (credentials) => {
  try {
    console.log('Sending credentials to backend:', credentials);
    // Send a POST request to the /Boutique/login endpoint with the provided credentials
    const response = await api.post('/Boutique/login', credentials);
    return response.data; // Return the data from the response
  } catch (error) {
    console.error('Login failed', error);
    throw error; // The error will be caught in the calling component
  }
};
