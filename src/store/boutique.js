import { defineStore } from "pinia";

export const useBoutiqueStore = defineStore("boutique", {
  state: () => ({
    boutiqueName: "Chic Couture", // Default name
  }),
  actions: {
    updateBoutiqueName(newName) {
      this.boutiqueName = newName;
    },
  },
});
