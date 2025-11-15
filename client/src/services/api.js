import axios from 'axios';

// Use relative path in production, localhost in development
const API_URL = process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5000/api');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const questionnaireAPI = {
  getAll: () => api.get('/questionnaires'),
  getById: (id) => api.get(`/questionnaires/${id}`),
  create: (data) => api.post('/questionnaires', data),
  update: (id, data) => api.put(`/questionnaires/${id}`, data),
  delete: (id) => api.delete(`/questionnaires/${id}`),
  saveComplete: (questionnaire) => api.post('/questionnaires/save-complete', { questionnaire }),
};

export const responseAPI = {
  create: (data) => api.post('/responses', data),
  getBySession: (sessionId) => api.get(`/responses/session/${sessionId}`),
  deleteBySession: (sessionId) => api.delete(`/responses/session/${sessionId}`),
};

export default api;
