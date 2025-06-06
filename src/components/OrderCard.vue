<script setup>
import { defineProps, defineEmits } from 'vue';

defineProps({
  order: Object
});

const emit = defineEmits(["acceptOrder"]);
</script>

<template>
  <div class="bg-white rounded-xl shadow-md p-6">
    <!-- Dress Image -->
    <div class="w-full h-40 mb-4">
      <img
        :src="order.image || 'https://via.placeholder.com/300x400.png?text=Sample+Dress'"
        alt="Dress Image"
        class="w-full h-full object-cover rounded-lg"
      />
    </div>

    <!-- Order ID and Style -->
    <div class="mb-4">
      <h3 class="text-xl font-bold text-gray-900">Order ID: {{ order.order_id }}</h3>
      <p class="text-gray-600">Style: {{ order.style }}</p>
    </div>

    <!-- Order Date and Measurements -->
    <div class="mb-4">
      <p class="text-gray-700"><strong>Placed on:</strong> {{ order.placed_on }}</p>
      <p class="text-gray-700"><strong>Measurements:</strong> 
        <span v-if="order.measurements.bust">Bust: {{ order.measurements.bust }}</span>
        <span v-if="order.measurements.waist">, Waist: {{ order.measurements.waist }}</span>
        <span v-if="order.measurements.hips">, Hips: {{ order.measurements.hips }}</span>
      </p>
    </div>

    <!-- Divider -->
    <div class="border border-gray-200 my-4"></div>

    <!-- Location and Accept Button -->
    <div class="flex justify-between items-center">
      <div class="text-orange-700 flex items-center">
        <i class="pi pi-map-marker text-orange-500 mr-1"></i>
        <span>{{ order.location }}</span>
      </div>
      <button
        @click="$emit('acceptOrder')"
        class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
      >
        Accept
      </button>
    </div>
  </div>
</template>
