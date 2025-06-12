<template>
  <div class="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-8 space-y-6">
    <h2 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
      Boutique Profile
    </h2>

    <!-- Form Fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input v-model="form.name" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Area</label>
        <input v-model="form.area" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <input v-model="form.location.address" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
        <input v-model="form.location.city" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">State</label>
        <input v-model="form.location.state" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
        <input v-model="form.location.latitude" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="number" step="any" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
        <input v-model="form.location.longitude" class="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white" type="number" step="any" />
      </div>
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input v-model="form.phone" disabled class="w-full p-3 border border-gray-200 rounded-xl bg-gray-100 text-gray-500" type="text" />
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="flex flex-wrap gap-4 mt-4">
      <button @click="updateProfile"
        class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-indigo-600 hover:to-purple-700 transition-all">
        Save Changes
      </button>
      <button @click="logoutHandler"
        class="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-red-600 hover:to-red-700 transition-all">
        Logout
      </button>
      <button @click="$emit('change-password')"
        class="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all">
        Change Password
      </button>
      <button @click="$emit('change-phone')"
        class="bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:from-teal-600 hover:to-teal-700 transition-all">
        Change Phone
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getBoutiqueProfile, updateBoutiqueProfile, logoutBoutique } from '@/services/api';
import { useToast } from 'vue-toastification';

defineProps({ phoneNumber: String });
const emit = defineEmits(['change-password', 'change-phone']);
const toast = useToast();

const form = ref({
  name: '',
  area: '',
  phone: '',
  location: {
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: ''
  }
});

onMounted(async () => {
  try {
    const response = await getBoutiqueProfile();
    const data = response?.data;
    if (data) {
      form.value = {
        name: data.name || '',
        area: data.area || '',
        phone: data.phone || '',
        location: {
          address: data.location?.address || '',
          city: data.location?.city || '',
          state: data.location?.state || '',
          latitude: data.location?.latitude || '',
          longitude: data.location?.longitude || ''
        }
      };
    }
  } catch (error) {
    toast.error('Failed to load profile');
  }
});

const updateProfile = async () => {
  try {
    await updateBoutiqueProfile(form.value);
    toast.success('Profile updated');
  } catch (error) {
    toast.error('Failed to update profile');
  }
};

const logoutHandler = async () => {
  try {
    await logoutBoutique();
    toast.info('Logged out');
    window.location.href = '/login';
  } catch {
    toast.error('Logout failed');
  }
};
</script>
