<script setup>
import { defineProps } from "vue";
import { RouterLink } from "vue-router";

defineProps({
  dress: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <img :src="dress.image" alt="Dress Image" class="w-full h-40 object-cover rounded-md" />
    <h3 class="text-lg font-semibold mt-2">{{ dress.name }}</h3>
    <p class="text-gray-600">{{ dress.type }}</p>
    <p class="text-gray-900 font-bold">₹{{ dress.price.toLocaleString() }}</p>
    <p class="text-gray-500">Stock: {{ dress.stock }}</p>

    <button @click="$emit('view-details')"
      class="block w-full mt-3 bg-green-600 text-white py-2 rounded-lg text-center hover:bg-green-800">
      View Details
    </button>

  </div>
</template>
