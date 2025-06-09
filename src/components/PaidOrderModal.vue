<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="closeModal"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col animate-modal-enter"
      >
        <!-- Header -->
        <div class="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white px-6 py-5 relative">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"></div>
          <div class="relative z-10">
            <h2 class="text-xl font-bold text-center mb-1">Order Details</h2>
            <p class="text-center text-sm opacity-90">{{ formatOrderId(order?._id) }}</p>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1">
          <!-- Customer Info -->
          <div class="bg-gray-50 rounded-xl p-4 space-y-3">
            <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">Customer Information</h3>
            <div class="space-y-2 text-sm">
              <div class="flex items-center gap-2"><span class="w-2 h-2 bg-blue-500 rounded-full"></span><span class="font-medium">{{ getCustomerName() }}</span></div>
              <div class="flex items-center gap-2"><span class="w-2 h-2 bg-green-500 rounded-full"></span><span>{{ getCustomerPhone() }}</span></div>
              <div class="flex items-start gap-2"><span class="w-2 h-2 bg-purple-500 rounded-full mt-1"></span><span class="text-gray-600 leading-relaxed">{{ getLocation() }}</span></div>
            </div>
          </div>

          <!-- Voice Notes -->
          <div v-if="order?.voiceNotes?.length" class="space-y-3">
            <h3 class="font-semibold text-sm uppercase tracking-wider text-gray-700">Voice Notes ({{ order.voiceNotes.length }})</h3>
            <div class="space-y-2">
              <div
                v-for="(note, idx) in order.voiceNotes"
                :key="idx"
                class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
              >
                <audio :src="note" controls class="w-full h-8 rounded-lg" />
              </div>
            </div>
          </div>

          <!-- Measurements -->
          <div v-if="order?.measurements && Object.keys(order.measurements).length">
            <h3 class="font-semibold text-sm uppercase tracking-wider text-gray-700 mb-2">Measurements</h3>
            <div class="grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl">
              <div
                v-for="(val, key) in order.measurements"
                :key="key"
                class="flex justify-between text-sm"
              >
                <span class="text-blue-900 font-medium">{{ key }}</span>
                <span class="text-blue-700 font-semibold">{{ val }}</span>
              </div>
            </div>
          </div>

          <!-- Billing Info -->
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-3">
            <h3 class="font-semibold text-gray-800 text-sm uppercase tracking-wide">Cost Summary</h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Additional Cost:</span>
                <span class="font-semibold text-gray-900">₹{{ getAdditionalCost().amount }}</span>
              </div>
              <div v-if="getAdditionalCost().reason" class="text-xs text-gray-500 italic">
                Reason: {{ getAdditionalCost().reason }}
              </div>
              <div class="flex justify-between items-center pt-2 border-t border-gray-200">
                <span class="font-semibold text-gray-800">Total Amount:</span>
                <span class="font-bold text-lg text-indigo-600">₹{{ getTotalAmount() }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 border-t bg-gray-50 flex justify-center">
          <button
            @click="closeModal"
            class="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  order: Object,
});
const emit = defineEmits(["close"]);
const closeModal = () => emit("close");

const formatOrderId = (id) => (id?.length > 10 ? `${id.slice(0, 10)}...` : id || "N/A");
const getCustomerName = () => props.order?.userId?.name || "Unknown Customer";
const getCustomerPhone = () => props.order?.userId?.phone || "No phone number";

const getLocation = () => {
  const loc = props.order?.boutiqueId?.location;
  if (typeof loc === "string") return loc;
  if (loc?.address) return loc.address;
  return typeof loc === "object" ? JSON.stringify(loc, null, 2) : "Location not available";
};

const getAdditionalCost = () => {
  const add = props.order?.bill?.additionalCost;
  return typeof add === "object" && add !== null
    ? { amount: add.amount || 0, reason: add.reason || null }
    : { amount: add || 0, reason: null };
};

const getTotalAmount = () => props.order?.bill?.totalAmount || 0;
</script>

<style scoped>
.animate-modal-enter {
  animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
