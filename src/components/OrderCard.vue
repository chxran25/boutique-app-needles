<template>
  <div :class="[
    'bg-gradient-to-br from-white to-gray-50/30 rounded-2xl shadow-md border border-gray-100/50 overflow-hidden',
    'backdrop-blur-sm transition-all duration-300 ease-out',
    showDetails ? '' : 'hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-1 hover:border-gray-200/70'
  ]">
    <!-- Header Image -->
    <div v-if="localOrder.image" class="relative overflow-hidden">
  <img
    :src="localOrder.image"
    alt="Dress Image"
    class="w-full h-48 object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
    @click="openImageModal(localOrder.image)"
  />
  <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
</div>


    <div class="p-6 space-y-4">
      <!-- Order Header -->
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <h3 class="font-bold text-xl text-gray-800 tracking-tight">#{{ localOrder.order_id }}</h3>
          <p class="text-sm text-gray-500 flex items-center gap-1">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-4 0v5m-4-5h8m-8 0L6 21h12l-2-14" />
            </svg>
            Placed on {{ localOrder.placed_on }}
          </p>
        </div>
        <div
          class="px-4 py-2 rounded-full text-sm font-semibold shadow-sm border transition-all duration-200"
          :class="{
            'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-100': localOrder.status === 'Pending',
            'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-100': localOrder.status === 'Accepted',
            'bg-slate-50 text-slate-600 border-slate-200 shadow-slate-100': localOrder.status === 'Completed',
          }"
        >
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full"
              :class="{
                'bg-amber-400': localOrder.status === 'Pending',
                'bg-emerald-400': localOrder.status === 'Accepted',
                'bg-slate-400': localOrder.status === 'Completed',
              }"></div>
            {{ localOrder.status }}
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div v-if="localOrder.userName" class="flex items-center gap-3 p-3 bg-gray-50/70 rounded-xl border border-gray-100">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
          {{ localOrder.userName.charAt(0).toUpperCase() }}
        </div>
        <div>
          <p class="font-semibold text-gray-900">{{ localOrder.userName }}</p>
          <p class="text-sm text-gray-500">Customer</p>
        </div>
      </div>

      <!-- Delivery Location -->
      <div class="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
        <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-sm mt-0.5">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900 text-sm">Delivery Location</p>
          <p class="text-gray-700 text-sm leading-relaxed">{{ localOrder.location }}</p>
        </div>
      </div>

      <!-- Pickup Status -->
      <div class="flex items-start gap-3 p-3 rounded-xl border"
        :class="localOrder.pickUp ? 'bg-green-50/50 border-green-100' : 'bg-yellow-50/50 border-yellow-200'">
        <div class="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm mt-0.5"
          :class="localOrder.pickUp ? 'bg-green-500' : 'bg-yellow-500'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 8h14M5 8a2 2 0 100 4h14a2 2 0 100-4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
        <div>
          <p class="font-medium text-sm" :class="localOrder.pickUp ? 'text-green-900' : 'text-yellow-900'">
            {{ localOrder.pickUp ? 'Pickup Required' : 'Pickup Not Required' }}
          </p>
        </div>
      </div>

      <!-- Voice Notes -->
      <div v-if="localOrder.voiceNotes && localOrder.voiceNotes.length" class="space-y-3">
        <div class="flex items-center gap-2 text-gray-800">
          <div class="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white shadow-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <p class="font-semibold">Voice Notes ({{ localOrder.voiceNotes.length }})</p>
        </div>
        <div class="space-y-2 pl-10">
          <div v-for="(note, idx) in localOrder.voiceNotes" :key="idx"
            class="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
            <audio :src="note" controls class="w-full h-8 rounded-lg" />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 pt-2">
        <button
          v-if="localOrder.status === 'Pending'"
          class="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
          @click="showBilling = true">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Accept Order
        </button>
        <button
          class="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 shadow-sm hover:shadow-md"
          @click="showDetails = true">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Details
        </button>
      </div>

      <!-- Modals -->
      <AcceptOrderModal
        v-if="showBilling"
        :isOpen="showBilling"
        :order="localOrder"
        :catalogueItems="localOrder.catalogueItems || []"
        @close="showBilling = false"
        @success="handleBillSuccess"
        @showReceipt="handleShowReceipt"
      />
      <ReceiptModal
        v-if="showReceipt"
        :isOpen="showReceipt"
        :billData="billData"
        :catalogueItems="localOrder.catalogueItems || []"
        @close="showReceipt = false"
      />
      <OrderDetailsModal
        :isOpen="showDetails"
        :order="localOrder"
        @close="showDetails = false"
      />

      <!-- Enlarged Image Modal -->
      <teleport to="body">
        <ImagePreviewModal
          v-if="showImageModal"
          :image-url="selectedImageUrl"
          @close="showImageModal = false"
        />
      </teleport>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AcceptOrderModal from '@/components/AcceptOrderModal.vue';
import OrderDetailsModal from '@/components/OrderDetailsModal.vue';
import ReceiptModal from '@/components/ReceiptModal.vue';
import ImagePreviewModal from '@/components/common/ImagePreviewModal.vue';

const props = defineProps({
  order: Object,
});

const localOrder = ref({ ...props.order });
const showDetails = ref(false);
const showBilling = ref(false);
const showReceipt = ref(false);
const billData = ref({});
const showImageModal = ref(false);
const selectedImageUrl = ref('');

const handleBillSuccess = (result) => {
  localOrder.value.status = result.status || 'Accepted';
  localOrder.value.bill = result.bill || {};
  localOrder.value.totalAmount = result.bill?.totalAmount || 0;
};

const handleShowReceipt = (data) => {
  billData.value = data;
  showReceipt.value = true;
};

const openImageModal = (url) => {
  console.log('🖼️ Opening image modal:', url);
  selectedImageUrl.value = url;
  showImageModal.value = true;
  console.log('📌 showImageModal:', showImageModal.value);
};
</script>
