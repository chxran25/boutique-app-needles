<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden animate-modal-enter max-h-[90vh] flex flex-col"
        @click.stop
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative overflow-hidden flex-shrink-0"
        >
          <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          <button
            class="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            @click="closeModal"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 class="text-2xl font-bold relative z-10">Bill Created</h2>
              <p class="text-green-100 mt-1 relative z-10">Order #{{ billData?.orderId || 'N/A' }}</p>
            </div>
          </div>
        </div>

        <!-- Receipt Content (wrapped for PDF export) -->
        <div id="receipt-content" class="flex-1 overflow-y-auto p-6 space-y-6">

          <!-- Bill Summary -->
          <div class="bg-green-50 rounded-xl p-4 border border-green-200">
            <div class="flex items-center gap-3">
              <div
                class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 text-white">
                ✔
              </div>
              <div>
                <h3 class="font-semibold text-green-800">Order Accepted Successfully!</h3>
                <p class="text-green-600 text-sm">Bill has been created and sent to the customer.</p>
              </div>
            </div>
          </div>

          <!-- Selected Items -->
          <div>
            <h3 class="text-lg font-bold text-gray-800 mb-2">Selected Items</h3>
            <div v-for="(amount, item) in billData.bill.items" :key="item"
              class="flex justify-between border-b py-2 text-sm">
              <div>{{ item }}</div>
              <div class="font-semibold">₹{{ amount.toFixed(2) }}</div>
            </div>
          </div>

          <!-- Charges -->
          <div class="space-y-2 text-sm text-gray-700">
            <div class="flex justify-between">
              <span>Platform Fee</span>
              <span>₹{{ billData.bill.platformFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹{{ billData.bill.deliveryFee.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between">
              <span>GST (12%)</span>
              <span>₹{{ billData.bill.gst.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between" v-if="billData.bill.additionalCost?.amount > 0">
              <span>Additional Cost ({{ billData.bill.additionalCost.reason }})</span>
              <span>₹{{ billData.bill.additionalCost.amount.toFixed(2) }}</span>
            </div>
          </div>

          <!-- Total -->
          <div
            class="mt-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-4 flex justify-between items-center border border-green-300">
            <div>
              <h3 class="text-lg font-bold text-gray-800">Total Amount</h3>
              <p class="text-sm text-gray-600">Including all charges</p>
            </div>
            <div class="text-2xl font-extrabold text-green-600">₹{{ billData.bill.totalAmount.toFixed(2) }}</div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-6 bg-gray-50 border-t border-gray-200 flex-shrink-0">
          <div class="flex gap-3">
            <button @click="printReceipt"
              class="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Receipt
            </button>
            <button @click="closeModal"
              class="flex-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 13l4 4L19 7" />
              </svg>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import html2pdf from 'html2pdf.js';

const props = defineProps({
  isOpen: Boolean,
  billData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['close']);

const closeModal = () => {
  emit('close');
};

const printReceipt = () => {
  const element = document.getElementById('receipt-content');
  const opt = {
    margin:       0.5,
    filename:     `Receipt_${props.billData?.orderId || 'Order'}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};
</script>

<style scoped>
@keyframes modal-enter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
.animate-modal-enter {
  animation: modal-enter 0.2s ease-out;
}
</style>
