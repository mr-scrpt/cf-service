import { z } from 'zod';

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('Invalid API URL'),
});

const serverEnvSchema = z.object({
  ADMIN_USERNAME: z.string().min(3, 'Username must be at least 3 characters'),
  ADMIN_PASSWORD: z.string().min(6, 'Password must be at least 6 characters'),
  SESSION_SECRET: z.string().min(32, 'Session secret must be at least 32 characters'),
});

function getClientEnv() {
  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  });

  if (!parsed.success) {
    console.error('❌ Invalid client environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid client environment variables');
  }

  return parsed.data;
}

function getServerEnv() {
  if (typeof window !== 'undefined') {
    return {
      ADMIN_USERNAME: '',
      ADMIN_PASSWORD: '',
      SESSION_SECRET: '',
    };
  }

  const parsed = serverEnvSchema.safeParse({
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  if (!parsed.success) {
    console.error('❌ Invalid server environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid server environment variables');
  }

  return parsed.data;
}

export const env = {
  ...getClientEnv(),
  ...getServerEnv(),
};

export type Env = z.infer<typeof clientEnvSchema> & z.infer<typeof serverEnvSchema>;
