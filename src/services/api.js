import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.vellera.app/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically append Auth tokens if stored in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vellera_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const velleraApi = {
  // Upload and track user biometric health logs
  logBiometrics: async (data) => {
    const response = await api.post('/biometrics', data);
    return response.data;
  },

  // Save a brand new custom workout split
  createWorkout: async (workout) => {
    const response = await api.post('/workouts', workout);
    return response.data;
  },

  // Request external medical/doctor dashboard sync
  syncWithDoctor: async (providerId) => {
    const response = await api.post('/medical/sync', { providerId });
    return response.data;
  }
};
