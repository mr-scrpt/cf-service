import type { Metadata } from 'next';
import { Providers } from './providers';
import { APP_NAME } from '@/shared/config/constants';

export const metadata: Metadata = {
  title: APP_NAME,
  description: 'Admin panel for Cloudflare Bot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
