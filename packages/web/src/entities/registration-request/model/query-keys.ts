const BASE_KEY = 'registration-request';

const QUERIES = {
  GET_PENDING: 'get_pending',
} as const;

export const registrationRequestQueryKeys = {
  base: [BASE_KEY] as const,
  
  getPending: () => [BASE_KEY, QUERIES.GET_PENDING] as const,
};
