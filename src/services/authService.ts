import { apiClient } from './apiClient';
import type { LoginRequest, LoginResponse } from '@/types';

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};