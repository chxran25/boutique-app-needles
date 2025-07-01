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
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Measurement Requirements (comma separated)
            </label>
            <input
              v-model="form.measurements"
              type="text"
              class="w-full border border-purple-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="e.g. waist, chest, length"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Size Chart (one size per line)</label>
            <textarea
              v-model="form.sizeChart"
              rows="4"
              class="w-full border border-purple-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-400 outline-none"
              placeholder="e.g. S: waist 28, chest 34"
            />
            <p class="text-xs text-gray-500 mt-1">
              Format: <code>Size: param value, param value</code> per line.
            </p>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Upload Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              @change="handleFiles"
              class="w-full border border-dashed border-gray-300 p-3 rounded-lg bg-gray-50 text-sm cursor-pointer"
              required
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
import { useToast } from 'vue-toastification';
import { addDressType } from '@/services/api';

const emit = defineEmits(['close', 'success', 'refresh']);

const props = defineProps({
  isOpen: Boolean,
});

const toast = useToast();

const form = ref({
  dressType: '',
  measurements: '',
  sizeChart: '',
});

const files = ref([]);

const handleFiles = (e) => {
  files.value = Array.from(e.target.files);
};

const parseSizeChart = (rawText) => {
  const lines = rawText.split("\n").map(line => line.trim()).filter(line => line !== "");
  const result = {};
  lines.forEach(line => {
    const [sizeLabel, measurements] = line.split(":");
    if (!sizeLabel || !measurements) return;

    const measurementsParts = measurements.split(",").map(p => p.trim());
    const obj = {};
    measurementsParts.forEach(part => {
      const [key, value] = part.split(/\s+/);
      if (key && value && !isNaN(parseFloat(value))) {
        obj[key] = parseFloat(value);
      }
    });

    result[sizeLabel.trim()] = obj;
  });
  return result;
};

const submit = async () => {
  try {
    if (files.value.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append('dressType', form.value.dressType);

    // Clean measurements
    const cleanedMeasurements = form.value.measurements.trim()
      ? JSON.stringify(form.value.measurements.split(',').map(m => m.trim()))
      : '[]';
    formData.append('measurementRequirements', cleanedMeasurements);

    // Parse size chart
    let parsedSizeChart = '{}';
    if (form.value.sizeChart.trim()) {
      const parsed = parseSizeChart(form.value.sizeChart);
      parsedSizeChart = JSON.stringify(parsed);
    }
    formData.append('sizeChart', parsedSizeChart);

    files.value.forEach((file) => formData.append('images', file));

    await addDressType(formData);

    toast.success('✅ Dress type added successfully');
    emit('success');
    emit('refresh');
    close();
  } catch (err) {
    toast.error('❌ Failed to add dress type.');
    console.error(err);
  }
};

const close = () => {
  emit('close');
  form.value = {
    dressType: '',
    measurements: '',
    sizeChart: '',
  };
  files.value = [];
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
