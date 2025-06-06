<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";

const dressTypes = ref([]);
const catalogueItems = ref([]);
const activeTab = ref(0); // Keeps track of selected tab

const fetchData = async () => {
  try {
    const [dressRes, catalogueRes] = await Promise.all([
      axios.get("http://localhost:9000/dressTypes"),
      axios.get("http://localhost:9000/catalogue"),
    ]);
    dressTypes.value = dressRes.data;
    catalogueItems.value = catalogueRes.data;
  } catch (error) {
    console.error("Failed to load data", error);
  }
};

onMounted(fetchData);
</script>

<template>
  <section class="p-6 pb-24">
    <h1 class="text-3xl font-bold mb-6 text-gray-800 text-center">Dress Collection</h1>

    <!-- Custom Tabs -->
    <div class="flex justify-center gap-8 mb-6">
      <button 
        class="tab-button" 
        :class="{ 'active-tab': activeTab === 0 }" 
        @click="activeTab = 0"
      >
        Dress Types
      </button>
      <button 
        class="tab-button" 
        :class="{ 'active-tab': activeTab === 1 }" 
        @click="activeTab = 1"
      >
        Catalogue
      </button>
    </div>

    <!-- Tab Content -->
    <div v-if="activeTab === 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div
          v-for="dress in dressTypes"
          :key="dress.id"
          class="bg-white shadow-md rounded-lg p-4 text-center transition-transform transform hover:scale-105"
        >
          <img :src="dress.image" :alt="dress.name" class="w-full h-48 object-cover rounded">
          <h3 class="text-lg font-semibold mt-2">{{ dress.name }}</h3>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 1">
      <div class="bg-white shadow-md rounded-lg p-4">
        <ul>
          <li
            v-for="item in catalogueItems"
            :key="item.id"
            class="flex justify-between border-b py-2 hover:bg-gray-100 transition-colors"
          >
            <span class="font-medium">{{ item.name }}</span>
            <span class="text-gray-700">₹{{ item.price }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Tab button styling */
.tab-button {
  font-size: 1.2rem;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.tab-button:hover::after {
  content: "";
  width: 100%;
  height: 3px;
  background-color: #007bff;
  position: absolute;
  bottom: -3px;
  left: 0;
}

.active-tab {
  color: #007bff;
  border-bottom: 3px solid #007bff;
}
</style>
