import api from './api';

export const login = async (username: string, password: string) => {
  const response = await api.post('/api/auth/login', { username, password });
  const { token, refresh_token } = response.data;
  localStorage.setItem('token', token);
  if (refresh_token) localStorage.setItem('refresh_token', refresh_token);
  localStorage.setItem('username', username);
  return response.data;
};

export const register = async (data: { usu_username: string; usu_password: string; usu_email?: string }) => {
  return api.post('/api/auth/register', data);
};

export const changePassword = async (current_password: string, new_password: string) => {
  return api.put('/api/auth/change-password', { current_password, new_password });
};

export const getMe = async () => {
  return api.get('/api/auth/me');
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  try {
    if (refreshToken) {
      await api.post('/api/auth/logout', { refresh_token: refreshToken });
    }
  } catch { /* Silencioso */ }
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
};
