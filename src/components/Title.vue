<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBoutiqueStore } from "@/store/boutique";
import axios from "axios";

const route = useRoute();
const boutiqueStore = useBoutiqueStore();

// Fetch boutique name on component mount
const fetchBoutiqueName = async () => {
  try {
    const response = await axios.get("http://localhost:9000/profile");
    boutiqueStore.updateBoutiqueName(response.data.boutiqueName);  // Ensure the store is updated
  } catch (error) {
    console.error("Failed to fetch boutique name:", error);
  }
};

// Call fetch function once component is mounted
onMounted(fetchBoutiqueName);

// Compute the page title dynamically
const pageTitle = computed(() => {
  if (route.path === "/") {
    return { text: boutiqueStore.boutiqueName || "Loading...", icon: "pi-tag" };
  }
  switch (route.path) {
    case "/orders":
      return { text: "All Orders", icon: "pi-shopping-cart" };
    case "/catalogue":
      return { text: "Our Dress Styles", icon: "pi-tshirt" };
    case "/profile":
      return { text: "Profile", icon: "pi-user" };
    default:
      return { text: boutiqueStore.boutiqueName || "Loading...", icon: "pi-tag" };
  }
});
</script>

<template>
  <nav class="bg-gray-900 text-white p-6 shadow-md">
    <div class="flex justify-center items-center">
      <!-- Dynamic Icon -->
      <i :class="`pi ${pageTitle.icon} text-4xl mr-3`"></i>
      <!-- Dynamic Title -->
      <span class="text-3xl font-bold">{{ pageTitle.text }}</span>
    </div>
  </nav>
</template>
