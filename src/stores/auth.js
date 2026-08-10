import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import authApi from '../api/authApi.js';
import { usePushNotifications } from '../composables/usePushNotifications.js';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token'));
  const refreshToken = ref(localStorage.getItem('refresh_token'));

  const isAuthenticated = computed(() => !!accessToken.value);

  const userEmail = computed(() => {
    if (!accessToken.value) return null;
    try {
      const payload = JSON.parse(atob(accessToken.value.split('.')[1]));
      return payload.sub ?? null;
    } catch {
      return null;
    }
  });

  const { requestPermission, subscribe, unsubscribe } =
    usePushNotifications();

  async function login(email, password) {
    const { data } = await authApi.login(email, password);
    accessToken.value = data.access_token;
    refreshToken.value = data.refresh_token;
    localStorage.setItem('access_token', data.access_token);
    localStorage.setItem('refresh_token', data.refresh_token);

    if (
      'serviceWorker' in navigator &&
      'Notification' in window &&
      Notification.permission === 'granted'
    ) {
      navigator.serviceWorker.ready
        .then((reg) => subscribe(reg))
        .catch(() => {});
    }
  }

  async function logout() {
    await unsubscribe();
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  return {
    accessToken,
    refreshToken,
    isAuthenticated,
    userEmail,
    login,
    logout,
    requestPermission,
    subscribe,
  };
});
