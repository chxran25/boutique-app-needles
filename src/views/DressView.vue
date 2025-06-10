<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-100 py-8 px-4">
        <div class="max-w-6xl mx-auto">
            <!-- Header -->
            <div class="flex flex-col sm:flex-row justify-between items-center mb-8">
                <div class="text-center sm:text-left">
                    <h1
                        class="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-transparent bg-clip-text">
                        Dress Management
                    </h1>
                    <p class="text-gray-600 mt-1">Manage your dress types and catalogue offerings</p>
                </div>
            </div>

            <!-- Tabs -->
            <div class="flex justify-center space-x-4 mb-8">
                <button class="px-6 py-3 rounded-full font-semibold shadow-lg text-base transition-all duration-200"
                    :class="tab === 'dressTypes' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'"
                    @click="tab = 'dressTypes'">
                    Dress Types
                </button>
                <button class="px-6 py-3 rounded-full font-semibold shadow-lg text-base transition-all duration-200"
                    :class="tab === 'catalogue' ? 'bg-purple-600 text-white' : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'"
                    @click="tab = 'catalogue'">
                    Catalogue
                </button>
            </div>

            <!-- Add Button -->
            <div v-if="tab === 'dressTypes'" class="flex justify-end mb-6">
                <button
                    class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:from-green-600 hover:to-emerald-700 transition-all"
                    @click="showModal = true">
                    + Add Dress Type
                </button>
            </div>

            <!-- Dress Types Section -->
            <div v-if="tab === 'dressTypes'">
                <div v-if="loading" class="text-center py-16 text-gray-500 text-lg font-medium">Loading dress types...
                </div>
                <div v-else-if="dressTypes.length === 0" class="text-center py-16 text-gray-500 text-lg font-medium">No
                    dress types added yet.</div>

                <div v-else class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div v-for="(dress, index) in dressTypes" :key="index"
                        class="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative">
                        <!-- Edit/Delete Icons -->
                        <div class="absolute top-4 right-4 flex space-x-2 z-10">
                            <button @click="openPreview(dress)" title="Preview"
                                class="bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full p-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M15 10l4.553 2.276A1 1 0 0120 13.118V18a2 2 0 01-2 2H6a2 2 0 01-2-2v-4.882a1 1 0 01.447-.842L9 10m6 0V7a3 3 0 00-6 0v3m6 0H9" />
                                </svg>
                            </button>
                            <button @click="promptDelete(dress)" title="Delete"
                                class="bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <h2 class="text-2xl font-bold text-purple-700 mb-4 tracking-tight capitalize">{{ dress.type }}
                        </h2>

                        <div class="flex space-x-3 overflow-x-auto pb-2 mb-4">
                            <img v-for="(img, i) in dress.images" :key="i" :src="img"
                                class="w-28 h-28 object-cover rounded-xl border border-gray-200 shadow-sm hover:scale-105 transition-transform cursor-pointer"
                                alt="Dress Image" @click="openPreview(dress)" />
                        </div>

                        <div>
                            <h3 class="text-sm font-semibold text-gray-700 mb-1">Measurements Required:</h3>
                            <ul class="list-disc text-sm text-gray-600 pl-5 space-y-1">
                                <li v-for="(m, i) in dress.measurementRequirements" :key="i">{{ m }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Catalogue Placeholder -->
            <div v-if="tab === 'catalogue'">
                <div class="text-center py-20 text-gray-500 font-medium text-lg">Catalogue view coming soon...</div>
            </div>
        </div>

        <!-- Add Modal -->
        <AddDressTypeModal :isOpen="showModal" :boutiqueId="boutiqueId" @close="showModal = false"
            @success="refreshList" />

        <!-- Delete Confirmation Modal -->
        <DeleteConfirmationModal :isOpen="showDeleteModal" :itemName="dressToDelete?.type"
            @close="showDeleteModal = false" @confirm="handleConfirmedDelete" />

        <!-- Dress Preview Modal -->
        <!-- ✅ Correct -->
        <DressTypePreviewModal :isOpen="showPreviewModal" :dressType="dressToPreview" @close="closePreviewModal" />


    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getDressTypesWithDetails } from '@/services/api';
import AddDressTypeModal from '@/components/AddDressTypeModal.vue';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue';
import DressTypePreviewModal from '@/components/DressTypePreviewModal.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

const tab = ref('dressTypes');
const dressTypes = ref([]);
const loading = ref(true);
const showModal = ref(false);
const showDeleteModal = ref(false);
const showPreviewModal = ref(false);
const dressToDelete = ref(null);
const dressToPreview = ref(null);
const boutiqueId = '67963acd15a076d83704ce25';
const toast = useToast();

const fetchDressTypes = async () => {
    try {
        dressTypes.value = await getDressTypesWithDetails(boutiqueId);
    } catch (error) {
        console.error('Error loading dress types:', error);
    } finally {
        loading.value = false;
    }
};

const closePreviewModal = () => {
    showPreviewModal.value = false;
    dressToPreview.value = null;
};


const refreshList = async () => {
    loading.value = true;
    await fetchDressTypes();
    loading.value = false;
};

const openPreview = (dress) => {
    dressToPreview.value = dress;
    showPreviewModal.value = true;
};

const promptDelete = (dress) => {
    dressToDelete.value = dress;
    showDeleteModal.value = true;
};

const handleConfirmedDelete = async () => {
    if (!dressToDelete.value) return;
    try {
        await axios.delete(`https://needles-v1.onrender.com/Boutique/${boutiqueId}/delete-dressType`, {
            data: {
                boutiqueId,
                dressType: dressToDelete.value.type
            }
        });
        toast.success(`✅ "${dressToDelete.value.type}" deleted successfully.`);
        refreshList();
    } catch (err) {
        console.error('Failed to delete dress type:', err);
        toast.error(`❌ Failed to delete "${dressToDelete.value.type}".`);
    } finally {
        showDeleteModal.value = false;
        dressToDelete.value = null;
    }
};

onMounted(fetchDressTypes);
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
