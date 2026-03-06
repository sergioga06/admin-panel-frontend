import axios from 'axios';

// Forzamos la URL de la VPS. 
// Asegúrate de que esta IP sea la de tu VPS
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://95.111.225.241:30080';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;