<script setup>
import { reactive, onMounted, computed } from "vue";
import { useToast } from "vue-toastification";
import { getPaidOrders, updateOrderStatus as updateOrderStatusAPI, getReviewedAlterationRequests , updateAlterationStatus} from "@/services/api";
import PaidOrderModal from "@/components/PaidOrderModal.vue";

const state = reactive({
  acceptedOrders: [],
  reviewedAlterations: [],
  loading: true,
  showModal: false,
  selectedOrder: null,
  searchQuery: "",
  showStatusUpdateModal: false,
  selectedOrderForUpdate: null,
  updatingStatus: false,
  statusFilter: 'all', // all, accepted, in-progress, ready-for-delivery, reviewed
  reviewedStatusFilter: 'all',
  activeTab: 'regular', // regular, reviewed
});

const boutiqueId = "67963acd15a076d83704ce25"; // Replace with dynamic ID if needed
const toast = useToast();

// Updated Order status configuration to match backend
const orderStatuses = [
  {
    value: 'Pending',
    label: 'Pending',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    filterValue: 'pending'
  },
  {
    value: 'In Progress',
    label: 'In Progress',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    filterValue: 'in-progress'
  },
  {
    value: 'Ready for Delivery',
    label: 'Ready for Delivery',
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    filterValue: 'ready-for-delivery'
  },
  {
    value: 'Reviewed',
    label: 'Reviewed',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-800',
    filterValue: 'reviewed'
  }
];

// Helper function to normalize status for filtering
const normalizeStatusForFilter = (status) => {
  if (!status) return 'pending'; // Default status

  const statusMap = {
    'Pending': 'pending',
    'In Progress': 'in-progress',
    'Ready for Delivery': 'ready-for-delivery',
    'Reviewed': 'reviewed',
    // Handle legacy statuses if they exist
    'accepted': 'pending',
    'in-progress': 'in-progress',
    'delivered': 'ready-for-delivery'
  };

  return statusMap[status] || 'pending';
};

// Computed property for regular orders
const regularOrders = computed(() => {
  return state.acceptedOrders.filter(order => {
    const normalizedStatus = normalizeStatusForFilter(order.status);
    return normalizedStatus !== 'reviewed';
  });
});

// ✅ Updated: Computed property for reviewed orders
const reviewedOrders = computed(() => {
  return state.reviewedAlterations || [];
});

const filteredStatusOptions = computed(() => {
  const isReviewedOrder = state.activeTab === 'reviewed';

  return orderStatuses.filter((status) => {
    if (isReviewedOrder) {
      return ['Reviewed', 'In Progress', 'Ready for Delivery'].includes(status.value);
    } else {
      return ['Pending', 'In Progress', 'Ready for Delivery'].includes(status.value);
    }
  });
});


// Computed property for current tab orders
const currentTabOrders = computed(() => {
  return state.activeTab === 'reviewed' ? reviewedOrders.value : regularOrders.value;
});

// Computed property for filtered orders based on current tab
const filteredOrders = computed(() => {
  let orders = currentTabOrders.value;

  const filterKey = state.activeTab === 'regular' ? state.statusFilter : state.reviewedStatusFilter;

  if (filterKey !== 'all') {
    orders = orders.filter(order => normalizeStatusForFilter(order.status) === filterKey);
  }

  // Search filter
  if (state.searchQuery) {
    orders = orders.filter(order =>
      order._id.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      order.userId?.name?.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      order.bill.totalAmount.toString().includes(state.searchQuery)
    );
  }

  return orders;
});

// Get status counts for each category (only for regular orders)
const statusCounts = computed(() => {
  const counts = { all: regularOrders.value.length };

  // Initialize counts for each status (excluding reviewed)
  orderStatuses.filter(status => status.filterValue !== 'reviewed').forEach(status => {
    counts[status.filterValue] = 0;
  });

  // Count regular orders by status
  regularOrders.value.forEach(order => {
    const normalizedStatus = normalizeStatusForFilter(order.status);
    if (counts[normalizedStatus] !== undefined) {
      counts[normalizedStatus]++;
    }
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
        const loc = order.boutiqueId?.location;
        if (typeof loc === 'string') {
          const parsed = JSON.parse(loc);
          parsedLocation = parsed?.formattedAddress || "Unknown";
        } else if (typeof loc === 'object' && loc !== null) {
          parsedLocation = loc.formattedAddress || "Unknown";
        }
      } catch (e) {
        console.warn("⚠️ Failed to parse location:", e);
      }

      return {
        ...order,
        voiceNotes: order.voiceNote || [],
        location: parsedLocation,
        status: order.status || 'Pending'
      };
    });
  } catch (error) {
    toast.error("❌ Failed to fetch paid orders.");
    console.error("Error fetching orders:", error);
  } finally {
    state.loading = false;
  }
};

const fetchReviewedAlterations = async () => {
  try {
    const alterations = await getReviewedAlterationRequests();
    state.reviewedAlterations = alterations.map((alt) => ({
      ...alt,
      voiceNotes: alt.voiceNote || [],
      bill: {
        totalAmount: alt.price || 0,
        itemBreakdown: { Alteration: 1 }
      },
      userId: alt.userId,
      status: alt.status,
      createdAt: alt.createdAt || alt.updatedAt || new Date(),
    }));
  } catch (error) {
    toast.error("❌ Failed to fetch reviewed alterations.");
    console.error("Error fetching reviewed alterations:", error);
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

// Updated updateOrderStatus function with actual API call
const updateOrderStatus = async (newStatus) => {
  if (!state.selectedOrderForUpdate) return;

  try {
    state.updatingStatus = true;

    if (state.activeTab === 'reviewed') {
      // ✅ Update reviewed alteration order
      await updateAlterationStatus(state.selectedOrderForUpdate._id, newStatus);

      // Update locally
      const index = state.reviewedAlterations.findIndex(
        alt => alt._id === state.selectedOrderForUpdate._id
      );
      if (index !== -1) {
        state.reviewedAlterations[index].status = newStatus;
      }
    } else {
      // ✅ Update regular order
      await updateOrderStatusAPI(state.selectedOrderForUpdate._id, newStatus);

      const orderIndex = state.acceptedOrders.findIndex(order =>
        order._id === state.selectedOrderForUpdate._id
      );
      if (orderIndex !== -1) {
        state.acceptedOrders[orderIndex].status = newStatus;
      }
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
  // Handle both new and legacy status formats
  const normalizedStatus = status || 'Pending';
  return orderStatuses.find(s => s.value === normalizedStatus) || orderStatuses[0];
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

// Switch between tabs
const switchTab = (tab) => {
  state.activeTab = tab;
  state.statusFilter = 'all';
  state.searchQuery = '';
};

onMounted(() => {
  fetchAcceptedOrders();
  fetchReviewedAlterations();
});
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

        <!-- Tab Navigation -->
        <div class="mt-6 flex gap-4 border-b border-gray-200">
          <button @click="switchTab('regular')" :class="[
            'px-6 py-3 font-semibold transition-all duration-200 border-b-2',
            state.activeTab === 'regular'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          ]">
            Regular Orders ({{ regularOrders.length }})
          </button>
          <button @click="switchTab('reviewed')" :class="[
            'px-6 py-3 font-semibold transition-all duration-200 border-b-2',
            state.activeTab === 'reviewed'
              ? 'text-purple-600 border-purple-600'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
          ]">
            Reviewed Orders ({{ reviewedOrders.length }})
          </button>
        </div>

        <!-- Status Filter Tabs (only for regular orders) -->
        <div v-if="state.activeTab === 'regular'" class="mt-6 flex flex-wrap gap-2">

          <button @click="state.statusFilter = 'all'" :class="[
            'px-4 py-2 rounded-xl font-medium transition-all duration-200',
            state.statusFilter === 'all'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
          ]">
            All Orders ({{ statusCounts.all }})
          </button>

          <button v-for="status in orderStatuses.filter(s => s.filterValue !== 'reviewed')" :key="status.value"
            @click="state.statusFilter = status.filterValue" :class="[
              'px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2',
              state.statusFilter === status.filterValue
                ? `bg-gradient-to-r from-${status.color}-500 to-${status.color}-600 text-white shadow-lg`
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            ]">
            <span :class="`w-2 h-2 rounded-full bg-${status.color}-500`"></span>
            {{ status.label }} ({{ statusCounts[status.filterValue] }})
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
      <div v-else-if="currentTabOrders.length === 0" class="text-center py-20">
        <div class="max-w-md mx-auto">
          <div
            class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-800 mb-2">
            {{ state.activeTab === 'reviewed' ? 'No Reviewed Orders' : 'No Orders Yet' }}
          </h3>
          <p class="text-gray-600">
            {{ state.activeTab === 'reviewed'
              ? 'No reviewed orders found.'
              : 'You haven\'t accepted any orders yet. Orders will appear here once customers place them.'
            }}
          </p>
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
          <div :class="[
            'text-white px-6 py-4 relative overflow-hidden',
            state.activeTab === 'reviewed'
              ? 'bg-gradient-to-r from-purple-500 to-pink-600'
              : 'bg-gradient-to-r from-indigo-500 to-purple-600'
          ]">
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
              <div :class="[
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                state.activeTab === 'reviewed'
                  ? 'bg-gradient-to-br from-purple-100 to-pink-200'
                  : 'bg-gradient-to-br from-blue-100 to-indigo-200'
              ]">
                <svg :class="[
                  'w-5 h-5',
                  state.activeTab === 'reviewed' ? 'text-purple-600' : 'text-indigo-600'
                ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <span :class="[
                  'font-bold text-lg',
                  state.activeTab === 'reviewed' ? 'text-purple-600' : 'text-indigo-600'
                ]">₹{{ order.bill.totalAmount }}</span>
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
            <button @click="openModal(order)" :class="[
              'w-full mt-4 text-white py-3 px-4 rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02]',
              state.activeTab === 'reviewed'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 group-hover:from-purple-600 group-hover:to-pink-700'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 group-hover:from-indigo-600 group-hover:to-purple-700'
            ]">
              View Details
            </button>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="currentTabOrders.length > 0" class="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div :class="[
            'text-3xl font-bold mb-2',
            state.activeTab === 'reviewed' ? 'text-purple-600' : 'text-indigo-600'
          ]">{{ currentTabOrders.length }}</div>
          <div class="text-gray-600 font-medium">
            {{ state.activeTab === 'reviewed' ? 'Reviewed Orders' : 'Total Orders' }}
          </div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div class="text-3xl font-bold text-green-600 mb-2">
            ₹{{currentTabOrders.reduce((sum, order) => sum + (order.bill?.totalAmount || 0), 0)}}
          </div>
          <div class="text-gray-600 font-medium">Total Revenue</div>
        </div>
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/50">
          <div :class="[
            'text-3xl font-bold mb-2',
            state.activeTab === 'reviewed' ? 'text-pink-600' : 'text-purple-600'
          ]">
            ₹{{Math.round(currentTabOrders.reduce((sum, order) => sum + (order.bill?.totalAmount || 0), 0) /
              currentTabOrders.length)}}
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
                <option v-for="order in state.activeTab === 'regular' ? state.acceptedOrders : reviewedOrders"
                  :key="order._id" :value="order">
                  {{ formatOrderId(order._id) }} – {{ getCustomerName(order) }} – ₹{{ order.bill?.totalAmount || 0 }}
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
                <button v-for="status in filteredStatusOptions" :key="status.value"
                  @click="updateOrderStatus(status.value)"
                  :disabled="state.updatingStatus || (state.selectedOrderForUpdate.status || 'Pending') === status.value"
                  :class="[
                    'w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between',
                    (state.selectedOrderForUpdate.status || 'Pending') === status.value
                      ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50'
                      : `border-${status.color}-200 hover:border-${status.color}-400 hover:bg-${status.color}-50`
                  ]">
                  <div class="flex items-center gap-3">
                    <span :class="`w-4 h-4 rounded-full bg-${status.color}-500`"></span>
                    <span class="font-medium">{{ status.label }}</span>
                    <span v-if="state.updatingStatus" class="text-xs text-gray-500">(Updating...)</span>
                  </div>
                  <svg v-if="(state.selectedOrderForUpdate.status || 'Pending') === status.value"
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
