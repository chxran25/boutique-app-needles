<template>
  <div
    :class="[
      'bg-white rounded-3xl shadow-lg p-6 border border-gray-100 space-y-4',
      showDetails ? '' : 'transition-transform hover:scale-[1.01] hover:shadow-xl'
    ]"
  >
    <!-- Referral Image -->
    <img
      v-if="order.image"
      :src="order.image"
      alt="Dress Image"
      class="w-full h-60 object-cover rounded-xl border border-gray-200"
    />

    <!-- Order Metadata -->
    <div class="flex justify-between items-center">
      <h3 class="font-semibold text-xl text-gray-800">#{{ order.order_id }}</h3>
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :class="{
          'bg-yellow-100 text-yellow-700': order.status === 'Pending',
          'bg-green-100 text-green-700': order.status === 'Accepted',
          'bg-gray-200 text-gray-600': order.status === 'Completed',
        }"
      >
        {{ order.status }}
      </span>
    </div>

    <p class="text-sm text-gray-500">Placed on: <span class="text-gray-800">{{ order.placed_on }}</span></p>
    <p v-if="order.userName" class="text-base text-gray-800 font-medium">👤 {{ order.userName }}</p>

    <!-- Location -->
    <p class="text-base text-gray-700">
      📍 <strong>Location:</strong> {{ order.location }}
    </p>

    <!-- Pickup Info -->
    <div class="text-base text-gray-700">
      <p><strong>Pickup:</strong> <span class="font-semibold">{{ order.pickUp ? 'Yes' : 'No' }}</span></p>
    </div>

    <!-- Voice Notes -->
    <div v-if="order.voiceNotes && order.voiceNotes.length" class="space-y-3">
      <p class="text-base font-semibold text-gray-800">🎙️ Voice Notes:</p>
      <transition-group name="fade" tag="div">
        <audio
          v-for="(note, idx) in order.voiceNotes"
          :key="idx"
          :src="note"
          controls
          class="w-full rounded-md border border-gray-300"
        ></audio>
      </transition-group>
    </div>

    <!-- Action Buttons -->
    <div class="flex justify-between items-center mt-4">
      <button
        class="bg-green-500 text-white px-6 py-2 text-base rounded-lg hover:bg-green-600 transition shadow-sm"
        @click="$emit('acceptOrder')"
      >
        Accept Order
      </button>
      <button
        class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 text-base rounded-lg transition"
        @click="openDetails(order)"
      >
        View Details
      </button>
    </div>

    <!-- Modal for Full Order Details -->
    <div
      v-if="showDetails"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-8 shadow-xl relative space-y-4">
        <button class="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-lg" @click="showDetails = false">✕</button>

        <h2 class="text-2xl font-bold text-gray-800">Order Details</h2>

        <div class="text-base text-gray-700 space-y-1">
          <p><strong>Order ID:</strong> {{ order.order_id }}</p>
          <p><strong>Customer:</strong> {{ order.userName }}</p>
          <p><strong>Location:</strong> {{ order.location }}</p>
          <p><strong>Pickup:</strong> {{ order.pickUp ? 'Yes' : 'No' }}</p>
          <p><strong>Status:</strong> {{ order.status }}</p>
        </div>

        <div v-if="order.measurements && Object.keys(order.measurements).length">
          <p class="font-semibold text-gray-800 mt-4">Measurements:</p>
          <ul class="list-disc list-inside text-base text-gray-700">
            <li v-for="(val, key) in order.measurements" :key="key">
              {{ key }}: {{ val }}
            </li>
          </ul>
        </div>

        <div v-if="order.bill">
          <p class="font-semibold text-gray-800 mt-4">Billing Summary:</p>
          <ul class="text-base text-gray-700 list-disc list-inside">
            <li>Platform Fee: ₹{{ order.bill.platformFee || 0 }}</li>
            <li>GST: ₹{{ order.bill.gst || 0 }}</li>
            <li>Delivery Fee: ₹{{ order.bill.deliveryFee || 0 }}</li>
            <li v-if="order.bill.additionalCost?.amount">
              Additional: ₹{{ order.bill.additionalCost.amount }} ({{ order.bill.additionalCost.reason }})
            </li>
            <li class="font-semibold">Total: ₹{{ order.bill.totalAmount?.toFixed(2) || '0.00' }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const showDetails = ref(false);
const openDetails = () => {
  showDetails.value = true;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.4s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
