<script setup>
import { ref, computed, onMounted } from "vue";
import { Search } from "lucide-vue-next";
import axios from "axios";
import DressCard from "@/components/DressCard.vue";
import DressModal from "@/components/DressModal.vue";

const dressStyles = ref([]);
const searchTerm = ref("");
const selectedDress = ref(null);
const showModal = ref(false);

// Fetch dresses from JSON Server
const fetchDresses = async () => {
  try {
    const response = await axios.get("http://localhost:9000/dresses");
    dressStyles.value = response.data;
  } catch (error) {
    console.error("Error fetching dresses:", error);
  }
};

// Filter dresses based on search input
const filteredDresses = computed(() => {
  return dressStyles.value.filter((dress) =>
    dress.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  );
});

// Open modal with selected dress details
const openModal = (dress) => {
  selectedDress.value = dress;
  showModal.value = true;
};

// Close modal
const closeModal = () => {
  showModal.value = false;
  selectedDress.value = null;
};

// Handle dress deletion and update list
const handleDressDeleted = (deletedId) => {
  dressStyles.value = dressStyles.value.filter(dress => dress.id !== deletedId);
};

onMounted(fetchDresses);
</script>

<template>
  <div class="container mx-auto p-6">
    <div class="flex items-center mb-4">
      <Search class="h-5 w-5 mr-2 text-gray-500" />
      <input
        v-model="searchTerm"
        type="text"
        placeholder="Search dresses..."
        class="border border-gray-300 rounded-lg px-3 py-2 w-full"
      />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <DressCard
        v-for="dress in filteredDresses"
        :key="dress.id"
        :dress="dress"
        @view-details="openModal(dress)"
      />
    </div>

    <!-- Modal -->
    <DressModal v-if="showModal" :dress="selectedDress" @close="closeModal" @deleted="handleDressDeleted" />
  </div>
</template>
