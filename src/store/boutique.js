import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useBoutiqueStore = defineStore('boutique', () => {
  const boutiqueName = ref('');

  const updateBoutiqueName = (name) => {
    boutiqueName.value = name;
  };

  return {
    boutiqueName,
    updateBoutiqueName,
  };
});
