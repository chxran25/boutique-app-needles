<script setup>
import { reactive, onMounted } from "vue";
import { useToast } from "vue-toastification";
import OrderCard from "@/components/OrderCard.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import { getPendingOrders } from '@/services/api';

const state = reactive({
  orders: [],
  selectedOrder: null,
  showConfirmationModal: false,
});

const toast = useToast();

// Hardcoded boutique ID
const boutiqueId = '67963acd15a076d83704ce25';

// Fetch orders from backend
const fetchOrders = async () => {
  try {
    const orders = await getPendingOrders(boutiqueId);

    state.orders = orders.map((order, idx) => {
      let parsedLocation = "Unknown";
      try {
        const locObj = eval("(" + order.location + ")");
        parsedLocation = locObj?.formattedAddress || "Unknown";
      } catch (e) {
        console.warn("⚠️ Failed to parse location string:", e);
      }

      return {
        id: order.orderId,
        order_id: `ORD${String(idx + 1).padStart(3, '0')}`,
        style: order.dressType,
        placed_on: new Date(order.createdAt).toDateString(),
        measurements: order.measurements || {},
        location: parsedLocation,
        status: order.status || "Pending",
        image: order.referralImage || "",
        voiceNotes: order.voiceNote || [],
        alterations: order.alterations || false,
        pickUp: order.pickUp || false,
        totalAmount: order.totalAmount || 0,
        bill: order.bill || {},
        userName: order.userName || "Unknown",
      };
    });
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
    toast.error("Failed to load orders from backend.");
  }
};

// Open confirmation modal
const openConfirmationModal = (order) => {
  state.selectedOrder = order;
  state.showConfirmationModal = true;
};

// Accept order (local only)
const acceptOrder = async () => {
  if (!state.selectedOrder) return;

  try {
    const orderId = state.selectedOrder.id;
    state.orders = state.orders.filter(o => o.id !== orderId);
    state.showConfirmationModal = false;
    toast.success(`✅ Order ${state.selectedOrder.order_id} accepted successfully!`);
    state.selectedOrder = null;
  } catch (error) {
    console.error("❌ Failed to accept order:", error);
    toast.error("Failed to accept order.");
  }
};

onMounted(fetchOrders);
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg-container m-auto">
      <h2 class="text-4xl font-bold mb-6 text-center">
        Orders To Accept
        <span v-if="state.orders.length" class="text-lg text-gray-600">
          ({{ state.orders.length }} pending)
        </span>
      </h2>

      <div v-if="state.orders.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderCard
          v-for="order in state.orders"
          :key="order.order_id"
          :order="order"
          @acceptOrder="openConfirmationModal(order)"
        />
      </div>

      <div v-else class="text-center text-green-600 text-lg font-semibold mt-10">
        <i class="pi pi-check-circle text-green-500 text-3xl"></i>
        <p class="mt-2">🎉 Hooray! You have no more pending orders to accept.</p>
      </div>
    </div>

    <ConfirmationModal
      v-if="state.showConfirmationModal"
      :message="'Are you sure you want to accept order ' + state.selectedOrder?.order_id + '?'"
      @confirm="acceptOrder"
      @cancel="state.showConfirmationModal = false"
    />
  </section>
</template>
