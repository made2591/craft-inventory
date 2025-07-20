import axios from 'axios';

// Crea un'istanza di axios con la configurazione di base
const api = axios.create({
  baseURL: '',  // Usa URL relativo per funzionare con il proxy di Vite
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per gestire gli errori
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default api;