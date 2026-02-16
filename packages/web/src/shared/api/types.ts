export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
}

export interface User {
  id: string;
  telegramId: number;
  username: string;
  isAllowed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRequest {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
}

export interface NotificationPayload {
  event?: string;
  status?: string;
  message?: string;
  version?: string;
  [key: string]: unknown;
}
