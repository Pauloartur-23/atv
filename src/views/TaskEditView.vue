<template>
  <div class="edit-container">
    <h1 class="edit-title">Editar atividade</h1>

    <div v-if="!task && !loading" class="not-found">
      <p>Tarefa não encontrada.</p>
      <router-link to="/">Voltar para o início</router-link>
    </div>

    <p v-else-if="!task" class="loading-message">Carregando tarefa...</p>

    <TaskForm
      v-else
      :editing-task="task"
      @update="handleUpdate"
      @cancel="handleCancel"
    />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TaskForm from '../components/TaskForm.vue';
import { useTasksStore } from '../stores/tasks';

const route = useRoute();
const router = useRouter();
const store = useTasksStore();
const loading = ref(true);

const taskId = Number(route.params.id);

const task = computed(() => store.tasks.find((t) => t.id === taskId));

onMounted(async () => {
  if (store.tasks.length === 0) {
    await store.fetchTasks();
  }
  loading.value = false;
});

async function handleUpdate(id, payload) {
  await store.updateTask(id, payload);
  if (!store.error) {
    router.push('/');
  }
}

function handleCancel() {
  router.push('/');
}
</script>

<style scoped>
.edit-container {
  max-width: 600px;
  margin: 0 auto;
}

.edit-title {
  font-size: 1.4rem;
  color: #4a90d9;
  margin-bottom: 20px;
}

.not-found {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
  text-align: center;
  color: #666;
}

.not-found a {
  color: #4a90d9;
}

.loading-message {
  color: #666;
  font-size: 0.9rem;
  padding: 8px 0;
}
</style>
