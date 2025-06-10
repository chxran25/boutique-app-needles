<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      @click.self="close"
    >
      <div class="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-fade-in border border-gray-100">
        <h2 class="text-2xl font-extrabold text-purple-700 mb-6">Add New Dress Type</h2>

        <form @submit.prevent="submit" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Dress Type</label>
            <input
              v-model="form.dressType"
              type="text"
              class="w-full border border-purple-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="e.g. Lehenga, Gown"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Measurement Requirements (comma separated)</label>
            <input
              v-model="form.measurements"
              type="text"
              class="w-full border border-purple-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="e.g. waist, chest, length"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleFiles"
              class="w-full border border-dashed border-gray-300 p-3 rounded-lg bg-gray-50 text-sm cursor-pointer"
            />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="close"
              class="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="px-6 py-2 rounded-lg bg-green-600 text-white font-semibold shadow hover:bg-green-700 transition"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const props = defineProps({
  isOpen: Boolean,
  boutiqueId: String,
});
const emit = defineEmits(['close', 'success']);

const form = ref({
  dressType: '',
  measurements: '',
});

const files = ref([]);

const handleFiles = (e) => {
  files.value = Array.from(e.target.files);
};

const submit = async () => {
  try {
    const data = new FormData();
    data.append('boutiqueId', props.boutiqueId);
    data.append('dressType', form.value.dressType);
    const cleanedMeasurements = form.value.measurements.trim()
      ? JSON.stringify(form.value.measurements.split(',').map(m => m.trim()))
      : '[]';
    data.append('measurementRequirements', cleanedMeasurements);
    files.value.forEach(file => data.append('images', file));

    await axios.post(`https://needles-v1.onrender.com/Boutique/${props.boutiqueId}/add-dress-type`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    emit('success');
    close();
  } catch (err) {
    alert('Failed to add dress type.');
    console.error(err);
  }
};

const close = () => {
  emit('close');
  form.value = { dressType: '', measurements: '' };
  files.value = [];
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.25s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>
