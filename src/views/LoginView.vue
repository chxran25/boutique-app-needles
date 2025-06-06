<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Login</h2>

      <form @submit.prevent="handleLogin">
        <!-- Boutique Name -->
        <div class="mb-4">
          <label for="name" class="block text-gray-600 mb-2">Boutique Name</label>
          <input
            type="text"
            id="name"
            v-model="state.name"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter your boutique name"
            required
          />
        </div>

        <!-- Password with Eye Toggle -->
        <div class="mb-6">
          <label for="password" class="block text-gray-600 mb-2">Password</label>
          <div class="relative">
            <input
              :type="state.showPassword ? 'text' : 'password'"
              v-model="state.password"
              class="w-full p-2 pr-12 border border-gray-300 rounded-md"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              @click="state.showPassword = !state.showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-blue-500"
            >
              <svg v-if="!state.showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3l18 18" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Phone Number -->
        <div class="mb-6">
          <label for="phone" class="block text-gray-600 mb-2">Phone Number</label>
          <input
            type="tel"
            id="phone"
            v-model="state.phone"
            maxlength="10"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter 10-digit number (e.g. 7569672503)"
            required
          />
        </div>

        <!-- Login Button with Spinner -->
        <button
          type="submit"
          :disabled="state.loading"
          class="w-full bg-blue-500 text-white py-2 rounded-md transition duration-200 transform hover:scale-105 flex items-center justify-center"
        >
          <span v-if="!state.loading">Login</span>
          <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </button>

        <p v-if="state.errorMessage" class="text-red-500 text-center mt-4">{{ state.errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { loginUser } from '@/services/api';

const router = useRouter();
const toast = useToast();

const state = reactive({
  name: '',
  password: '',
  phone: '',
  errorMessage: '',
  loading: false,
  showPassword: false
});

const handleLogin = async () => {
  try {
    state.errorMessage = '';

    // Allow only 10 digits
    if (!/^\d{10}$/.test(state.phone)) {
      state.errorMessage = 'Please enter a valid 10-digit phone number.';
      return;
    }

    // Format phone as +91xxxxxxxxxx
    const formattedPhone = `+91${state.phone}`;

    state.loading = true;

    const response = await loginUser({
      name: state.name,
      password: state.password,
      phone: formattedPhone // ✅ send formatted phone number
    });

    if (response.status === 200) {
      localStorage.setItem('boutiqueUserId', response.data.boutiqueUserId);
      toast.success('OTP sent to your phone!');
      router.push({
        name: 'otp',
        query: {
          phone: formattedPhone,
          name: state.name
        }
      });
    } else {
      state.errorMessage = response.data?.message || 'Login failed.';
      toast.error(state.errorMessage);
    }
  } catch (error) {
    state.errorMessage = error.data?.message || 'Login error occurred.';
    toast.error(state.errorMessage);
  } finally {
    state.loading = false;
  }
};
</script>
