<template>
  <div>
    <teleport to="body">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click="closeModal">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-modal-enter max-h-[90vh] flex flex-col"
          @click.stop>
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-500 to-sky-600 p-6 text-white relative overflow-hidden flex-shrink-0">
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            <button @click="closeModal"
              class="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 class="text-2xl font-bold relative z-10">Select Items</h2>
            <p class="text-green-100 mt-1 relative z-10">Order #{{ order.order_id }}</p>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto">
            <div class="p-6 space-y-6">
              <!-- Items Selection -->
              <div class="space-y-4">
                <div v-for="(item, index) in selectedItems" :key="index"
                  class="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-200">
                  <div class="space-y-2">
                    <label class="text-sm font-medium text-gray-700">Select Item</label>
                    <select v-model="item.item" class="w-full p-3 border border-gray-300 rounded-lg">
                      <option value="">Choose an item...</option>
                      <option v-for="catalogueItem in catalogueItems" :key="catalogueItem.itemName"
                        :value="Array.isArray(catalogueItem.itemName) ? catalogueItem.itemName[0] : catalogueItem.itemName">
                        {{ Array.isArray(catalogueItem.itemName) ? catalogueItem.itemName[0] : catalogueItem.itemName }} - ₹{{ catalogueItem.price[0] }}
                      </option>
                    </select>
                  </div>

                  <!-- Quantity -->
                  <div class="flex items-center justify-between">
                    <span class="text-sm font-medium text-gray-700">Quantity</span>
                    <div class="flex items-center gap-3 bg-white rounded-lg p-1 border border-gray-300">
                      <button @click="updateQuantity(index, -1)" :disabled="item.quantity <= 1"
                        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-red-600 hover:bg-red-50 rounded">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                        </svg>
                      </button>
                      <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                      <button @click="updateQuantity(index, 1)"
                        class="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 rounded">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Remove -->
                  <div v-if="selectedItems.length > 1" class="flex justify-end">
                    <button @click="removeItem(index)"
                      class="text-red-600 hover:text-red-700 text-sm font-medium">Remove</button>
                  </div>
                </div>

                <button @click="addNewItem"
                  class="w-full p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Item
                </button>
              </div>

              <!-- Additional Cost -->
              <div class="bg-blue-50 rounded-xl p-4 space-y-3 border border-blue-200">
                <h3 class="font-semibold text-gray-800">Additional Cost</h3>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="text-sm font-medium text-gray-700">Amount (₹)</label>
                    <input v-model.number="additionalCost.amount" type="number" min="0" step="0.01"
                      class="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                  <div>
                    <label class="text-sm font-medium text-gray-700">Reason</label>
                    <input v-model="additionalCost.reason" type="text"
                      class="w-full p-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
            <div class="flex gap-3">
              <button @click="closeModal" class="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl">Cancel</button>
              <button @click="createBillAndAccept" :disabled="!canSubmit"
                class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50">
                {{ isSubmitting ? 'Creating...' : 'Create Bill & Accept' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { createBill } from '@/services/api';

const props = defineProps({
  isOpen: Boolean,
  order: Object,
  catalogueItems: Array,
});

const emit = defineEmits(['close', 'success', 'showReceipt']);
const toast = useToast();

const selectedItems = ref([{ item: '', quantity: 1 }]);
const additionalCost = ref({ amount: 0, reason: '' });
const isSubmitting = ref(false);

const canSubmit = computed(() =>
  selectedItems.value.every(i => i.item && i.item.trim() !== '') &&
  selectedItems.value.length > 0 && !isSubmitting.value
);

const resetForm = () => {
  selectedItems.value = [{ item: '', quantity: 1 }];
  additionalCost.value = { amount: 0, reason: '' };
  isSubmitting.value = false;
};

const closeModal = () => {
  if (!isSubmitting.value) {
    resetForm();
    emit('close');
  }
};

const addNewItem = () => selectedItems.value.push({ item: '', quantity: 1 });
const removeItem = (index) => selectedItems.value.splice(index, 1);
const updateQuantity = (index, delta) => {
  const newQty = selectedItems.value[index].quantity + delta;
  if (newQty >= 1) selectedItems.value[index].quantity = newQty;
};

const createBillAndAccept = async () => {
  if (!canSubmit.value) return;
  isSubmitting.value = true;

  try {
    console.log('👀 Order Details:', props.order);

    const payload = {
      boutiqueId: props.order.boutiqueId,
      orderId: props.order.id || props.order.orderId || props.order._id,
      selectedItems: selectedItems.value.map(i => ({ item: i.item, quantity: i.quantity })),
      additionalCost: {
        amount: additionalCost.value.amount || 0,
        reason: additionalCost.value.reason || 'Not specified'
      }
    };

    console.log("📦 Payload to be sent:", payload);

    const result = await createBill(payload);
    toast.success('Order accepted and bill created successfully!');

    resetForm();
    emit('close');
    emit('showReceipt', { ...result, selectedItems: selectedItems.value, additionalCost: additionalCost.value, orderId: payload.orderId });
    emit('success', result);
  } catch (error) {
    console.error('❌ Error:', error);
    toast.error(error?.data?.message || error.message || 'Failed to create bill');
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.isOpen, open => {
  if (!open) resetForm();
});
</script>
