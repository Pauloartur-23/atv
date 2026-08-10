<template>
  <div class="add-container">
    <h1 class="add-title">Nova atividade</h1>
    <TaskForm @add="handleAdd" />
    <button type="button" class="back-button" @click="router.push('/')">
      Voltar
    </button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import TaskForm from '../components/TaskForm.vue';
import { useTasksStore } from '../stores/tasks';

const router = useRouter();
const store = useTasksStore();

async function handleAdd(payload) {
  await store.addTask(payload);
  if (!store.error) {
    router.push('/');
  }
}
</script>

<style scoped>
.add-container {
  max-width: 600px;
  margin: 0 auto;
}

.add-title {
  font-size: 1.4rem;
  color: #4a90d9;
  margin-bottom: 20px;
}

.back-button {
  padding: 10px 20px;
  margin-top: 8px;
  background: transparent;
  border: 2px solid #ddd;
  color: #666;
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.back-button:hover {
  border-color: #4a90d9;
  color: #4a90d9;
}
</style>
