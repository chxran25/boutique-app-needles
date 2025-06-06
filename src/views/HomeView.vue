<script setup>
import { reactive, onMounted } from "vue";
import axios from "axios";
import OrderCard from "@/components/OrderCard.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";
import { useToast } from "vue-toastification";

const state = reactive({
  orders: [],
  selectedOrder: null,
  showConfirmationModal: false
});

const toast = useToast();

// Fetch orders and filter out accepted ones
const fetchOrders = async () => {
  try {
    const [ordersResponse, acceptedOrdersResponse] = await Promise.all([
      axios.get("http://localhost:9000/orders"),
      axios.get("http://localhost:9000/acceptedOrders")
    ]);

    // Remove orders that are already accepted
    const acceptedOrderIds = new Set(acceptedOrdersResponse.data.map(order => order.order_id));
    state.orders = ordersResponse.data.filter(order => !acceptedOrderIds.has(order.order_id));
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
  }
};

// Open confirmation modal
const openConfirmationModal = (order) => {
  state.selectedOrder = order;
  state.showConfirmationModal = true;
};

// Accept an order
const acceptOrder = async () => {
  if (!state.selectedOrder) return;

  try {
    console.log("✅ Accepting order:", state.selectedOrder);

    // Add status field when accepting
    const orderWithStatus = { ...state.selectedOrder, status: 1 }; // Default status: "Accepted"

    // 1️⃣ Add order to acceptedOrders
    const response = await axios.post("http://localhost:9000/acceptedOrders", orderWithStatus);

    // ✅ Check response status correctly
    if (response.status < 200 || response.status >= 300) {
      throw new Error("Failed to add order to acceptedOrders");
    }

    // 2️⃣ Remove from orders in JSON server
    await axios.delete(`http://localhost:9000/orders/${state.selectedOrder.id}`);

    // 3️⃣ Update local state: Remove from pending orders
    state.orders = state.orders.filter(o => o.id !== state.selectedOrder.id);

    // 4️⃣ Close modal & reset selected order
    state.showConfirmationModal = false;
    state.selectedOrder = null;

    // ✅ Success toast with Order ID
    toast.success(`✅ Order #${orderWithStatus.order_id} accepted successfully!`, {
      timeout: 3000,
    });

  } catch (error) {
    console.error("❌ Failed to accept order:", error);
    toast.error(`❌ Failed to accept order: ${error.message}`, {
      timeout: 3000,
    });
  }
};

// Fetch orders on mount
onMounted(fetchOrders);
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg-container m-auto">
      <h2 class="text-4xl font-bold mb-6 text-center">
        Orders To Accept <span v-if="state.orders.length" class="text-lg text-gray-600">({{ state.orders.length }} pending)</span>
      </h2>

      <div v-if="state.orders.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderCard v-for="order in state.orders" :key="order.order_id" :order="order"
          @acceptOrder="openConfirmationModal(order)" />
      </div>

      <!-- Cheerful message when no more orders -->
      <div v-else class="text-center text-green-600 text-lg font-semibold mt-10">
        <i class="pi pi-check-circle text-green-500 text-3xl"></i>
        <p class="mt-2">🎉 Hooray! You have no more pending orders to accept.</p>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-if="state.showConfirmationModal"
      :message="'Are you sure you want to accept order ' + state.selectedOrder?.order_id + '?'" 
      @confirm="acceptOrder"
      @cancel="state.showConfirmationModal = false" />

    <!-- Toast Notifications -->
    <Toast />
  </section>
</template>
