// packages/bot/src/index.ts (временно)
import { registerDomainSchema, createDnsRecordSchema, DnsRecordType } from '@cloudflare-bot/shared';

// Успешная валидация
const valid = registerDomainSchema.safeParse({ name: 'example.com' });
console.log('Valid:', valid.success); // true

// Неуспешная валидация
const invalid = registerDomainSchema.safeParse({ name: 'not a domain' });
console.log('Invalid:', invalid.success); // false
if (!invalid.success) {
  console.log('Error:', invalid.error.issues[0].message);
}

// DNS с enum
const dns = createDnsRecordSchema.safeParse({
  zoneId: 'zone-123',
  type: DnsRecordType.A,
  name: 'www',
  content: '1.2.3.4',
});
console.log('DNS valid:', dns.success); // true
