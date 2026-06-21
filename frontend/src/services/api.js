import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const authService = {
  register: (username, email, password) =>
    api.post('/auth/register', { username, email, password }),
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
};

// Posts
export const postService = {
  getAll: (status = 'published', limit = 10, offset = 0) =>
    api.get('/posts', { params: { status, limit, offset } }),
  getById: (id) =>
    api.get(`/posts/${id}`),
  create: (data) =>
    api.post('/posts', data),
  update: (id, data) =>
    api.put(`/posts/${id}`, data),
  delete: (id) =>
    api.delete(`/posts/${id}`),
};

// Categories
export const categoryService = {
  getAll: () =>
    api.get('/categories'),
  create: (name, description) =>
    api.post('/categories', { name, description }),
};

// Tags
export const tagService = {
  getAll: () =>
    api.get('/tags'),
  create: (name) =>
    api.post('/tags', { name }),
};

// Comments
export const commentService = {
  getByPostId: (postId) =>
    api.get(`/posts/${postId}/comments`),
  create: (postId, author_name, author_email, content) =>
    api.post(`/posts/${postId}/comments`, { author_name, author_email, content }),
  approve: (commentId) =>
    api.put(`/comments/${commentId}/approve`),
};

export default api;
