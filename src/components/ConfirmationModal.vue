<script setup>
import { defineEmits, defineProps } from "vue";

defineProps({
  message: String
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg p-6 w-96">
      <h2 class="text-lg font-semibold mb-4">{{ message }}</h2>
      <div class="flex justify-end space-x-4">
        <button @click="emit('cancel')" class="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
        <button @click="emit('confirm')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Yes</button>
      </div>
    </div>
  </div>
</template>
