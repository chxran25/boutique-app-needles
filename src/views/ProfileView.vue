<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 pb-24">
    <div class="max-w-4xl mx-auto p-6 space-y-10">
      <ProfileHeaderImage @update:images="headerImages = $event" />
      <ProfileCard 
        :phoneNumber="phoneNumber" 
        @change-password="showPasswordModal = true" 
        @change-phone="showPhoneModal = true" 
      />
    </div>

    <!-- 🔐 Change Password Modal -->
    <teleport to="body">
      <div v-if="showPasswordModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
        @click.self="showPasswordModal = false">
        <div
          class="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden transform transition-all duration-300 scale-100">
          <!-- Password modal content remains unchanged -->
        </div>
      </div>
    </teleport>

    <!-- 📱 Change Phone Modal -->
    <ChangePhoneModal 
      v-if="showPhoneModal" 
      @close="showPhoneModal = false"
      @phone-updated="handlePhoneUpdate"
    />

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { changePassword } from '@/services/api';
import { useToast } from 'vue-toastification';
import ProfileHeaderImage from '@/components/ProfileHeaderImage.vue';
import ProfileCard from '@/components/ProfileCard.vue';
import ChangePhoneModal from '@/components/ChangePhoneModal.vue';

const passwords = ref({ oldPassword: '', newPassword: '', confirmPassword: '' });
const showPasswordModal = ref(false);
const showPhoneModal = ref(false);
const phoneNumber = ref('');
const isChangingPassword = ref(false);
const showOldPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const toast = useToast();

const isPasswordFormValid = computed(() => {
  const { oldPassword, newPassword, confirmPassword } = passwords.value;
  return oldPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 6;
});

const changePasswordHandler = async () => {
  const { oldPassword, newPassword, confirmPassword } = passwords.value;

  if (newPassword !== confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  if (newPassword.length < 6) {
    toast.error('Password must be at least 6 characters long');
    return;
  }

  isChangingPassword.value = true;

  try {
    await changePassword({ oldPassword, newPassword });
    toast.success('Password updated successfully');
    passwords.value = { oldPassword: '', newPassword: '', confirmPassword: '' };
    showPasswordModal.value = false;
  } catch (error) {
    toast.error(error.response?.data?.message || 'Failed to update password');
  } finally {
    isChangingPassword.value = false;
  }
};

const handlePhoneUpdate = (updatedPhone) => {
  phoneNumber.value = updatedPhone;
};
</script>