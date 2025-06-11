<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-center">
    <div class="bg-white p-6 rounded-xl shadow-xl w-full max-w-xl relative">
      <!-- Close Button -->
      <button @click="$emit('close')" class="absolute top-2 right-3 text-gray-500 text-xl hover:text-black">×</button>

      <!-- Content -->
      <h2 class="text-2xl font-bold mb-4">Alteration Request</h2>

      <p class="mb-2"><strong>User:</strong> {{ request.userId?.name }}</p>
      <p class="mb-2"><strong>Phone:</strong> {{ request.userId?.phone }}</p>
      <p class="mb-2"><strong>Description:</strong> {{ request.description }}</p>
      <p class="mb-2"><strong>Status:</strong> {{ request.status }}</p>

      <!-- Images -->
      <div v-if="request.referenceImage" class="mb-3">
        <p class="text-sm font-medium">Reference Image:</p>
        <img :src="request.referenceImage" class="w-full h-40 object-cover rounded" />
      </div>
      <div v-if="request.orderImage" class="mb-3">
        <p class="text-sm font-medium">Order Image:</p>
        <img :src="request.orderImage" class="w-full h-40 object-cover rounded" />
      </div>

      <!-- Voice Note -->
      <div v-if="request.voiceNote" class="mb-3">
        <p class="text-sm font-medium">Voice Note:</p>
        <audio controls class="w-full">
          <source :src="request.voiceNote" type="audio/mpeg" />
        </audio>
      </div>

      <!-- Submit Button -->
      <button
        v-if="request.status !== 'Reviewed'"
        @click="reviewRequest"
        class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Review
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { reviewAlterationRequest } from '@/services/api';
import { useToast } from 'vue-toastification';

const props = defineProps({
  request: Object,
  visible: Boolean,
});
const emit = defineEmits(['close', 'updated']);

const selectedStatus = ref(props.request?.status || 'Pending');
const toast = useToast();

watch(
  () => props.request,
  (newVal) => {
    selectedStatus.value = newVal?.status || 'Pending';
  },
  { immediate: true }
);

const reviewRequest = async () => {
  try {
    const updated = await reviewAlterationRequest(props.request._id); // ✅ No boutiqueId needed
    toast.success('✅ Marked as reviewed');
    emit('updated', updated.alterationRequest.status); // or emit full object if needed
    emit('close');
  } catch (err) {
    toast.error("❌ Failed to mark as reviewed");
    console.error(err);
  }
};
</script>
