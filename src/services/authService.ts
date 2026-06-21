import { apiClient } from './apiClient';
import { mockUsers } from './mockData';
import type { LoginRequest, LoginResponse } from '@/types';

// Flip to false once POST /api/auth/login exists on the Spring Boot side.
const USE_MOCK = true;

const MOCK_DELAY_MS = 500;

function mockLogin(payload: LoginRequest): Promise<LoginResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const email = payload.email.trim().toLowerCase();
      const password = payload.password.trim();

      if (!email || !password) {
        reject(new Error('Email and password are required'));
        return;
      }

      // Look up against the mock user list so each seeded account logs in
      // as themselves (and lands on the right portal — HR/Manager/Employee)
      // instead of everyone becoming HR Admin. Password isn't actually
      // checked here since there's no real auth yet; any password works
      // for a known email. Try doremon@work.com to see the Manager portal,
      // or naruto@work.com, or ripudaman@company.com for HR.
      const user = mockUsers.find((u) => u.email.toLowerCase() === email);

      if (!user) {
        reject(new Error('No account found for this email. Try doremon@work.com, naruto@work.com, or ripudaman@company.com.'));
        return;
      }

      resolve({
        token: 'mock-jwt-token',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          jobTitle: user.jobTitle,
        },
      });
    }, MOCK_DELAY_MS);
  });
}

export const authService = {
  async login(payload: LoginRequest): Promise<LoginResponse> {
    if (USE_MOCK) return mockLogin(payload);

    // Expected real contract:
    // POST /api/auth/login  { email, password }  ->  { token, user }
    const { data } = await apiClient.post<LoginResponse>('/auth/login', payload);
    return data;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};