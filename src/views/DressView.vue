<template>
  <div class="min-h-screen bg-gradient-to-br from-white to-indigo-50 p-4">
    <!-- Centered Header -->
    <div class="flex justify-center items-center mb-6">
      <h1 class="text-3xl font-extrabold text-indigo-800">Dress Management</h1>
    </div>

    <!-- Centered Tabs -->
    <div class="flex justify-center space-x-4 mb-8">
      <button
        class="px-6 py-3 rounded-full font-semibold shadow-lg text-base"
        :class="tab === 'dressTypes' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200'"
        @click="tab = 'dressTypes'"
      >
        Dress Types
      </button>
      <button
        class="px-6 py-3 rounded-full font-semibold shadow-lg text-base"
        :class="tab === 'catalogue' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200'"
        @click="tab = 'catalogue'"
      >
        Catalogue
      </button>
    </div>

    <!-- Dress Types View -->
    <div v-if="tab === 'dressTypes'">
      <div v-if="loading" class="text-center py-10 text-gray-500">Loading dress types...</div>
      <div v-else-if="dressTypes.length === 0" class="text-center py-10 text-gray-500">No dress types added yet.</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="(dress, index) in dressTypes"
          :key="index"
          class="bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-xl transition-all"
        >
          <h2 class="text-xl font-bold text-indigo-700 mb-3">{{ dress.type }}</h2>
          <div class="flex overflow-x-auto space-x-3 mb-4">
            <img
              v-for="(img, i) in dress.images"
              :key="i"
              :src="img"
              class="w-24 h-24 object-cover rounded-lg border border-gray-200"
              alt="Dress Image"
            />
          </div>
          <div>
            <h3 class="font-semibold text-sm text-gray-700 mb-1">Measurements:</h3>
            <ul class="text-sm text-gray-600 list-disc pl-5">
              <li v-for="(m, i) in dress.measurementRequirements" :key="i">{{ m }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- Catalogue View (Placeholder) -->
    <div v-if="tab === 'catalogue'">
      <div class="text-center py-10 text-gray-500">Catalogue view coming soon...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDressTypesWithDetails } from '@/services/api';

const tab = ref('dressTypes');
const dressTypes = ref([]);
const loading = ref(true);
const boutiqueId = '67963acd15a076d83704ce25'; // Use dynamic routing in real app

const fetchDressTypes = async () => {
  try {
    dressTypes.value = await getDressTypesWithDetails(boutiqueId);
  } catch (error) {
    console.error('Error loading dress types:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDressTypes);
</script>

<style scoped>
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #c4b5fd;
  border-radius: 10px;
}
</style>