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

export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (formData) => {
    const token = sessionStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/api/users/profile`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getUsers: () => api.get('/api/users'),
  getAllOrganizers: () => api.get('/api/users?role=organizer'),
  verifyOrganizer: (id, statusData) => api.post(`/api/users/${id}/verify`, statusData),
  getUserById: (id) => api.get(`/api/users/${id}`), 
};

export const eventAPI = {
  getEvents: () => api.get('/api/events'),
  getEvent: (id) => api.get(`/api/event/${id}`),
  getEventsPopular: () => api.get('/api/events/popular'),
  getMyEvents: () => api.get('/api/events/my-events'),
  createEvent: (formData) => {
    const token = sessionStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/api/events`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getPendingEvents: () => api.get('/api/events/all'), 
  updateEvent: (id, updateData) => api.put(`/api/events/${id}`, updateData),
  deleteEvent: (id) => api.delete(`/api/events/${id}`),
  verifyEvent: (id, statusData) => api.patch(`/api/events/${id}/verify`, statusData),
};

export const cartAPI = {
  addToCart: (cartData) => api.post('/api/cart', cartData),
  getCart: () => api.get('/api/cart'),
  updateCart: (updateData) => api.patch('/api/cart', updateData),
  deleteCart: (deleteData) => api.delete('/api/cart', { data: deleteData }),
};

export default api;