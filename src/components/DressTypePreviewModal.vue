<!-- DressTypePreviewModal.vue -->
<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click.self="emit('close')"
    >
      <div
        class="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative overflow-hidden animate-fade-in"
        @click.stop
      >
        <!-- Header -->
        <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-bold">Preview Dress Type</h2>
            <button @click="emit('close')" class="text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-6">
          <!-- Image Carousel -->
          <div v-if="dressType.images?.length" class="overflow-x-auto whitespace-nowrap space-x-4 pb-2">
            <img
              v-for="(img, index) in dressType.images"
              :key="index"
              :src="img"
              class="inline-block w-40 h-40 rounded-xl object-cover border border-gray-200 shadow-sm"
              alt="Dress Image"
            />
          </div>

          <!-- Details -->
          <div class="space-y-3">
            <div>
              <label class="text-gray-500 text-sm">Name</label>
              <p class="text-lg font-semibold text-gray-800">{{ dressType.type }}</p>
            </div>

            <div>
              <label class="text-gray-500 text-sm">Measurements Required</label>
              <ul class="list-disc list-inside text-gray-700">
                <li v-for="(m, index) in dressType.measurementRequirements" :key="index">{{ m }}</li>
              </ul>
            </div>

            <!-- Future: Add description/fabric/care details here -->
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  dressType: Object
});
const emit = defineEmits(['close']);
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
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
