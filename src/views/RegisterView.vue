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
.register-link {
  margin-top: 16px;
  text-align: center;
  font-size: 0.875rem;
  color: #666;
}

.register-link a {
  color: #4a90d9;
  text-decoration: none;
  font-weight: 600;
}

.register-link a:hover {
  text-decoration: underline;
}

.register-container {
  display: flex;
  justify-content: center;
  padding-top: 24px;
}

.register-form {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.register-form h1 {
  font-size: 1.4rem;
  color: #4a90d9;
  margin-bottom: 20px;
}

.error-message {
  color: #c0392b;
  background-color: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  padding: 10px 14px;
  margin-bottom: 12px;
  font-size: 0.9rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field label {
  font-size: 0.875rem;
  color: #555;
}

.field input {
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.field input:focus {
  border-color: #4a90d9;
}

button[type='submit'] {
  width: 100%;
  padding: 12px;
  margin-top: 8px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button[type='submit']:hover:not(:disabled) {
  background-color: #357abd;
}

button[type='submit']:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
