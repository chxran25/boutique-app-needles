<template>
  <div
    class="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/50 hover:border-indigo-200 hover:-translate-y-1"
  >
    <!-- Header -->
    <div class="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-4">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-medium opacity-90">ALTERATION ID</span>
        <span
          class="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-800"
        >
          {{ request.status.toUpperCase() }}
        </span>
      </div>
      <h3 class="font-mono text-sm font-bold tracking-wide truncate">
        {{ request._id }}
      </h3>
    </div>

    <!-- Body -->
    <div class="p-6 space-y-4">
      <!-- Customer Info -->
      <div class="flex items-start gap-3">
        <div
          class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-blue-100 to-indigo-200"
        >
          <svg
            class="w-5 h-5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-800 truncate">
            {{ request.userId?.name || 'Unknown' }}
          </p>
          <p class="text-sm text-gray-500">Customer</p>
        </div>
      </div>

      <!-- Description -->
      <div class="text-sm text-gray-700">
        <p class="font-medium">Description:</p>
        <p class="text-gray-600">{{ request.description }}</p>
      </div>

      <!-- View Button -->
      <button
        @click="$emit('view', request)"
        class="w-full mt-4 text-white py-3 px-4 rounded-xl font-medium shadow-lg transition-all duration-200 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:shadow-xl transform hover:scale-[1.02]"
      >
        View Details
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  request: Object
});
</script>
