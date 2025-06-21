<template>
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
    <img :src="imageUrl" class="max-w-[90vw] max-h-[90vh] rounded-xl shadow-lg" />
    <button
      class="absolute top-5 right-5 text-white text-3xl font-bold"
      @click="$emit('close')"
    >×</button>
  </div>
</template>

<script setup>
defineProps({
  imageUrl: String,
});
</script>
