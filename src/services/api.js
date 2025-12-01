import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://tikeria-backend-921069173562.asia-southeast1.run.app';

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
  getApprovedEvents: () => api.get('/api/events?status=approved'),
  getEvent: (id) => api.get(`/api/event/${id}`),
  getEventsPopular: () => api.get('/api/events/popular'),
  getEventsBestSelling: () => api.get('/api/events?status=approved&sort=best_selling'),
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
   updateEvent: (id, formData) => {
    const token = sessionStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/api/events/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteEvent: (id) => api.delete(`/api/events/${id}`),
  verifyEvent: (id, statusData) => api.patch(`/api/events/${id}/verify`, statusData),
  getEventReport: (eventId) => api.get(`/api/events/${eventId}/report`),
  downloadEventReport: (eventId) => {
    return api.get(`/api/events/${eventId}/report/download`, {
      responseType: 'blob'
    });
  },
  likeEvent: (eventId) => api.post(`/api/events/${eventId}/like`),
  getMyLikedEvents: () => api.get('/api/events/like'),
  getEventCategories: () => api.get('/api/events/category'),
  addEventCategory: (categoryData) => api.post('/api/events/category/new', categoryData),
  addSubEventCategory: (subCategoryData) => api.post('/api/events/category/new/sub', subCategoryData),
  deleteCategoryEvent: (categoryData) => api.delete('/api/events/category/delete', { data: categoryData }),
  deleteSubCategoryEvent: (subCategoryData) => api.delete('/api/events/category/delete/sub', { data: subCategoryData }),
};

export const cartAPI = {
  addToCart: (cartData) => api.post('/api/cart', cartData),
  getCart: () => api.get('/api/cart'),
  updateCart: (updateData) => api.patch('/api/cart', updateData),
  deleteCart: (deleteData) => api.delete('/api/cart', { data: deleteData }),
};

export const paymentAPI = {
  createPayment: () => api.post('/api/payment/midtrans'),
};

export const ticketAPI = {
  getTickets: (status = '') => {
    const params = status && status !== 'all' ? `?status=${status}` : '';
    return api.get(`/api/tickets${params}`);
  },
  getTicketStats: () => api.get('/api/tickets/stats'),
  getTicketCode: (ticketId) => api.get(`/api/tickets/${ticketId}/code`),
  checkInTicket: (eventId, ticketCode) => api.patch(`/api/tickets/${eventId}/${ticketCode}/checkin`),
  updateTagTicket: (ticketId, tagData) => api.patch(`/api/tickets/${ticketId}/tag`, tagData),
};

// Transaction API
export const transactionAPI = {
  getTransactionHistory: () => api.get('/api/transactions'),
  getTransactionDetail: (transactionId) => api.get(`/api/transactions/${transactionId}`),
};

//FeedbackAPI
export const feedbackAPI = {
  getAllFeedback: () => api.get('/api/feedback/all'),
  createFeedback: (formData) => {
    const token = sessionStorage.getItem('token');
    return axios.post(`${API_BASE_URL}/api/feedback/`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateFeedbackStatus: (id,formData) => {
    const token = sessionStorage.getItem('token');
    return axios.put(`${API_BASE_URL}/api/feedback/detail/${id}/status`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  },
  getMyFeedback: () => api.get('/api/feedback/mine'),
  
};

export default api;