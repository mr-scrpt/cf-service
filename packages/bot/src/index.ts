// packages/bot/src/index.ts (временно)
import { registerDomainSchema, createDnsRecordSchema, DnsRecordType } from '@cloudflare-bot/shared';

// Валидация домена
const valid = registerDomainSchema.safeParse({ name: 'example.com' });
console.log('Valid:', valid.success); // true

const invalid = registerDomainSchema.safeParse({ name: 'not a domain' });
console.log('Invalid:', invalid.success); // false
if (!invalid.success) {
  console.log('Error:', invalid.error.issues[0].message);
}

// DNS — enum из единого источника
const dns = createDnsRecordSchema.safeParse({
  zoneId: 'zone-123',
  type: DnsRecordType.A,
  name: 'www',
  content: '1.2.3.4',
});
console.log('DNS valid:', dns.success); // true
