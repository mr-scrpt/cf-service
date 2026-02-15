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
} as const;

export type ApiRoute = typeof ROUTES[keyof typeof ROUTES];
