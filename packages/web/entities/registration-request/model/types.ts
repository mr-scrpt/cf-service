export interface RegistrationRequest {
  id: string;
  telegramId: number;
  username: string;
  firstName: string;
  lastName?: string;
  createdAt: string;
}
