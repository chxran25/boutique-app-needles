<template>
  <div class="bg-white/80 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg p-8 space-y-6">
    <div class="flex items-center gap-3">
      <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
        Header Images
      </h3>
    </div>

    <!-- File Upload Area -->
    <div class="space-y-4">
      <div 
        @drop="handleDrop"
        @dragover.prevent
        @dragenter.prevent
        @dragleave="isDragging = false"
        @dragenter="isDragging = true"
        :class="[
          'relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer group',
          isDragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-indigo-50/50'
        ]"
        @click="$refs.fileInput.click()"
      >
        <input 
          ref="fileInput"
          type="file" 
          multiple 
          @change="handleFileSelect" 
          accept="image/*"
          class="hidden" 
        />
        
        <div class="space-y-4">
          <div :class="[
            'w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-colors duration-300',
            isDragging ? 'bg-indigo-500' : 'bg-gray-400 group-hover:bg-indigo-500'
          ]">
            <svg :class="[
              'w-8 h-8 transition-colors duration-300',
              isDragging ? 'text-white' : 'text-white group-hover:text-white'
            ]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div>
            <p class="text-lg font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors duration-300">
              {{ isDragging ? 'Drop images here' : 'Click to upload or drag and drop' }}
            </p>
            <p class="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </div>

        <!-- Upload Progress -->
        <div v-if="isUploading" class="absolute inset-0 bg-white/90 rounded-2xl flex items-center justify-center">
          <div class="text-center space-y-4">
            <div class="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-indigo-600 font-medium">Uploading images...</p>
            <div class="w-48 bg-gray-200 rounded-full h-2 mx-auto">
              <div class="bg-indigo-500 h-2 rounded-full transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Files Preview -->
      <div v-if="selectedFiles.length > 0" class="space-y-3">
        <h4 class="font-medium text-gray-700">Selected Files:</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div v-for="(file, idx) in selectedFiles" :key="idx" 
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border">
            <div class="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="font-medium text-gray-900 truncate">{{ file.name }}</p>
              <p class="text-sm text-gray-500">{{ formatFileSize(file.size) }}</p>
            </div>
            <button @click="removeSelectedFile(idx)" 
              class="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-colors duration-200">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <button @click="uploadImages" :disabled="isUploading || selectedFiles.length === 0"
          class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <svg v-if="!isUploading" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {{ isUploading ? `Uploading... ${uploadProgress}%` : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}` }}
        </button>
      </div>
    </div>

    <!-- Current Header Images -->
    <div v-if="headerImages.length > 0" class="space-y-4">
      <div class="flex items-center justify-between">
        <h4 class="font-semibold text-gray-700 flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Current Header Images ({{ headerImages.length }})
        </h4>
        <button @click="showDeleteAllConfirmation = true" 
          v-if="headerImages.length > 1"
          class="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-lg hover:bg-red-50 transition-colors duration-200">
          Delete All
        </button>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div v-for="(img, idx) in headerImages" :key="idx" 
          class="relative group rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <img :src="img" 
            :alt="`Header image ${idx + 1}`"
            class="w-full h-32 object-cover" 
            @load="onImageLoad"
            @error="onImageError(idx)"
          />
          
          <!-- Image Overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
              <button @click="viewImage(img)" 
                class="p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button @click="confirmDeleteImage(idx)" 
                class="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Image Index Badge -->
          <div class="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
            {{ idx + 1 }}
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 space-y-4">
      <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
        <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <div>
        <h4 class="text-lg font-medium text-gray-700">No header images yet</h4>
        <p class="text-gray-500">Upload your first header image to get started</p>
      </div>
    </div>

    <!-- Image Viewer Modal -->
    <teleport to="body">
      <div v-if="selectedImageForView"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        @click.self="selectedImageForView = null">
        <div class="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl">
          <img :src="selectedImageForView" 
            class="max-w-full max-h-full object-contain" 
            alt="Header image preview" />
          <button @click="selectedImageForView = null"
            class="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors duration-200">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </teleport>

    <!-- Delete Confirmation Modal -->
    <teleport to="body">
      <div v-if="imageToDelete !== null || showDeleteAllConfirmation"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click.self="cancelDelete">
        <div class="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
          <div class="p-6 text-center space-y-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ showDeleteAllConfirmation ? 'Delete All Images?' : 'Delete Image?' }}
            </h3>
            <p class="text-gray-600">
              {{ showDeleteAllConfirmation 
                ? `Are you sure you want to delete all ${headerImages.length} header images? This action cannot be undone.` 
                : 'Are you sure you want to delete this header image? This action cannot be undone.' 
              }}
            </p>
            <div class="flex gap-3 pt-4">
              <button @click="cancelDelete"
                class="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors duration-200">
                Cancel
              </button>
              <button @click="showDeleteAllConfirmation ? deleteAllImages() : deleteImage()" 
                :disabled="isDeletingImage"
                class="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2">
                <svg v-if="isDeletingImage" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {{ isDeletingImage ? 'Deleting...' : 'Delete' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, defineEmits, onMounted } from 'vue';
import {
  addHeaderImages,
  getBoutiqueProfile,
  deleteHeaderImage, // ✅ Corrected function name
  deleteAllHeaderImages
} from '@/services/api';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['update:images']);
const toast = useToast();

const headerImages = ref([]);
const selectedFiles = ref([]);
const isDragging = ref(false);
const isUploading = ref(false);
const uploadProgress = ref(0);
const selectedImageForView = ref(null);
const imageToDelete = ref(null); // Stores index to delete
const showDeleteAllConfirmation = ref(false);
const isDeletingImage = ref(false);

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  addFilesToSelection(files);
  event.target.value = ''; // reset
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragging.value = false;
  const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
  addFilesToSelection(files);
};

const addFilesToSelection = (files) => {
  const valid = files.filter(f => {
    if (!f.type.startsWith('image/')) {
      toast.error(`${f.name} is not a valid image`);
      return false;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error(`${f.name} is too large`);
      return false;
    }
    return true;
  });
  selectedFiles.value = [...selectedFiles.value, ...valid];
  if (valid.length) toast.success(`${valid.length} image${valid.length > 1 ? 's' : ''} selected`);
};

const removeSelectedFile = (i) => {
  selectedFiles.value.splice(i, 1);
};

const formatFileSize = (bytes) => {
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${['Bytes', 'KB', 'MB', 'GB'][i]}`;
};

const uploadImages = async () => {
  if (!selectedFiles.value.length) return;
  isUploading.value = true;
  uploadProgress.value = 0;
  const timer = setInterval(() => {
    if (uploadProgress.value < 90) uploadProgress.value += 10;
  }, 200);
  try {
    await addHeaderImages(selectedFiles.value);
    clearInterval(timer);
    uploadProgress.value = 100;
    toast.success(`Uploaded ${selectedFiles.value.length} image(s)`);
    await refreshImages();
    selectedFiles.value = [];
  } catch (err) {
    toast.error('Failed to upload');
    console.error(err);
  } finally {
    clearInterval(timer);
    isUploading.value = false;
    uploadProgress.value = 0;
  }
};

const refreshImages = async () => {
  const res = await getBoutiqueProfile();
  headerImages.value = res?.data?.headerImage || [];
  emit('update:images', headerImages.value);
};

const viewImage = (url) => {
  selectedImageForView.value = url;
};

const confirmDeleteImage = (idx) => {
  imageToDelete.value = idx;
};

const deleteImage = async () => {
  if (imageToDelete.value == null) return;
  const imageUrl = headerImages.value[imageToDelete.value];
  isDeletingImage.value = true;
  try {
    await deleteHeaderImage({ imageUrl }); // ✅ Pass correct data shape
    toast.success('Deleted image');
    await refreshImages();
  } catch (err) {
    toast.error('Delete failed');
    console.error(err);
  } finally {
    isDeletingImage.value = false;
    imageToDelete.value = null;
  }
};

const deleteAllImages = async () => {
  isDeletingImage.value = true;
  try {
    await deleteAllHeaderImages();
    toast.success('All images deleted');
    headerImages.value = [];
    emit('update:images', []);
  } catch (err) {
    toast.error('Delete all failed');
    console.error(err);
  } finally {
    isDeletingImage.value = false;
    showDeleteAllConfirmation.value = false;
  }
};

const cancelDelete = () => {
  imageToDelete.value = null;
  showDeleteAllConfirmation.value = false;
};

const onImageLoad = () => { };
const onImageError = (index) => {
  toast.error(`Image ${index + 1} failed to load`);
};

onMounted(refreshImages);
</script>
