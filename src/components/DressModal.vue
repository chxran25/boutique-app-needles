<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { Trash2, X } from "lucide-vue-next";
import axios from "axios";

const props = defineProps({
  dress: Object,
});

const emit = defineEmits(["close", "deleted"]);

// State for delete confirmation modal
const showDeleteConfirm = ref(false);

// Function to delete the dress from JSON Server
const confirmDelete = async () => {
  try {
    await axios.delete(`http://localhost:9000/dresses/${props.dress.id}`);
    emit("deleted", props.dress.id);
    emit("close"); // Close the main modal
  } catch (error) {
    console.error("Error deleting dress:", error);
  }
};

// Open delete confirmation modal
const openDeleteConfirm = () => {
  showDeleteConfirm.value = true;
};

// Close delete confirmation modal
const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/2 lg:w-1/3 relative">
      <!-- Bin & Close Buttons -->
      <div class="absolute top-4 left-4">
        <button @click="openDeleteConfirm" class="text-red-600 hover:text-red-800">
          <Trash2 class="w-6 h-6" />
        </button>
      </div>

      <div class="absolute top-4 right-4">
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          <X class="w-6 h-6" />
        </button>
      </div>

      <!-- Dress Details -->
      <h2 class="text-xl font-semibold text-center">{{ dress.name }}</h2>

      <img
        :src="dress.image || 'https://via.placeholder.com/300x400?text=No+Image'"
        alt="Dress Image"
        class="w-full h-64 object-cover rounded-md mb-4"
      />

      <p class="text-gray-600">{{ dress.type }}</p>
      <p class="text-gray-900 font-bold text-lg">₹{{ dress.price.toLocaleString() }}</p>
      <p class="text-gray-500">Stock: {{ dress.stock }}</p>
      <p class="text-gray-700 mt-3">{{ dress.description }}</p>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3 lg:w-1/4">
      <h2 class="text-lg font-semibold text-center mb-4">Confirm Deletion</h2>
      <p class="text-center text-gray-700 mb-6">Are you sure you want to delete this dress?</p>
      
      <div class="flex justify-center gap-4">
        <button @click="confirmDelete" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-800">Yes</button>
        <button @click="closeDeleteConfirm" class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400">No</button>
      </div>
    </div>
  </div>
</template>
