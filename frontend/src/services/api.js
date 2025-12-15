import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  uploadAvatar: (formData) => api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProfile: () => api.get('/users/profile'),
};

export const cropAPI = {
  getAll: (page = 1, search = '', category = '') => {
    let url = `/crops?page=${page}&limit=9`;
    
    if (search && search.trim() !== '') {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    
    if (category && category !== 'all' && category !== '') {
      url += `&category=${category}`;
    }
    
    return api.get(url);
  },
  addCrop: (formData) => api.post('/crops', formData),
  // If you have update/delete
  // updateCrop: (id, formData) => api.put(`/crops/${id}`, formData),
  // deleteCrop: (id) => api.delete(`/crops/${id}`),
};

export const orderAPI = {
  placeOrder: (data) => api.post('/orders', data),
  getMyOrders: (page = 1) => api.get(`/orders/my?page=${page}&limit=10`),
};


export default api;