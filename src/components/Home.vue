<script setup>
import orderData from '@/orderdata.json';
import OrderCard from './OrderCard.vue';
import { ref } from 'vue';

const orders = ref(orderData);
const acceptedOrders = ref([]);

// Function to accept an order
const acceptOrder = (order) => {
  acceptedOrders.value.push(order);
  orders.value = orders.value.filter(o => o.order_id !== order.order_id);
};
</script>

<template>
  <section class="bg-blue-50 px-4 py-10">
    <div class="container-xl lg-container m-auto">
      <h2 class="text-4xl font-bold mb-6 text-center">Orders To Accept</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OrderCard
          v-for="order in orders"
          :key="order.order_id"
          :order="order"
          @acceptOrder="acceptOrder"
        />
      </div>
    </div>
  </section>
</template>
