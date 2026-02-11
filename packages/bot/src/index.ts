import { Environment } from '@cloudflare-bot/shared';
import { env } from './config';

console.log(`Bot starting (env: ${env.NODE_ENV})...`);

if (env.NODE_ENV === Environment.Production) {
  console.log('output_log: TEST ENV =>>>', env.NODE_ENV);
}
