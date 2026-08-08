<template>
  <header class="app-header">
    <div class="header-top">
      <h1>Meus gestor de Tarefas!!!!</h1>
      <nav>
        <router-link to="/">Início</router-link>
        <router-link to="/about">Sobre</router-link>
        <button
          v-if="notificationCount > 0"
          class="notification-badge"
          title="Notificações não lidas"
          @click="$emit('clear-notifications')"
        >
          {{ notificationCount }}
        </button>
        <span v-if="authStore.userEmail" class="user-email">{{
          authStore.userEmail
        }}</span>
        <button
          v-if="authStore.isAuthenticated"
          class="logout-btn"
          title="Sair da conta"
          @click="handleLogout"
        >
          Sair
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

defineProps({
  notificationCount: {
    type: Number,
    default: 0,
  },
});

defineEmits(['clear-notifications']);

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style scoped>
.app-header {
  padding: 16px 0;
  border-bottom: 2px solid #4a90d9;
  margin-bottom: 24px;
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.app-header h1 {
  font-size: 1.4rem;
  color: #4a90d9;
}

nav {
  display: flex;
  gap: 16px;
  align-items: center;
}

nav a {
  text-decoration: none;
  color: #666;
  font-weight: 500;
  font-size: 0.9rem;
}

nav a.router-link-active {
  color: #4a90d9;
}

.user-email {
  font-size: 0.8rem;
  color: #666;
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  background: none;
  border: none;
  color: #c0392b;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 4px 6px;
}

.logout-btn:hover {
  text-decoration: underline;
}

.notification-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e74c3c;
  color: white;
  border: none;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.notification-badge:hover {
  background: #c0392b;
}
</style>
