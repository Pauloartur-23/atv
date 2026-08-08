import apiClient from './config.js';

export default {
  login(email, password) {
    return apiClient.post('/api/token', { email, password });
  },
};
