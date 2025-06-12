<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
         @click.self="closeModal">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-6 animate-modal-enter">
        <!-- Header -->
        <h3 class="text-xl font-bold text-center bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 rounded-lg">
          Change Phone Number
        </h3>

        <!-- Step 1: Request OTP -->
        <div v-if="step === 1" class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">New Phone Number</label>
          <div class="flex">
            <span class="inline-flex items-center px-3 bg-gray-100 text-gray-600 border border-r-0 border-gray-300 rounded-l-lg text-sm">
              +91
            </span>
            <input v-model="rawPhone"
                   type="tel"
                   maxlength="10"
                   placeholder="Enter 10-digit phone number"
                   class="w-full p-3 border border-gray-300 rounded-r-lg"
                   :disabled="loading" />
          </div>

          <button @click="requestOtp"
                  class="w-full bg-gradient-to-r from-teal-500 to-teal-600 text-white py-2 rounded-lg font-semibold shadow-md hover:from-teal-600 hover:to-teal-700 transition-all"
                  :disabled="loading">
            {{ loading ? 'Sending OTP...' : 'Send OTP to Existing Number' }}
          </button>
        </div>

        <!-- Step 2: Confirm OTP -->
        <div v-else class="space-y-4">
          <label class="block text-sm font-medium text-gray-700">Enter OTP</label>
          <input v-model="otp"
                 type="text"
                 placeholder="6-digit OTP"
                 class="w-full p-3 border rounded-lg"
                 :disabled="loading" />

          <button @click="confirmOtp"
                  class="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-green-700 transition-all"
                  :disabled="loading">
            {{ loading ? 'Verifying...' : 'Verify and Update Phone' }}
          </button>
        </div>

        <!-- Close -->
        <button @click="closeModal"
                class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl">
          &times;
        </button>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toastification';
import { requestPhoneUpdate, confirmPhoneUpdate } from '@/services/api';

const emit = defineEmits(['close', 'phone-updated']);

const isOpen = ref(true);
const rawPhone = ref('');
const otp = ref('');
const step = ref(1);
const loading = ref(false);
const toast = useToast();

const closeModal = () => {
  isOpen.value = false;
  emit('close');
};

const requestOtp = async () => {
  const fullPhone = `+91${rawPhone.value}`;

  if (!/^[+]91\d{10}$/.test(fullPhone)) {
    toast.error("Enter a valid 10-digit phone number");
    return;
  }

  loading.value = true;
  try {
    await requestPhoneUpdate({ newPhone: fullPhone });
    toast.success("OTP sent to current phone. Enter it to confirm.");
    step.value = 2;
  } catch (err) {
    toast.error(err.data?.message || "Failed to send OTP");
  } finally {
    loading.value = false;
  }
};

const confirmOtp = async () => {
  if (otp.value.length !== 6) {
    toast.error("Please enter a 6-digit OTP");
    return;
  }

  const fullPhone = `+91${rawPhone.value}`;

  loading.value = true;
  try {
    await confirmPhoneUpdate({ otp: otp.value, newPhone: fullPhone });
    toast.success("Phone number updated successfully");
    emit('phone-updated', fullPhone);
    closeModal();
  } catch (err) {
    toast.error(err.data?.message || "OTP verification failed");
  } finally {
    loading.value = false;
  }
};
</script>