<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click="$emit('close')"
    >
      <div 
        class="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-modal-enter"
        @click.stop
      >
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <button 
            class="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95" 
            @click="$emit('close')"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 class="text-2xl font-bold relative z-10">Order Details</h2>
          <p class="text-blue-100 mt-1 relative z-10">Complete order information</p>
        </div>

        <div class="p-6 space-y-6 max-h-96 overflow-y-auto">
          <!-- Basic Info -->
          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 font-medium">Order ID</span>
              <span class="font-semibold text-gray-900">#{{ order.order_id }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 font-medium">Customer</span>
              <span class="font-semibold text-gray-900">{{ order.userName }}</span>
            </div>
            <div class="flex justify-between items-start py-2 border-b border-gray-100">
              <span class="text-gray-600 font-medium">Location</span>
              <span class="font-semibold text-gray-900 text-right max-w-64">{{ order.location }}</span>
            </div>
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-gray-600 font-medium">Pickup</span>
              <span class="font-semibold" :class="order.pickUp ? 'text-green-600' : 'text-gray-600'">
                {{ order.pickUp ? 'Yes' : 'No' }}
              </span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-gray-600 font-medium">Status</span>
              <span 
                class="px-3 py-1 rounded-full text-sm font-semibold"
                :class="{
                  'bg-amber-100 text-amber-700': order.status === 'Pending',
                  'bg-emerald-100 text-emerald-700': order.status === 'Accepted',
                  'bg-slate-100 text-slate-600': order.status === 'Completed',
                }"
              >
                {{ order.status }}
              </span>
            </div>
          </div>

          <!-- Measurements -->
          <div v-if="order.measurements && Object.keys(order.measurements).length" class="space-y-3">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <div class="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10l2-5H5l2 5zM7 21L5 7h14l-2 14M7 21V9M17 21V9" />
                </svg>
              </div>
              Measurements
            </h3>
            <div class="bg-blue-50 rounded-xl p-4 space-y-2">
              <div
                v-for="(val, key) in order.measurements"
                :key="key"
                class="flex justify-between items-center"
              >
                <span class="text-blue-900 font-medium">{{ key }}</span>
                <span class="text-blue-700 font-semibold">{{ val }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const emit = defineEmits(['close']);
const props = defineProps({
  isOpen: Boolean,
  order: Object
});
</script>

<style scoped>
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-modal-enter {
  animation: modal-enter 0.2s ease-out;
}
</style>
