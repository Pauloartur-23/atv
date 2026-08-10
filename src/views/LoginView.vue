<template>
  <div class="register-container">
    <form class="register-form" @submit.prevent="handleLogin">
      <h1>Entrar</h1>

      <div v-if="isRegistered" class="success-message">
        Conta criada com sucesso! Faça login para continuar.
      </div>
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="field">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="seu@email.com"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label for="password">Senha</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="current-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Entrando...' : 'Entrar' }}
      </button>

      <p class="register-link">
        Não tem uma conta?
        <router-link to="/register">Criar conta</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const isRegistered = ref(route.query.registered === 'true');

onMounted(() => {
  const msg = sessionStorage.getItem('auth_message');
  if (msg) {
    errorMessage.value = msg;
    sessionStorage.removeItem('auth_message');
  }
});

async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  try {
    await authStore.login(email.value, password.value);
    router.push('/');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ??
      'Erro ao entrar. Verifique suas credenciais.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  padding: 32px 0;
}

.register-form {
  width: 100%;
  max-width: 380px;
}

.register-form h1 {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #4a90d9;
  margin-bottom: 22px;
}

.success-message {
  color: #1e7f4f;
  background-color: #eafaf1;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 0.85rem;
}

.error-message {
  color: #d43d2a;
  background-color: #fdf0ee;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
  font-size: 0.85rem;
}

.field {
  margin-bottom: 16px;
}

.field label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #999;
  margin-bottom: 8px;
}

.field input {
  width: 100%;
  padding: 10px 0;
  border: none;
  border-bottom: 2px solid #ddd;
  border-radius: 0;
  background: transparent;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-bottom-color: #4a90d9;
}

button[type='submit'] {
  width: 100%;
  padding: 12px;
  margin-top: 6px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #357abd;
}

button[type='submit']:active:not(:disabled) {
  transform: scale(0.98);
}

button[type='submit']:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.register-link {
  margin-top: 16px;
  text-align: center;
  font-size: 0.85rem;
  color: #888;
}

.register-link a {
  color: #4a90d9;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
