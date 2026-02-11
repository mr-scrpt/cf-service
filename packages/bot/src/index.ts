// packages/bot/src/index.ts (временно)
import { DnsRecordType, DomainStatus } from '@cloudflare-bot/shared';
import type { User } from '@cloudflare-bot/shared';

const testUser: User = {
  id: '1',
  telegramId: 123,
  username: 'test',
  isAllowed: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('Types work:', testUser.username);
console.log('Enum works:', DnsRecordType.A, DomainStatus.Active);
