<script setup>
import { ref, reactive, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useRouter } from "vue-router";
import OrderCard from "@/components/OrderCard.vue";
import AlterationRequestDetailModal from "@/components/AlterationRequestDetailModal.vue";

import {
  getPendingOrders,
  getCatalogueByBoutiqueId,
  getAlterationRequests,
  isAuthenticated,
} from "@/services/api";

const toast = useToast();
const router = useRouter();
const selectedTab = ref("orders");

const state = reactive({
  orders: [],
  catalogue: [],
  alterationRequests: [],
  loading: true,
  error: null,
});

const showModal = ref(false);
const selectedRequest = ref(null);

const openModal = (request) => {
  selectedRequest.value = request;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const handleStatusUpdate = (newStatus) => {
  const idToRemove = selectedRequest.value._id;
  console.log("🔍 Trying to remove ID:", idToRemove);

  const existing = state.alterationRequests.find(r => r._id === idToRemove);
  console.log("✅ Found in state before removal:", existing);

  state.alterationRequests = state.alterationRequests.filter(
    (r) => r._id !== idToRemove
  );

  console.log("🧹 Updated alterationRequests:", state.alterationRequests);

  if (newStatus === 'Reviewed') {
    toast.success("✅ Marked as reviewed and removed from the list");
  }
};

const fetchOrdersAndCatalogue = async () => {
  try {
    console.log('🏠 HomeView: Starting data fetch...');
    
    // Check authentication status
    const authStatus = isAuthenticated();
    console.log('🔐 Authentication status:', authStatus);
    
    if (!authStatus) {
      console.warn('🚨 Not authenticated - redirecting to login');
      toast.error('Please log in to access this page.');
      router.push({ name: 'login' });
      return;
    }

    state.loading = true;
    state.error = null;

    // Fetch catalogue first
    console.log('📚 Fetching catalogue...');
    try {
      const catalogue = await getCatalogueByBoutiqueId();
      state.catalogue = catalogue;
      console.log('✅ Catalogue loaded:', catalogue.length, 'items');
    } catch (catalogueError) {
      console.error('❌ Catalogue fetch failed:', catalogueError);
      toast.error('Failed to load catalogue');
    }

    // Fetch orders
    console.log('📋 Fetching pending orders...');
    try {
      const orders = await getPendingOrders();
      console.log('✅ Raw orders received:', orders);
      
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
          _id: order._id,
          order_id: `ORD${String(idx + 1).padStart(3, "0")}`,
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
          catalogueItems: state.catalogue,
        };
      });
      
      console.log('✅ Processed orders:', state.orders.length);
    } catch (ordersError) {
      console.error('❌ Orders fetch failed:', ordersError);
      toast.error('Failed to load orders');
      state.error = 'Failed to load orders';
    }

    // Fetch alteration requests
    console.log('🔧 Fetching alteration requests...');
    try {
      const alterations = await getAlterationRequests();
      console.log('✅ Alteration requests received:', alterations);
      state.alterationRequests = alterations;
    } catch (alterationsError) {
      console.error('❌ Alterations fetch failed:', alterationsError);
      toast.error('Failed to load alteration requests');
    }

  } catch (error) {
    console.error("❌ Overall fetch error:", error);
    state.error = error.message || 'Failed to load data';
    toast.error("Failed to load data. Please try refreshing the page.");
  } finally {
    state.loading = false;
  }
};

onMounted(() => {
  console.log('🚀 HomeView mounted');
  fetchOrdersAndCatalogue();
});
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg-container m-auto pb-12">
      <!-- Loading State -->
      <div v-if="state.loading" class="text-center py-20">
        <div class="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-600">Loading your data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="state.error" class="text-center py-20">
        <div class="text-red-500 text-xl mb-4">⚠️ {{ state.error }}</div>
        <button 
          @click="fetchOrdersAndCatalogue"
          class="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          Retry
        </button>
      </div>

      <!-- Main Content -->
      <div v-else>
        <!-- Tabs -->
        <div class="flex justify-center mb-6 space-x-4">
          <button
            :class="selectedTab === 'orders' ? 'bg-white text-black font-semibold border-b-2 border-black' : 'text-gray-500'"
            class="px-4 py-2"
            @click="selectedTab = 'orders'"
          >
            Orders ({{ state.orders.length }})
          </button>
          <button
            :class="selectedTab === 'alterations' ? 'bg-white text-black font-semibold border-b-2 border-black' : 'text-gray-500'"
            class="px-4 py-2"
            @click="selectedTab = 'alterations'"
          >
            Alteration Orders ({{ state.alterationRequests.length }})
          </button>
        </div>

        <!-- Orders Tab -->
        <div v-if="selectedTab === 'orders'">
          <h2 class="text-4xl font-bold mb-6 text-center">
            Orders To Accept
            <span v-if="state.orders.length" class="text-lg text-gray-600">
              ({{ state.orders.length }} pending)
            </span>
          </h2>

          <div v-if="state.orders.length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OrderCard v-for="order in state.orders" :key="order.order_id" :order="order" />
          </div>

          <div v-else class="text-center text-green-600 text-lg font-semibold mt-10">
            <i class="pi pi-check-circle text-green-500 text-3xl"></i>
            <p class="mt-2">🎉 Hooray! You have no more pending orders to accept.</p>
          </div>
        </div>

        <!-- Alteration Orders Tab -->
        <div v-else>
          <h2 class="text-4xl font-bold mb-6 text-center">Alteration Orders</h2>

          <div
            v-if="state.alterationRequests && state.alterationRequests.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div
              v-for="request in state.alterationRequests"
              :key="request._id"
              class="bg-white shadow-lg rounded-lg p-4"
            >
              <h3 class="text-lg font-semibold mb-1">👗 {{ request.userId?.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">Status: {{ request.status }}</p>
              <p class="text-sm mb-2">Description: {{ request.description }}</p>

              <button
                @click="openModal(request)"
                class="mt-2 bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
              >
                View Details
              </button>
            </div>
          </div>

          <div v-else class="text-center text-gray-500 mt-10">
            No alteration requests found.
          </div>
        </div>
      </div>
    </div>

    <!-- Alteration Request Detail Modal -->
    <AlterationRequestDetailModal
      v-if="showModal"
      :visible="showModal"
      :request="selectedRequest"
      @close="closeModal"
      @updated="handleStatusUpdate"
    />
  </section>
</template>