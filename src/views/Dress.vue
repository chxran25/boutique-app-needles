<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const dress = ref(null);

const fetchDressDetails = async () => {
  try {
    const response = await axios.get(`http://localhost:9000/dresses/${route.params.id}`);
    dress.value = response.data;
  } catch (error) {
    console.error('Failed to fetch dress details:', error);
  }
};

const deleteDress = async () => {
  if (confirm(`Are you sure you want to delete "${dress.value.name}"? This action cannot be undone.`)) {
    try {
      await axios.delete(`http://localhost:9000/dresses/${route.params.id}`);
      alert('Dress deleted successfully!');
      router.push('/catalogue'); // Redirect back to catalogue
    } catch (error) {
      console.error('Failed to delete dress:', error);
      alert('Failed to delete dress. Please try again.');
    }
  }
};

onMounted(fetchDressDetails);
</script>

<template>
  <div class="container mx-auto p-6" v-if="dress">
    <div class="bg-white p-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-6">
      <!-- Dress Image -->
      <img
        :src="dress.image || 'https://via.placeholder.com/400x600.png?text=Dress+Image'"
        alt="Dress Image"
        class="w-full h-40 object-cover rounded-md"
      />

      <!-- Dress Details -->
      <div class="flex-1 text-center md:text-left space-y-4">
        <h2 class="text-3xl font-bold text-gray-900">{{ dress.name }}</h2>
        <p class="text-gray-600 text-lg">{{ dress.type }}</p>
        <p class="text-gray-900 font-bold text-2xl">₹{{ dress.price.toLocaleString() }}</p>
        <p class="text-gray-500 text-lg">Stock: {{ dress.stock }}</p>
        <p class="text-gray-700 text-lg leading-relaxed">{{ dress.description }}</p>

        <!-- Delete Button -->
        <button
          @click="deleteDress"
          class="bg-red-600 text-white py-2 px-4 rounded-lg text-base font-semibold hover:bg-red-800 transition-all shadow-md"
        >
          Delete Dress
        </button>
        
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="text-center py-16">
    <p class="text-2xl font-semibold text-gray-600 animate-pulse">Loading dress details...</p>
  </div>
</template>