export const API_PREFIX = '/api' as const;

export const ROUTES = {
  HEALTH: '/health',
  
  WEBHOOK: {
    BASE: '/webhook',
  },
  
  USERS: {
    BASE: '/users',
    BY_TELEGRAM_ID: '/users/:telegramId',
  },
  
  REGISTRATION_REQUESTS: {
    BASE: '/registration-requests',
    PENDING: '/registration-requests/pending',
    APPROVE: '/registration-requests/:requestId/approve',
    REJECT: '/registration-requests/:requestId/reject',
  },
} as const;

export type ApiRoute = typeof ROUTES[keyof typeof ROUTES];
