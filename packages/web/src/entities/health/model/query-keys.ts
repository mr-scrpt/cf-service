const BASE_KEY = 'health';

const QUERIES = {
  CHECK_HEALTH: 'check_health',
} as const;

export const healthQueryKeys = {
  base: [BASE_KEY] as const,
  
  checkHealth: () => [BASE_KEY, QUERIES.CHECK_HEALTH] as const,
};
