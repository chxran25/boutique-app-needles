<script setup>
import { reactive, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";
import { getPaidOrders } from "@/services/api";
import PaidOrderModal from "@/components/PaidOrderModal.vue";

const state = reactive({
  acceptedOrders: [],
  loading: true,
  showModal: false,
  selectedOrder: null,
  searchQuery: "",
  showStatusUpdateModal: false,
  selectedOrderForUpdate: null,
  updatingStatus: false,
  statusFilter: 'all', // all, accepted, in-progress, delivered
});

const boutiqueId = "67963acd15a076d83704ce25"; // Replace with dynamic ID if needed
const toast = useToast();

// Order status configuration
const orderStatuses = [
  { value: 'accepted', label: 'Accepted', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 'in-progress', label: 'In Progress', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 'delivered', label: 'Delivered', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' }
];

// Computed property for filtered orders
const filteredOrders = computed(() => {
  let orders = state.acceptedOrders;

  // Filter by status
  if (state.statusFilter !== 'all') {
    orders = orders.filter(order => (order.status || 'accepted') === state.statusFilter);
  }

  // Filter by search query
  if (state.searchQuery) {
    orders = orders.filter(order =>
      order._id.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      order.bill.totalAmount.toString().includes(state.searchQuery)
    );
  }

  return orders;
});

// Get status counts for each category
const statusCounts = computed(() => {
  const counts = { all: state.acceptedOrders.length };
  orderStatuses.forEach(status => {
    counts[status.value] = state.acceptedOrders.filter(order =>
      (order.status || 'accepted') === status.value
    ).length;
  });
  return counts;
});

const fetchAcceptedOrders = async () => {
  try {
    state.loading = true;
    const orders = await getPaidOrders(boutiqueId);
    state.acceptedOrders = orders.map((order, idx) => {
      let parsedLocation = "Unknown";
      try {
        const locObj = eval("(" + order.boutiqueId?.location + ")");
        parsedLocation = locObj?.formattedAddress || "Unknown";
      } catch (e) {
        console.warn("⚠️ Failed to parse location:", e);
      }

      return {
        ...order,
        voiceNotes: order.voiceNote || [], // ✅ Normalize for PaidOrderModal.vue
        location: parsedLocation
      };
    });
  } catch (error) {
    toast.error("❌ Failed to fetch paid orders.");
    console.error("Error fetching orders:", error);
  } finally {
    state.loading = false;
  }
};


const openModal = (order) => {
  state.selectedOrder = order;
  state.showModal = true;
};

const closeModal = () => {
  state.selectedOrder = null;
  state.showModal = false;
};

const openStatusUpdateModal = () => {
  state.showStatusUpdateModal = true;
};

const closeStatusUpdateModal = () => {
  state.showStatusUpdateModal = false;
  state.selectedOrderForUpdate = null;
};

const updateOrderStatus = async (newStatus) => {
  if (!state.selectedOrderForUpdate) return;

  try {
    state.updatingStatus = true;

    // TODO: Replace with your actual API call
    // await updateOrderStatus(state.selectedOrderForUpdate._id, newStatus);

    // For now, update locally (replace this with actual API call)
    const orderIndex = state.acceptedOrders.findIndex(order =>
      order._id === state.selectedOrderForUpdate._id
    );
    if (orderIndex !== -1) {
      state.acceptedOrders[orderIndex].status = newStatus;
    }

    const statusLabel = orderStatuses.find(s => s.value === newStatus)?.label;
    toast.success(`✅ Order status updated to ${statusLabel}`);
    closeStatusUpdateModal();
  } catch (error) {
    toast.error("❌ Failed to update order status.");
    console.error("Error updating status:", error);
  } finally {
    state.updatingStatus = false;
  }
};

const getStatusConfig = (status) => {
  return orderStatuses.find(s => s.value === (status || 'accepted')) || orderStatuses[0];
};

const formatOrderId = (id) => {
  return id.length > 12 ? `${id.substring(0, 12)}...` : id;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const getCustomerName = (order) => {
  return order.userId?.name || 'Unknown Customer';
};

const refreshOrders = () => {
  fetchAcceptedOrders();
  toast.info("🔄 Refreshing orders...");
};

onMounted(fetchAcceptedOrders);
</script>

<template>
  <section class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
    <div class="container mx-auto px-4 py-8 max-w-6xl">
      <!-- Enhanced Header -->
      <div class="mb-8">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              All Orders
            </h1>
            <p class="text-gray-600 mt-2">
              {{ state.acceptedOrders.length }}
              {{ state.acceptedOrders.length === 1 ? 'order' : 'orders' }} total
            </p>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-3">
            <button @click="refreshOrders" :disabled="state.loading"
              class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50">
              <svg class="w-4 h-4" :class="{ 'animate-spin': state.loading }" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>

            <button @click="openStatusUpdateModal"
              class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Update Status
            </button>
          </div>
        </div>

        <!-- Status Filter Tabs -->
        <div class="mt-6 flex flex-wrap gap-2">
          <button @click="state.statusFilter = 'all'" :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200',
            state.statusFilter === 'all'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          ]">
            All Orders ({{ statusCounts.all }})
          </button>

          <button v-for="status in orderStatuses" :key="status.value" @click="state.statusFilter = status.value" :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2',
            state.statusFilter === status.value
              ? `bg-gradient-to-r from-${status.color}-500 to-${status.color}-600 text-white shadow-lg`
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          ]">
            <span :class="`w-2 h-2 rounded-full bg-${status.color}-500`"></span>
            {{ status.label }} ({{ statusCounts[status.value] }})
          </button>
        </div>

        <!-- Search Bar -->
        <div class="mt-6">
          <div class="relative max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input v-model="state.searchQuery" type="text" placeholder="Search orders by ID, customer, or amount..."
              class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm" />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="state.loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent">
          </div>
          <p class="mt-4 text-gray-600 font-medium">Loading orders...</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="state.acceptedOrders.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div
            class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Orders Yet</h3>
          <p class="text-gray-600">You haven't accepted any orders yet. Orders will appear here once customers place
            them.</p>
        </div>
      </div>

      <!-- No Search Results -->
      <div v-else-if="filteredOrders.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div
            class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-100 to-orange-200 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
          <p class="text-gray-600">No orders match your search criteria. Try adjusting your search terms.</p>
        </div>
      </div>

      <!-- Orders Grid -->
      <div v-else class="grid gap-6 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        <div v-for="order in filteredOrders" :key="order._id"
          class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50 hover:border-indigo-200 hover:-translate-y-1">
          <!-- Order Header -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4 relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-medium opacity-90">ORDER ID</span>
                <span :class="[
                  'px-3 py-1 text-xs font-bold rounded-full',
                  getStatusConfig(order.status).bgColor,
                  getStatusConfig(order.status).textColor
                ]">
                  {{ getStatusConfig(order.status).label.toUpperCase() }}
                </span>
              </div>
              <h3 class="font-mono text-sm font-bold tracking-wide">
                {{ formatOrderId(order._id) }}
              </h3>
            </div>
          </div>

          <!-- Order Content -->
          <div class="p-6 space-y-4">
            <!-- Customer Info -->
            <div class="flex items-start gap-3">
              <div
                class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-gray-800 truncate">{{ getCustomerName(order) }}</p>
                <p class="text-sm text-gray-500">Customer</p>
              </div>
            </div>

            <!-- Order Details -->
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Total Amount</span>
                <span class="font-bold text-lg text-indigo-600">₹{{ order.bill.totalAmount }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Order Date</span>
                <span class="text-sm font-medium text-gray-800">{{ formatDate(order.createdAt) }}</span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Items</span>
                <span class="text-sm font-medium text-gray-800">
                  {{ Object.keys(order.bill?.itemBreakdown || {}).length }} item(s)
                </span>
              </div>
            </div>

            <!-- Action Button -->
            <button @click="openModal(order)"
              class="w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] group-hover:from-indigo-600 group-hover:to-purple-700">
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="state.acceptedOrders.length > 0" class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div class="text-3xl font-bold text-indigo-600 mb-2">{{ state.acceptedOrders.length }}</div>
          <div class="text-gray-600 font-medium">Total Orders</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div class="text-3xl font-bold text-green-600 mb-2">
            ₹{{state.acceptedOrders.reduce((sum, order) => sum + (order.bill?.totalAmount || 0), 0)}}
          </div>
          <div class="text-gray-600 font-medium">Total Revenue</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div class="text-3xl font-bold text-purple-600 mb-2">
            ₹{{Math.round(state.acceptedOrders.reduce((sum, order) => sum + (order.bill?.totalAmount || 0), 0) /
              state.acceptedOrders.length)}}
          </div>
          <div class="text-gray-600 font-medium">Average Order</div>
        </div>
      </div>
    </div>

    <!-- Status Update Modal -->
    <teleport to="body">
      <div v-if="state.showStatusUpdateModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click.self="closeStatusUpdateModal">
        <div class="bg-white rounded-2xl max-w-lg w-full shadow-2xl relative overflow-hidden">
          <!-- Modal Header -->
          <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
            <h2 class="text-xl font-bold text-center">Update Order Status</h2>
            <button @click="closeStatusUpdateModal" class="absolute top-4 right-4 text-white hover:text-gray-200">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-6">
            <!-- Order Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Select Order
              </label>
              <select v-model="state.selectedOrderForUpdate"
                class="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900">
                <option :value="null" disabled hidden>Choose an order...</option>
                <option v-for="order in state.acceptedOrders" :key="order._id" :value="order">
                  {{ formatOrderId(order._id) }} - {{ getCustomerName(order) }} - ₹{{ order.bill.totalAmount }}
                </option>
              </select>



            </div>

            <!-- Status Update Section -->
            <div v-if="state.selectedOrderForUpdate" class="space-y-4">
              <h3 class="font-semibold text-gray-800">Update Status</h3>

              <!-- Current Status -->
              <div class="bg-gray-50 rounded-xl p-4">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-gray-600">Current Status:</span>
                  <span :class="[
                    'px-3 py-1 text-sm font-semibold rounded-full',
                    getStatusConfig(state.selectedOrderForUpdate.status).bgColor,
                    getStatusConfig(state.selectedOrderForUpdate.status).textColor
                  ]">
                    {{ getStatusConfig(state.selectedOrderForUpdate.status).label }}
                  </span>
                </div>
              </div>

              <!-- Status Options -->
              <div class="space-y-3">
                <button v-for="status in orderStatuses" :key="status.value" @click="updateOrderStatus(status.value)"
                  :disabled="state.updatingStatus || (state.selectedOrderForUpdate.status || 'accepted') === status.value"
                  :class="[
                    'w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between',
                    (state.selectedOrderForUpdate.status || 'accepted') === status.value
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                      : `border-${status.color}-200 hover:border-${status.color}-400 hover:bg-${status.color}-50`
                  ]">
                  <div class="flex items-center gap-3">
                    <span :class="`w-4 h-4 rounded-full bg-${status.color}-500`"></span>
                    <span class="font-medium">{{ status.label }}</span>
                  </div>
                  <svg v-if="(state.selectedOrderForUpdate.status || 'accepted') === status.value"
                    class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <svg v-else class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Order Details Modal -->
    <PaidOrderModal :isOpen="state.showModal" :order="state.selectedOrder" @close="closeModal" />
  </section>
</template>

<style scoped>
/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Dynamic status colors - Tailwind classes */
.bg-blue-100 {
  background-color: rgb(219 234 254);
}

.bg-blue-500 {
  background-color: rgb(59 130 246);
}

.bg-blue-600 {
  background-color: rgb(37 99 235);
}

.text-blue-800 {
  color: rgb(30 64 175);
}

.border-blue-200 {
  border-color: rgb(191 219 254);
}

.border-blue-400 {
  border-color: rgb(96 165 250);
}

.hover\:bg-blue-50:hover {
  background-color: rgb(239 246 255);
}

.hover\:border-blue-400:hover {
  border-color: rgb(96 165 250);
}

.bg-yellow-100 {
  background-color: rgb(254 249 195);
}

.bg-yellow-500 {
  background-color: rgb(234 179 8);
}

.bg-yellow-600 {
  background-color: rgb(202 138 4);
}

.text-yellow-800 {
  color: rgb(133 77 14);
}

.border-yellow-200 {
  border-color: rgb(254 240 138);
}

.border-yellow-400 {
  border-color: rgb(250 204 21);
}

.hover\:bg-yellow-50:hover {
  background-color: rgb(255 251 235);
}

.hover\:border-yellow-400:hover {
  border-color: rgb(250 204 21);
}

.bg-green-100 {
  background-color: rgb(220 252 231);
}

.bg-green-500 {
  background-color: rgb(34 197 94);
}

.bg-green-600 {
  background-color: rgb(22 163 74);
}

.text-green-800 {
  color: rgb(22 101 52);
}

.border-green-200 {
  border-color: rgb(187 247 208);
}

.border-green-400 {
  border-color: rgb(74 222 128);
}

.hover\:bg-green-50:hover {
  background-color: rgb(240 253 244);
}

.hover\:border-green-400:hover {
  border-color: rgb(74 222 128);
}

/* Smooth animations */
.group:hover .group-hover\:from-indigo-600 {
  transition: all 0.3s ease;
}

/* Backdrop blur fallback */
@supports not (backdrop-filter: blur()) {
  .backdrop-blur-sm {
    background-color: rgba(255, 255, 255, 0.9);
  }
}
</style>