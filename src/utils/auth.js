// src/utils/auth.js

export const getValidatedBoutiqueId = (router, toast) => {
  const boutiqueId = localStorage.getItem('boutiqueId');

  if (!boutiqueId) {
    toast?.error?.("Session expired. Please log in again.");
    router?.push?.({ name: 'login' });
    throw new Error("Missing boutiqueId from localStorage");
  }

  return boutiqueId;
};
