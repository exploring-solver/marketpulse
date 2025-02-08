import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  uploadExcel: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/upload/excel', formData);
    return response.data;
  },
  getSummary: async () => {
    const response = await api.get('/api/upload/summary');
    return response.data;
  }
};

export const analyticsService = {
  getAnalytics: async (startDate, endDate) => {
    const response = await api.get('/api/analytics', {
      params: { startDate, endDate }
    });
    return response.data;
  }
};

export const campaignService = {
  getCampaigns: async () => {
    const response = await api.get('/api/campaigns');
    return response.data;
  },
  createCampaign: async (campaignData) => {
    const response = await api.post('/api/campaigns', campaignData);
    return response.data;
  },
  updateCampaign: async (id, updates) => {
    const response = await api.patch(`/api/campaigns/${id}`, updates);
    return response.data;
  },
  deleteCampaign: async (id) => {
    const response = await api.delete(`/api/campaigns/${id}`);
    return response.data;
  }
};

export default api; 