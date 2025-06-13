<script setup>
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useBoutiqueStore } from "@/store/boutique";
import { getBoutiqueProfile } from "@/services/api"; // ✅ Use actual API

const route = useRoute();
const boutiqueStore = useBoutiqueStore();

const fetchBoutiqueName = async () => {
  try {
    const response = await getBoutiqueProfile();
    const boutiqueName = response?.data?.name || "Your Boutique";
    boutiqueStore.updateBoutiqueName(boutiqueName);
  } catch (error) {
    console.error("Failed to fetch boutique name:", error);
  }
};

onMounted(fetchBoutiqueName);

const pageTitle = computed(() => {
  return {
    text: boutiqueStore.boutiqueName || "Loading...",
    icon: "pi-tag"  // or remove if not needed
  };
});

</script>


<template>
  <nav class="bg-gray-900 text-white p-6 shadow-md">
    <div class="flex justify-center items-center">
      <!-- Icon and Dynamic Title -->
      <i :class="`pi ${pageTitle.icon} text-4xl mr-3`"></i>
      <span class="text-3xl font-bold">{{ pageTitle.text }}</span>
    </div>
  </nav>
</template>

