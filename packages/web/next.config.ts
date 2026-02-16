import type { NextConfig } from 'next';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['dotenv'],
  env: {
    NEXT_PUBLIC_API_AUTH_TOKEN: process.env.API_AUTH_TOKEN,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4050',
  },
};

export default nextConfig;
