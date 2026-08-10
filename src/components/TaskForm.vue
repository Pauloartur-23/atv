<template>
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="task-row">
      <input
        v-model="newTask"
        type="text"
        placeholder="Nova tarefa..."
        class="task-input"
      />
      <button type="submit" class="task-button" :disabled="uploading">
        {{ editingTask ? 'Alterar' : 'Adicionar' }}
      </button>
      <button
        v-if="editingTask"
        type="button"
        class="task-button-cancel"
        @click="handleCancel"
      >
        Cancelar
      </button>
    </div>

    <div class="priority-row">
      <label for="task-priority">Prioridade</label>
      <select id="task-priority" v-model="priority" class="priority-select">
        <option value="baixa">Baixa</option>
        <option value="normal">Normal</option>
        <option value="alta">Alta</option>
      </select>
    </div>

    <div class="location-section">
      <button
        type="button"
        class="task-button-secondary"
        :disabled="locating"
        @click="captureLocation"
      >
        {{ locating ? 'Buscando localização...' : 'Adicionar localização' }}
      </button>
      <span
        v-if="latitude !== null && longitude !== null"
        class="location-status"
      >
        Localização adicionada
      </span>
      <span v-if="locationError" class="location-error">{{ locationError }}</span>
      <button
        v-if="latitude !== null && longitude !== null"
        type="button"
        class="task-button-secondary danger"
        @click="clearLocation"
      >
        Remover localização
      </button>
    </div>

    <div class="image-section">
      <img
        v-if="(previewUrl || editingTask?.img_url) && !removeImage"
        :src="previewUrl || editingTask?.img_url"
        class="image-preview"
        alt="Imagem da tarefa"
      />
      <label
        v-if="!showCameraCapture"
        class="image-label"
        :class="{ disabled: uploading }"
      >
        <span v-if="uploading" class="upload-status">Enviando...</span>
        <span v-else>
          {{
            previewUrl || editingTask?.img_url
              ? 'Trocar imagem'
              : isMobileDevice
                ? 'Fotografar'
                : 'Adicionar imagem'
          }}
        </span>
        <input
          type="file"
          :capture="cameraMode"
          accept="image/jpeg,image/png"
          class="image-input"
          :disabled="uploading"
          @change="handleImageChange"
        />
      </label>

      <button
        v-if="!previewUrl && !showCameraCapture"
        type="button"
        class="task-button-secondary"
        @click="toggleCamera"
      >
        {{ cameraMode === 'environment' ? 'Usar selfie' : 'Usar traseira' }}
      </button>

      <button
        v-if="editingTask?.img_url && !previewUrl && !removeImage"
        type="button"
        class="task-button-secondary danger"
        @click="removeImage = true"
      >
        Remover imagem
      </button>
      <button
        v-if="removeImage"
        type="button"
        class="task-button-secondary"
        @click="removeImage = false"
      >
        Cancelar remoção
      </button>

      <button
        type="button"
        class="task-button-secondary"
        @click="showCameraCapture = !showCameraCapture"
      >
        {{ showCameraCapture ? 'Fechar câmera' : 'Abrir preview ao vivo' }}
      </button>

      <CameraCapture
        v-if="showCameraCapture"
        @captured="handleCameraCapture"
      />

      <p v-if="!hasCamera" class="camera-warning">
        Câmera não detectada. Você pode selecionar um arquivo manualmente.
      </p>
      <p v-if="uploadError" class="upload-error">{{ uploadError }}</p>
      <p class="image-help">
        Em celular, o botão pode abrir a câmera.
        Em notebook, abre o seletor de arquivos.
      </p>
    </div>
  </form>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import tasksApi from '../api/tasksApi.js';
import CameraCapture from './CameraCapture.vue';

const props = defineProps({
  editingTask: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['add', 'update', 'cancel']);
const newTask = ref('');
const priority = ref('normal');
const previewUrl = ref(null);
const imgAttachmentKey = ref(null);
const uploading = ref(false);
const removeImage = ref(false);
const cameraMode = ref('environment');
const hasCamera = ref(false);
const showCameraCapture = ref(false);
const uploadError = ref(null);
const latitude = ref(null);
const longitude = ref(null);
const locating = ref(false);
const locationError = ref(null);
const isMobileDevice = ref(
  /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ),
);

const MAX_SIZE_MB = 5;

watch(
  () => props.editingTask,
  (task) => {
    newTask.value = task ? task.title : '';
    priority.value = task?.priority || 'normal';
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
    imgAttachmentKey.value = null;
    removeImage.value = false;
    uploadError.value = null;
    latitude.value = null;
    longitude.value = null;
    locationError.value = null;
  },
  { immediate: true },
);

onMounted(async () => {
  hasCamera.value = await checkCameraSupport();
});

function captureLocation() {
  if (!('geolocation' in navigator)) {
    locationError.value = 'Geolocalização não suportada neste navegador.';
    return;
  }
  locating.value = true;
  locationError.value = null;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      latitude.value = position.coords.latitude;
      longitude.value = position.coords.longitude;
      locating.value = false;
    },
    (err) => {
      locating.value = false;
      latitude.value = null;
      longitude.value = null;
      locationError.value =
        err.code === err.PERMISSION_DENIED
          ? 'Permissão de localização negada.'
          : 'Não foi possível obter a localização.';
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
  );
}

function clearLocation() {
  latitude.value = null;
  longitude.value = null;
  locationError.value = null;
}

async function checkCameraSupport() {
  if (!navigator.mediaDevices?.enumerateDevices) return false;
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.some((d) => d.kind === 'videoinput');
  } catch {
    return false;
  }
}

function toggleCamera() {
  cameraMode.value =
    cameraMode.value === 'environment' ? 'user' : 'environment';
}

async function handleImageChange(event) {
  const file = event.target.files[0];
  if (!file) return;

  uploadError.value = null;

  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    uploadError.value = `O arquivo excede o limite de ${MAX_SIZE_MB} MB.`;
    event.target.value = '';
    return;
  }

  captureLocation();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
  removeImage.value = false;
  await uploadImage(file);
}

async function handleCameraCapture(file) {
  if (!file) return;
  uploadError.value = null;
  captureLocation();
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = URL.createObjectURL(file);
  removeImage.value = false;
  await uploadImage(file);
}

async function uploadImage(file) {
  uploading.value = true;
  try {
    const response = await tasksApi.uploadImage(file);
    imgAttachmentKey.value = response.data.attachment_key;
  } catch (err) {
    console.error('Erro ao fazer upload da imagem', err);
    previewUrl.value = null;
    imgAttachmentKey.value = null;
  } finally {
    uploading.value = false;
  }
}

function handleSubmit() {
  if (!newTask.value.trim()) return;

  const payload = {
    title: newTask.value.trim(),
    priority: priority.value,
    imgAttachmentKey: imgAttachmentKey.value,
    removeImage: removeImage.value,
    latitude: latitude.value,
    longitude: longitude.value,
  };

  if (props.editingTask) {
    emit('update', props.editingTask.id, payload);
  } else {
    emit('add', payload);
  }

  resetForm();
}

function resetForm() {
  newTask.value = '';
  priority.value = 'normal';
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;
  imgAttachmentKey.value = null;
  removeImage.value = false;
  uploadError.value = null;
  latitude.value = null;
  longitude.value = null;
  locationError.value = null;
}

function handleCancel() {
  resetForm();
  emit('cancel');
}
</script>

<style scoped>
.task-form {
  margin-bottom: 24px;
}

.task-row {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.task-input {
  flex: 1;
  padding: 12px;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
}

.task-input:focus {
  border-color: #4a90d9;
}

.priority-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.priority-row label {
  font-size: 0.875rem;
  color: #666;
}

.priority-select {
  padding: 8px 10px;
  border: 2px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  outline: none;
}

.priority-select:focus {
  border-color: #4a90d9;
}

.task-button {
  padding: 12px 20px;
  background-color: #4a90d9;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.task-button:hover:not(:disabled) {
  background-color: #357abd;
}

.task-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.task-button-cancel {
  padding: 12px 16px;
  background-color: transparent;
  color: #666;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.task-button-cancel:hover {
  border-color: #aaa;
}

.location-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.location-status {
  font-size: 0.875rem;
  color: #27ae60;
}

.location-error {
  font-size: 0.875rem;
  color: #c0392b;
}

.image-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #ccc;
}

.image-preview {
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  flex-shrink: 0;
}

.image-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #4a90d9;
  color: #4a90d9;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-label:hover:not(.disabled) {
  background: #eaf2fb;
}

.image-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-input {
  display: none;
}

.task-button-secondary {
  padding: 8px 14px;
  background: white;
  border: 1.5px solid #ccc;
  color: #555;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.task-button-secondary:hover {
  border-color: #4a90d9;
  color: #4a90d9;
}

.task-button-secondary.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.upload-status {
  color: #888;
}

.camera-warning {
  font-size: 0.75rem;
  color: #e67e22;
  margin: 0;
  flex-basis: 100%;
}

.upload-error {
  font-size: 0.8rem;
  color: #c0392b;
  margin: 0;
  flex-basis: 100%;
}

.image-help {
  font-size: 0.75rem;
  color: #999;
  margin: 0;
  flex-basis: 100%;
}
</style>
