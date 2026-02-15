import { envSchema, Env } from './env.schema';

export function loadConfig(): Env {
  const result = envSchema.safeParse(process.env);
  
  if (!result.success) {
    console.error('❌ Invalid environment variables:');
    console.error(result.error.format());
    throw new Error('Invalid environment configuration');
  }
  
  return result.data;
}
