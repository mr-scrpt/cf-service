export const APP_NAME = 'Cloudflare Bot Admin';

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
} as const;

export const API_ENDPOINTS = {
  HEALTH: '/health',
  USERS: '/api/users',
  USER_BY_ID: (telegramId: number) => `/api/users/${telegramId}`,
  REGISTRATION_REQUESTS: '/api/registration-requests',
  REGISTRATION_PENDING: '/api/registration-requests/pending',
  REGISTRATION_APPROVE: (requestId: string) => `/api/registration-requests/${requestId}/approve`,
  REGISTRATION_REJECT: (requestId: string) => `/api/registration-requests/${requestId}/reject`,
  NOTIFY: '/api/notify',
} as const;

export const QUERY_KEYS = {
  HEALTH: ['health'] as const,
  USERS: ['users'] as const,
  REGISTRATION_REQUESTS: ['registrationRequests'] as const,
} as const;

export const REFETCH_INTERVAL = 30000;
