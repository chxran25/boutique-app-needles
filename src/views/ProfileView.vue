<script setup>
import { reactive, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useBoutiqueStore } from "@/store/boutique";
import { useToast } from "vue-toastification";
import axios from "axios";

const router = useRouter();
const toast = useToast();
const boutiqueStore = useBoutiqueStore();

const state = reactive({
  isEditing: false,
  profile: {
    boutiqueName: "",
    ownerName: "",
    phone: "",
    address: "",
    imageUrl: "https://via.placeholder.com/200x200" // Placeholder image
  }
});

// Fetch profile from JSON server
const fetchProfile = async () => {
  try {
    const response = await axios.get("http://localhost:9000/profile");
    state.profile = response.data;
    boutiqueStore.updateBoutiqueName(state.profile.boutiqueName);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    toast.error("Failed to load profile data.");
  }
};

// Watch for boutique name changes
watch(() => boutiqueStore.boutiqueName, (newName) => {
  state.profile.boutiqueName = newName;
});

// Save profile
const handleSave = async () => {
  try {
    await axios.put("http://localhost:9000/profile", state.profile);
    boutiqueStore.updateBoutiqueName(state.profile.boutiqueName);
    state.isEditing = false;
    toast.success("Profile updated successfully!");
  } catch (error) {
    console.error("Error saving profile:", error);
    toast.error("Failed to update profile.");
  }
};

// Logout function
const handleLogout = () => {
  router.push("/login");
};

// Fetch profile on mount
onMounted(fetchProfile);
</script>

<template>
  <div class="p-6 max-w-2xl mx-auto bg-white rounded-xl shadow-md space-y-6 mt-6">
    <!-- Profile Picture -->
    <div class="flex justify-center">
      <img
        :src="state.profile.imageUrl"
        alt="Boutique"
        class="w-32 h-32 rounded-lg border border-gray-300 object-cover shadow-md"
      />
    </div>

    <div v-if="state.isEditing" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium">Boutique Name:</label>
        <input v-model="state.profile.boutiqueName" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Owner Name:</label>
        <input v-model="state.profile.ownerName" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Phone:</label>
        <input v-model="state.profile.phone" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Address:</label>
        <input v-model="state.profile.address" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />
      </div>

      <div>
        <label class="block text-gray-700 font-medium">Boutique Image URL:</label>
        <input v-model="state.profile.imageUrl" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400" />
      </div>

      <!-- Save & Cancel Buttons (Moved Up) -->
      <div class="flex justify-between mt-6 space-x-4">
        <button @click="handleSave" class="bg-green-500 text-white px-4 py-2 rounded-lg w-1/2 shadow-md">
          Save
        </button>
        <button @click="state.isEditing = false" class="bg-gray-500 text-white px-4 py-2 rounded-lg w-1/2 shadow-md">
          Cancel
        </button>
      </div>
    </div>

    <div v-else class="text-lg space-y-4 px-6 py-6 bg-gray-50 rounded-lg shadow-md">
      <p><strong>Boutique Name:</strong> {{ state.profile.boutiqueName }}</p>
      <p><strong>Owner Name:</strong> {{ state.profile.ownerName }}</p>
      <p><strong>Phone:</strong> {{ state.profile.phone }}</p>
      <p><strong>Address:</strong> {{ state.profile.address }}</p>

      <!-- Edit Profile & Logout Buttons (Smaller & Evenly Spaced) -->
      <div class="flex justify-between mt-4">
        <button @click="state.isEditing = true" class="bg-blue-500 text-white px-4 py-2 rounded-lg w-[48%] shadow-md">
          Edit Profile
        </button>
        <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded-lg w-[48%] shadow-md">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
