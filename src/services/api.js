import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (formData) => {
    return axios.post(`${API_BASE_URL}/api/auth/register`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  login: (loginData) => api.post('/api/auth/login', loginData),
};

export const eventAPI = {
  getEvents: () => api.get('/api/events'),
  getEvent: (id) => api.get(`/api/event/${id}`),
};

export default api;