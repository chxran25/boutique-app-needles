<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" @click.self="close">
      <div class="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <h2 class="text-xl font-bold text-red-600 mb-4 text-center">Confirm Deletion</h2>
        <p class="text-gray-700 text-center mb-6">
          Are you sure you want to delete <span class="font-semibold text-purple-600">"{{ itemName }}"</span>?
          <br />This action cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="close" class="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium">
            Cancel
          </button>
          <button @click="confirm" class="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold">
            Delete
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
const props = defineProps({
  isOpen: Boolean,
  itemName: String
});
const emit = defineEmits(['confirm', 'close']);

const confirm = () => emit('confirm');
const close = () => emit('close');
</script>

<style scoped>
/* Optional: smooth modal appearance */
</style>