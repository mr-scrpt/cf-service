import { z } from 'zod';

export const cloudflareErrorDetailsSchema = z.object({
  code: z.number(),
  message: z.string(),
});

export const cloudflareErrorResponseSchema = z.object({
  success: z.literal(false),
  errors: z.array(cloudflareErrorDetailsSchema),
  messages: z.array(z.string()).optional(),
  result: z.null().optional(),
});

export type CloudflareErrorDetails = z.infer<typeof cloudflareErrorDetailsSchema>;
export type CloudflareErrorResponse = z.infer<typeof cloudflareErrorResponseSchema>;
