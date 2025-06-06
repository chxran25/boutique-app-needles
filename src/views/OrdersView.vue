<script setup>
import { reactive, computed, onMounted, watch } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";

const state = reactive({
  acceptedOrders: [],
  selectedOrderId: null,
  showStatusModal: false,
  newStatus: 1,
});

const toast = useToast();

// Fetch accepted orders from JSON Server
const fetchAcceptedOrders = async () => {
  try {
    const response = await axios.get("http://localhost:9000/acceptedOrders");

    // Ensure each order has a default status of "Accepted" (1) if missing
    state.acceptedOrders = response.data.map(order => ({
      ...order,
      status: order.status ?? 1, // If status is missing, set it to 1
    }));

    // Auto-select first order when modal opens
    if (state.acceptedOrders.length > 0) {
      state.selectedOrderId = state.acceptedOrders[0].id;
      state.newStatus = state.acceptedOrders[0].status;
    }
  } catch (error) {
    console.error("❌ Failed to fetch orders:", error);
  }
};

// Computed property to get the selected order object
const selectedOrder = computed(() => {
  return state.acceptedOrders.find(order => order.id === state.selectedOrderId) || null;
});

// Open status update modal
const openStatusModal = () => {
  if (state.acceptedOrders.length === 0) {
    toast.warning("⚠️ No accepted orders to update.");
    return;
  }

  state.showStatusModal = true;

  // Auto-select the first order if none is selected
  if (!state.selectedOrderId && state.acceptedOrders.length > 0) {
    state.selectedOrderId = state.acceptedOrders[0].id;
    state.newStatus = state.acceptedOrders[0].status;
  }
};

// Watch selectedOrderId to update slider accordingly
watch(() => state.selectedOrderId, (newId) => {
  const order = state.acceptedOrders.find(order => order.id === newId);
  if (order) state.newStatus = order.status;
});

// Update order status
const updateOrderStatus = async () => {
  if (!selectedOrder.value) {
    toast.error("❌ No order selected.");
    return;
  }

  try {
    console.log("🔄 Updating order:", selectedOrder.value.id, "New Status:", state.newStatus);

    // PATCH request to update only the status
    await axios.patch(`http://localhost:9000/acceptedOrders/${selectedOrder.value.id}`, {
      status: state.newStatus,
    });

    // Update local state immediately
    selectedOrder.value.status = state.newStatus;

    // Fetch updated orders from the server to reflect changes
    await fetchAcceptedOrders();

    // Close modal
    state.showStatusModal = false;

    toast.success(`✅ Order ${selectedOrder.value.order_id} updated to: ${["Accepted", "In Progress", "Delivery Ready"][state.newStatus - 1]}!`);
  } catch (error) {
    console.error("❌ Failed to update order status:", error);
    toast.error("❌ Failed to update order status.");
  }
};

onMounted(fetchAcceptedOrders);
</script>

<template>
  <section class="bg-gray-50 px-4 py-10">
    <div class="container-xl lg-container m-auto">
      <div class="flex justify-between items-center">
        <h2 class="text-4xl font-bold mb-6">All Orders</h2>
        <button @click="openStatusModal" class="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600">
          Update Order Status
        </button>
      </div>

      <div v-if="state.acceptedOrders.length > 0">
        <div v-for="order in state.acceptedOrders" :key="order.id" class="mb-4">
          <details class="bg-white shadow-md rounded-lg p-4 cursor-pointer">
            <summary class="text-xl font-semibold">Order ID: {{ order.order_id }} - {{ order.style }}</summary>
            <div class="mt-4">
              <p><strong>Placed on:</strong> {{ order.placed_on }}</p>
              <p><strong>Location:</strong> {{ order.location }}</p>
              <p><strong>Status:</strong> {{ ["Accepted", "In Progress", "Delivery Ready"][order.status - 1] }}</p>
            </div>
          </details>
        </div>
      </div>
      <div v-else class="text-center text-gray-500 text-lg mt-10">You haven’t accepted any orders yet.</div>
    </div>

    <!-- Status Update Modal (Responsive) -->
    <div v-if="state.showStatusModal" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full sm:w-3/4 md:w-2/3 lg:w-1/3 max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-4 text-center">Update Order Status</h3>

        <label class="block font-semibold text-lg">Select Order:</label>
        <select v-model="state.selectedOrderId" class="w-full p-3 border rounded mt-2">
          <option v-for="order in state.acceptedOrders" :key="order.id" :value="order.id">
            {{ order.order_id }} - {{ order.style }}
          </option>
        </select>

        <label class="block font-semibold text-lg mt-4">Set Status:</label>
        <input type="range" min="1" max="3" v-model="state.newStatus" class="w-full mt-2">
        <p class="text-center mt-2 font-semibold">{{ ["Accepted", "In Progress", "Delivery Ready"][state.newStatus - 1] }}</p>

        <div class="flex justify-center gap-4 mt-6">
          <button @click="updateOrderStatus" class="bg-green-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-green-600">
            Save
          </button>
          <button @click="state.showStatusModal = false" class="bg-gray-400 text-white px-6 py-2 rounded-lg hover:bg-gray-500">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <Toast />
  </section>
</template>
