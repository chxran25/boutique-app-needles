<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
      <h2 class="text-2xl font-semibold text-center text-gray-700 mb-6">Enter OTP</h2>

      <form @submit.prevent="handleOtpSubmit">
        <div class="mb-4">
          <label class="block text-gray-600 mb-2">OTP sent to {{ phone }}</label>
          <input
            type="text"
            v-model="otp"
            class="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter 6-digit OTP"
            maxlength="6"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-green-500 text-white py-2 rounded-md transition duration-200 transform hover:scale-105 flex items-center justify-center"
        >
          <span v-if="!loading">Verify OTP</span>
          <svg v-else class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </button>

        <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { verifyOtp } from '@/services/api';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const name = route.query.name || '';
const phone = route.query.phone || '';
const boutiqueUserId = localStorage.getItem('boutiqueUserId');
const otp = ref('');
const errorMessage = ref('');
const loading = ref(false);

const handleOtpSubmit = async () => {
  errorMessage.value = '';

  if (otp.value.length !== 6 || isNaN(otp.value)) {
    errorMessage.value = 'Please enter a valid 6-digit OTP.';
    return;
  }

  loading.value = true;

  try {
    const response = await verifyOtp({
      name,
      phone,
      otp: otp.value,
      boutiqueUserId
    });

    if (response.status === 200) {
      toast.success('OTP verified. Welcome!');
      router.push({ name: 'home' });
    } else {
      errorMessage.value = response.data?.message || 'Invalid OTP.';
      toast.error(errorMessage.value);
    }
  } catch (error) {
    errorMessage.value = error.data?.message || 'Verification failed.';
    toast.error(errorMessage.value);
  } finally {
    loading.value = false;
  }
};
</script>
