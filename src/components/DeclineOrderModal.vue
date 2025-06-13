<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" @click.self="emit('close')">
      <div class="bg-white rounded-2xl max-w-md w-full shadow-xl p-6 animate-fade-in">
        <!-- Title -->
        <h2 class="text-center text-xl font-bold text-red-600 mb-4">Confirm Decline</h2>

        <!-- Message -->
        <p class="text-center text-gray-700">
          Are you sure you want to <span class="font-medium text-red-600">decline</span> this order?
        </p>
        <p class="text-center text-gray-500 mt-1 text-sm">This action cannot be undone.</p>

        <!-- Buttons -->
        <div class="mt-6 flex justify-center gap-4">
          <button
            @click="emit('close')"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            @click="confirmDecline"
            class="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow hover:from-red-600 hover:to-pink-600 transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { declineOrderRequest } from '@/services/api';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: Boolean,
  orderId: String,
});
const emit = defineEmits(['close', 'success']);

const toast = useToast();

const confirmDecline = async () => {
  try {
    if (!props.orderId) {
      toast.error("❌ Missing order ID.");
      return;
    }

    console.log("📦 Sending decline for order ID:", props.orderId);
    await declineOrderRequest(props.orderId); // POST { orderId }
    toast.success("✅ Order declined successfully.");
    emit('success', { status: 'Declined', orderId: props.orderId });
    emit('close');
  } catch (err) {
    console.error("❌ Failed to decline order:", err);
    toast.error("Failed to decline order.");
  }
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
