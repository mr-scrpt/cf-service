const BASE_KEY = 'user';

const QUERIES = {
  GET_USERS: 'get_users',
  GET_USER: 'get_user',
} as const;

export const userQueryKeys = {
  base: [BASE_KEY] as const,
  
  getUsers: () => [BASE_KEY, QUERIES.GET_USERS] as const,
  
  getUser: (id: string) => [BASE_KEY, QUERIES.GET_USER, id] as const,
};
