import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { registerSW } from 'virtual:pwa-register';

import App from './App.vue';
import router from './router';
import './assets/css/global.css';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl, registration) {
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 60 * 1000);
    }
  },
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');
