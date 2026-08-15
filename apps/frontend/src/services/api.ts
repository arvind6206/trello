import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  signup: (username: string, password: string) =>
    api.post('/user/signup', { username, password }),
  login: (username: string, password: string) =>
    api.post('/user/login', { username, password }),
  getMe: () => api.get('/user/me'),
};

export const orgAPI = {
  create: (orgname: string, description?: string) =>
    api.post('/org/create', { orgname, description }),
  getAll: () => api.get('/org'),
  getSingle: (orgId: string) => api.get(`/org/${orgId}`),
  update: (orgId: string, orgname?: string, description?: string) =>
    api.put(`/org/${orgId}`, { orgname, description }),
  delete: (orgId: string) => api.delete(`/org/${orgId}`),
};

export const boardAPI = {
  getByOrg: (orgId: string) => api.get(`/board/org/${orgId}`),
  getSingle: (boardId: string) => api.get(`/board/${boardId}`),
  create: (orgId: string, title: string) =>
    api.post(`/board/org/${orgId}`, { title }),
  update: (boardId: string, title: string) =>
    api.patch(`/board/${boardId}`, { title }),
  delete: (boardId: string) => api.delete(`/board/${boardId}`),
};

export const sectionAPI = {
  getByBoard: (boardId: string) => api.get(`/section/board/${boardId}`),
  getSingle: (sectionId: string) => api.get(`/section/${sectionId}`),
  create: (boardId: string, title: string) =>
    api.post(`/section/board/${boardId}`, { title }),
  update: (sectionId: string, title: string) =>
    api.patch(`/section/${sectionId}`, { title }),
  delete: (sectionId: string) => api.delete(`/section/${sectionId}`),
};

export const issueAPI = {
  getByBoard: (boardId: string) => api.get(`/issue/board/${boardId}`),
  getSingle: (issueId: string) => api.get(`/issue/${issueId}`),
  create: (title: string, description: string, boardId: string, sectionId: string) =>
    api.post('/issue/add', { title, description, boardId, sectionId }),
  update: (issueId: string, title?: string, description?: string) =>
    api.put('/', { issueId, title, description }),
  delete: (issueId: string) => api.delete(`/issue/${issueId}`),
};

export default api;
