<template>
  <teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" @click.self="emit('close')">
      <div class="bg-white rounded-2xl max-w-xl w-full shadow-2xl p-6 space-y-6 animate-fade-in" @click.stop>
        <!-- Header -->
        <div class="flex justify-between items-center border-b pb-4">
          <h2 class="text-xl font-bold text-indigo-700">Add Catalogue Items</h2>
          <button @click="emit('close')" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4">
          <div class="flex gap-4">
            <input v-model="newItem.itemName" type="text" placeholder="Item Name" class="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <input v-model.number="newItem.price" type="number" placeholder="Price" class="w-32 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button @click="addItem" class="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition">
            Add to List
          </button>
        </div>

        <!-- Item List -->
        <div v-if="items.length" class="space-y-2">
          <h3 class="text-sm font-semibold text-gray-600">Items to Add:</h3>
          <ul class="space-y-1 text-sm">
            <li v-for="(item, i) in items" :key="i" class="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl border">
              <span>{{ item.itemName }} - ₹{{ item.price }}</span>
              <button @click="removeItem(i)" class="text-red-500 hover:text-red-700">Remove</button>
            </li>
          </ul>
        </div>

        <!-- Submit Button -->
        <div class="pt-4 border-t">
          <button :disabled="submitting || items.length === 0" @click="submit"
            class="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition">
            {{ submitting ? 'Adding...' : 'Submit Catalogue Items' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref } from 'vue';
import { addCatalogueItems } from '@/services/api';
import { useToast } from 'vue-toastification';

const props = defineProps({
  isOpen: Boolean
});

const emit = defineEmits(['close', 'refresh']);

const newItem = ref({ itemName: '', price: '' });
const items = ref([]);
const submitting = ref(false);
const toast = useToast();

const addItem = () => {
  if (!newItem.value.itemName || !newItem.value.price) {
    toast.error('Please enter both item name and price');
    return;
  }
  items.value.push({ itemName: newItem.value.itemName, price: newItem.value.price });
  newItem.value = { itemName: '', price: '' };
};

const removeItem = (index) => {
  items.value.splice(index, 1);
};

const submit = async () => {
  try {
    submitting.value = true;

    // ✅ Call API with just items (no boutiqueId)
    await addCatalogueItems(items.value);

    toast.success('✅ Catalogue items added successfully!');
    emit('refresh');
    emit('close');
    items.value = [];
  } catch (err) {
    toast.error('❌ Failed to add catalogue items.');
    console.error(err);
  } finally {
    submitting.value = false;
  }
};
</script>
