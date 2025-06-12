<script setup>
import Title from '@/components/Title.vue';
import NavBar from '@/components/NavBar.vue';
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <div>
    <!-- ✅ Hide Title and NavBar only on login and OTP pages -->
    <Title v-if="route.name !== 'login' && route.name !== 'otp'" />
    <NavBar v-if="route.name !== 'login' && route.name !== 'otp'" />
    
    <RouterView />
  </div>
</template>
