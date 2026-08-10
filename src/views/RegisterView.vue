<template>
  <div class="register-container">
    <form class="register-form" @submit.prevent="handleRegister">
      <h1>Criar conta</h1>

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
          autocomplete="new-password"
        />
      </div>

      <div class="field">
        <label for="confirm-password">Confirmar senha</label>
        <input
          id="confirm-password"
          v-model="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
          autocomplete="new-password"
        />
      </div>

      <button type="submit" :disabled="loading">
        {{ loading ? 'Cadastrando...' : 'Cadastrar' }}
      </button>

      <p class="register-link">
        Já tem uma conta?
        <router-link to="/login">Entrar</router-link>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import authApi from '@/api/authApi';

const router = useRouter();

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const errorMessage = ref('');

async function handleRegister() {
  errorMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  loading.value = true;
  try {
    await authApi.register(email.value, password.value);
    router.push('/login?registered=true');
  } catch (err) {
    errorMessage.value =
      err.response?.data?.detail ?? 'Erro ao cadastrar. Tente novamente.';
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
