<template>
  <div class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-blue-50 to-purple-100 p-6 text-center">
    <h1 class="text-6xl font-extrabold text-indigo-600 mb-4">404</h1>
    <p class="text-xl text-gray-700 mb-6">Oops! The page you're looking for doesn't exist.</p>
    <router-link
      to="/"
      class="inline-block px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold shadow-md hover:from-indigo-600 hover:to-purple-700 transition"
    >
      ⬅ Go Back Home
    </router-link>
  </div>
</template>

<script setup>
// No logic needed
</script>
