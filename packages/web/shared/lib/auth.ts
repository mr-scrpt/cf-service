export interface LoginCredentials {
  username: string;
  password: string;
}

export const authLib = {
  setAuthenticated: (username: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', 'authenticated');
      localStorage.setItem('auth_username', username);
    }
  },

  logout: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_username');
    }
  },

  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('auth_token') === 'authenticated';
  },

  getUsername: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_username');
  },
};
