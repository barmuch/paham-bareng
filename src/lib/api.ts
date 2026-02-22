import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Intercept responses to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Don't redirect if already on auth page
        if (!window.location.pathname.startsWith('/auth')) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH ============
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post('/auth?action=register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth?action=login', data),
  getMe: () => api.get('/auth'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  updatePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/auth/password', data),
};

// ============ ROADMAPS ============
export const roadmapsAPI = {
  getAll: (params?: any) => api.get('/roadmaps', { params }),
  getBySlug: (slug: string) => api.get(`/roadmaps/${slug}`),
  getCategories: () => api.get('/roadmaps/categories'),
  like: (id: string) => api.post(`/roadmaps/${id}/like`),
};

// ============ PROGRESS ============
export const progressAPI = {
  getAll: () => api.get('/progress'),
  getByRoadmap: (roadmapId: string) => api.get(`/progress/${roadmapId}`),
  updateNode: (roadmapId: string, nodeId: string, data: any) =>
    api.put(`/progress/${roadmapId}?nodeId=${nodeId}`, data),
  getStats: () => api.get('/progress?stats=overview'),
};

// ============ PROJECTS ============
export const projectsAPI = {
  getAll: (params?: any) => api.get('/projects', { params }),
  getBySlug: (slug: string) => api.get(`/projects/${slug}`),
  toggleComplete: (id: string) => api.post(`/projects/${id}/complete`),
};

// ============ TEAMS ============
export const teamsAPI = {
  getAll: () => api.get('/teams'),
  getById: (id: string) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  update: (id: string, data: any) => api.put(`/teams/${id}`, data),
  join: (inviteCode: string) => api.post(`/teams?action=join&code=${inviteCode}`),
  assignRoadmap: (id: string, data: any) => api.post(`/teams/${id}/roadmaps`, data),
  getProgress: (id: string) => api.get(`/teams/${id}/progress`),
  removeMember: (id: string, userId: string) => api.delete(`/teams/${id}/members/${userId}`),
};

// ============ ADMIN ============
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  // Roadmaps
  getRoadmaps: (params?: any) => api.get('/admin/roadmaps', { params }),
  getRoadmap: (id: string) => api.get(`/admin/roadmaps/${id}`),
  createRoadmap: (data: any) => api.post('/admin/roadmaps', data),
  updateRoadmap: (id: string, data: any) => api.put(`/admin/roadmaps/${id}`, data),
  updateRoadmapNodes: (id: string, data: any) => api.put(`/admin/roadmaps/${id}?action=nodes`, data),
  deleteRoadmap: (id: string) => api.delete(`/admin/roadmaps/${id}`),
  publishRoadmap: (id: string, isPublished: boolean) =>
    api.put(`/admin/roadmaps/${id}?action=publish`, { isPublished }),
  // Projects
  getProjects: (params?: any) => api.get('/admin/projects', { params }),
  createProject: (data: any) => api.post('/admin/projects', data),
  updateProject: (id: string, data: any) => api.put(`/admin/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/admin/projects/${id}`),
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  // Teams
  getTeams: (params?: any) => api.get('/admin/teams', { params }),
  deleteTeam: (id: string) => api.delete(`/admin/teams/${id}`),
};

// ============ AI ============
export const aiAPI = {
  generateRoadmap: (data: any) => api.post('/ai/chat?action=generate-roadmap', data),
  chat: (data: { message: string; context?: string }) => api.post('/ai/chat', data),
  explainTopic: (data: { topic: string }) => api.post('/ai/explain-topic', data),
  quiz: (data: { topic: string; count?: number }) => api.post('/ai/quiz', data),
};

export default api;
