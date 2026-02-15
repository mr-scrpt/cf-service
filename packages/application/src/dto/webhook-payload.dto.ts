export interface WebhookPayloadDto {
  method: string;
  ip: string;
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  timestamp: Date;
}
