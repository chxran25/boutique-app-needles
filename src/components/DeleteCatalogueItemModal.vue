<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      @click.self="emit('close')"
    >
      <div class="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <h2 class="text-xl font-bold text-red-600 mb-4">Delete Catalogue Item</h2>
        <p class="text-gray-700 mb-6">Are you sure you want to delete <span class="font-semibold text-red-500">{{ itemName }}</span> from the catalogue?</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="emit('close')"
            class="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            @click="emit('confirm')"
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  isOpen: Boolean,
  itemName: String,
});
const emit = defineEmits(['close', 'confirm']);
</script>
