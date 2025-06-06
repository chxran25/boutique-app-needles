<script setup>
import { defineProps, defineEmits, reactive, watch } from "vue";

const props = defineProps({
  orders: Array,
});

const emit = defineEmits(["update-status", "close"]);

const state = reactive({
  selectedOrderId: null,
  newStatusIndex: 0,
});

const statuses = ["Accepted", "In Progress", "Delivery Ready"];

// Watch for selected order changes and update status slider
watch(() => state.selectedOrderId, (newVal) => {
  if (newVal) {
    const selectedOrder = props.orders.find((o) => o.order_id === newVal);
    state.newStatusIndex = statuses.indexOf(selectedOrder.status);
  }
});

// Confirm status update
const confirmUpdate = () => {
  if (state.selectedOrderId !== null) {
    const newStatus = statuses[state.newStatusIndex];
    emit("update-status", state.selectedOrderId, newStatus);
    emit("close");
  }
};
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-11/12 md:w-1/3">
      <h2 class="text-xl font-semibold mb-4">Update Order Status</h2>

      <!-- Order Selection -->
      <label class="block text-gray-700 mb-2">Select an Order:</label>
      <select v-model="state.selectedOrderId" class="w-full p-2 border rounded-md">
        <option v-for="order in props.orders" :key="order.order_id" :value="order.order_id">
          Order {{ order.order_id }} - {{ order.style }}
        </option>
      </select>

      <!-- Status Slider -->
      <div v-if="state.selectedOrderId" class="mt-4">
        <label class="block text-gray-700 mb-2">Update Status:</label>
        <input
          type="range"
          min="0"
          max="2"
          step="1"
          v-model.number="state.newStatusIndex"
          class="w-full"
        />
        <p class="text-center font-semibold mt-2">{{ statuses[state.newStatusIndex] }}</p>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end gap-4 mt-6">
        <button @click="emit('close')" class="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg">
          Cancel
        </button>
        <button
          @click="confirmUpdate"
          :disabled="state.selectedOrderId === null"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Update
        </button>
      </div>
    </div>
  </div>
</template>
