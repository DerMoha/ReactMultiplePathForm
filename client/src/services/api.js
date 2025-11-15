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

// New Form API (conditional forms)
export const formAPI = {
  getAll: () => api.get('/forms'),
  getById: (id) => api.get(`/forms/${id}`),
  create: (data) => api.post('/forms', data),
  update: (id, data) => api.put(`/forms/${id}`, data),
  delete: (id) => api.delete(`/forms/${id}`),
  saveComplete: (form) => api.post('/forms/save-complete', { form }),
};

export const submissionAPI = {
  create: (data) => api.post('/submissions', data),
  getByFormId: (formId) => api.get(`/submissions/form/${formId}`),
  getById: (id) => api.get(`/submissions/${id}`),
  getBySessionId: (sessionId) => api.get(`/submissions/session/${sessionId}`),
  delete: (id) => api.delete(`/submissions/${id}`),
};

export default api;
