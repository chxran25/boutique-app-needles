<template>
  <section class="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 py-10">
    <div class="container mx-auto max-w-6xl px-4">
      <!-- Page Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Dress Management
        </h1>
        <p class="text-gray-600 mt-2">Manage dress types and your boutique catalogue</p>
      </div>

      <!-- Tabs -->
      <div class="flex justify-center mb-8">
        <div class="flex space-x-6">
          <button
            @click="tab = 'dressTypes'"
            :class="[tab === 'dressTypes' ? activeTab : inactiveTab]"
            class="px-6 py-3 text-lg font-semibold rounded-full shadow transition"
          >
            Dress Types
          </button>
          <button
            @click="tab = 'catalogue'"
            :class="[tab === 'catalogue' ? activeTab : inactiveTab]"
            class="px-6 py-3 text-lg font-semibold rounded-full shadow transition"
          >
            Catalogue
          </button>
        </div>
      </div>

      <!-- Add Button -->
      <div class="flex justify-end mb-6">
        <button
          v-if="tab === 'dressTypes'"
          @click="showAddModal = true"
          class="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:from-indigo-600 hover:to-purple-700 transition"
        >
          + Add Dress Type
        </button>
        <button
          v-if="tab === 'catalogue'"
          @click="showAddCatalogueModal = true"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:from-green-600 hover:to-emerald-700 transition"
        >
          + Add Catalogue Item
        </button>
      </div>

      <!-- Dress Types -->
      <div v-if="tab === 'dressTypes'" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="dress in dressTypes"
          :key="dress.type"
          class="bg-white rounded-2xl shadow-lg hover:shadow-xl border p-6 transition-all duration-300"
        >
          <div class="relative">
            <img
              v-if="dress.images && dress.images.length"
              :src="dress.images[0]"
              class="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h2 class="text-xl font-bold text-purple-700 mb-2">{{ dress.type }}</h2>
            <ul class="list-disc pl-5 text-sm text-gray-700 mb-4">
              <li v-for="(m, i) in dress.measurementRequirements" :key="i">{{ m }}</li>
            </ul>
            <div class="flex justify-between text-sm">
              <button @click="openPreview(dress)" class="text-indigo-600 hover:underline">Preview</button>
              <button @click="confirmDeleteDress(dress)" class="text-red-600 hover:underline">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Catalogue View -->
      <div v-if="tab === 'catalogue'" class="space-y-4">
        <div v-if="catalogue.length === 0" class="text-center text-gray-500 text-lg">
          No items in the catalogue yet.
        </div>
        <div
          v-for="(item, index) in catalogue"
          :key="index"
          class="bg-white p-5 rounded-xl shadow flex justify-between items-center"
        >
          <div class="text-gray-800 font-medium">
            {{ item.itemName[0] }} – ₹{{ item.price[0] }}
          </div>
          <button
            @click="confirmDeleteCatalogueItem(item.itemName[0])"
            class="text-red-600 hover:text-red-800 text-sm font-semibold"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <AddDressTypeModal :isOpen="showAddModal" @close="showAddModal = false" @refresh="fetchDressTypes" />
    <DressTypePreviewModal :isOpen="showPreviewModal" :dressType="selectedPreview" @close="closePreviewModal" />
    <ConfirmationModal
      v-if="showDeleteModal"
      title="Confirm Deletion"
      message="Are you sure you want to delete this dress type?"
      @confirm="deleteDressTypeConfirmed"
      @cancel="showDeleteModal = false"
    />
    <AddCatalogueItemModal :isOpen="showAddCatalogueModal" @close="showAddCatalogueModal = false" @refresh="fetchCatalogue" />
    <DeleteConfirmationModal
      :isOpen="showDeleteCatalogueModal"
      :itemName="catalogueItemToDelete"
      @close="showDeleteCatalogueModal = false"
      @confirm="handleCatalogueItemDelete"
    />
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import {
  getDressTypesWithDetails,
  deleteDressTypeAPI,
  getCatalogueByBoutiqueId,
  deleteCatalogueItems,
} from '@/services/api';

import AddDressTypeModal from '@/components/AddDressTypeModal.vue';
import DressTypePreviewModal from '@/components/DressTypePreviewModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import AddCatalogueItemModal from '@/components/AddCatalogueItemModal.vue';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue';

const boutiqueId = '67963acd15a076d83704ce25';

const tab = ref('dressTypes');
const showAddModal = ref(false);
const showAddCatalogueModal = ref(false);
const showPreviewModal = ref(false);
const showDeleteModal = ref(false);
const showDeleteCatalogueModal = ref(false);

const dressTypes = ref([]);
const catalogue = ref([]);
const selectedPreview = ref(null);
const deleteTarget = ref(null);
const catalogueItemToDelete = ref(null);

const toast = useToast();

const activeTab = 'bg-purple-600 text-white';
const inactiveTab = 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50';

const fetchDressTypes = async () => {
  try {
    dressTypes.value = await getDressTypesWithDetails(boutiqueId);
  } catch {
    toast.error('Failed to load dress types');
  }
};

const fetchCatalogue = async () => {
  try {
    catalogue.value = await getCatalogueByBoutiqueId(boutiqueId);
  } catch {
    toast.error('Failed to load catalogue');
  }
};

const openPreview = (dress) => {
  selectedPreview.value = dress;
  showPreviewModal.value = true;
};

const closePreviewModal = () => {
  selectedPreview.value = null;
  showPreviewModal.value = false;
};

const confirmDeleteDress = (dress) => {
  deleteTarget.value = dress;
  showDeleteModal.value = true;
};

const deleteDressTypeConfirmed = async () => {
  try {
    await deleteDressTypeAPI(boutiqueId, deleteTarget.value.type);
    toast.success('Dress type deleted');
    fetchDressTypes();
  } catch {
    toast.error('Deletion failed');
  } finally {
    showDeleteModal.value = false;
    deleteTarget.value = null;
  }
};

const confirmDeleteCatalogueItem = (itemName) => {
  catalogueItemToDelete.value = itemName;
  showDeleteCatalogueModal.value = true;
};

const handleCatalogueItemDelete = async () => {
  try {
    await deleteCatalogueItems(boutiqueId, [catalogueItemToDelete.value]);
    toast.success('Catalogue item deleted');
    fetchCatalogue();
  } catch {
    toast.error('Failed to delete catalogue item');
  } finally {
    showDeleteCatalogueModal.value = false;
    catalogueItemToDelete.value = null;
  }
};

onMounted(() => {
  fetchDressTypes();
  fetchCatalogue();
});
</script>

<style scoped>
::-webkit-scrollbar {
  height: 6px;
}
::-webkit-scrollbar-thumb {
  background-color: #c4b5fd;
  border-radius: 10px;
}
</style>
