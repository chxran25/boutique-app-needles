<script setup>
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const isActiveLink = (routePath) => route.path === routePath;
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full bg-gray-500 text-white p-3 shadow-md">
    <div class="flex justify-around items-center">
      <!-- Home -->
      <RouterLink to="/" class="flex flex-col items-center" :class="{ 'text-yellow-300': isActiveLink('/') }">
        <i class="pi pi-home text-2xl"></i>
        <span class="text-sm">Home</span>
      </RouterLink>

      <!-- Orders -->
      <RouterLink to="/orders" class="flex flex-col items-center" :class="{ 'text-yellow-300': isActiveLink('/orders') }">
        <i class="pi pi-shopping-cart text-2xl"></i>
        <span class="text-sm">Orders</span>
      </RouterLink>

      <!-- Dress (New) -->
      <RouterLink to="/dress" class="flex flex-col items-center" :class="{ 'text-yellow-300': isActiveLink('/dress') }">
        <i class="pi pi-box text-2xl"></i>
        <span class="text-sm">Dress</span>
      </RouterLink>

      <!-- Profile -->
      <RouterLink to="/profile" class="flex flex-col items-center" :class="{ 'text-yellow-300': isActiveLink('/profile') }">
        <i class="pi pi-user text-2xl"></i>
        <span class="text-sm">Profile</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
nav {
  z-index: 50;
}
.text-yellow-300 {
  color: #facc15; /* Highlight active link */
}
</style>
