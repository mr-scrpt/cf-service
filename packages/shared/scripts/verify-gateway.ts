#!/usr/bin/env tsx

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { CloudflareGatewayAdapter } from '../src/infrastructure/cloudflare/adapters/gateway.adapter';
import { createLoggingProxy } from '../src/foundation/logging/logging-proxy';
import { LoggerAdapter, LoggerMode, LoggerLevel } from '../src/foundation/adapters/logger.adapter';
import { commonEnvSchema } from '../src/config';
import { DnsRecordType } from '../src/domain/constants.domain';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Verification Script for CloudflareGatewayAdapter + Logging Proxy
 * 
 * Tests:
 * 1. List existing domains
 * 2. Register domain (if needed)
 * 3. List DNS records
 * 4. Create DNS record
 * 5. Update DNS record
 * 6. Delete DNS record
 * 
 * Usage: pnpm --filter @cloudflare-bot/shared run verify
 */

const TEST_DOMAIN = 'hellkitchen.pp.ua';

async function main() {
    console.log('🚀 Starting Gateway Verification...\n');

    // Initialize logger with file output
    const logger = new LoggerAdapter({
        service: 'gateway-verification',
        mode: LoggerMode.Pretty,
        level: LoggerLevel.Debug,
        logDir: resolve(process.cwd(), 'logs'),
        filename: 'verification',
    });

    // Load environment
    const env = commonEnvSchema.parse(process.env);

    // Create Gateway with Logging Proxy
    const rawGateway = new CloudflareGatewayAdapter(env);
    const gateway = createLoggingProxy(rawGateway, logger, 'CloudflareGateway');

    try {
        // Step 1: List Domains
        console.log('\n📋 Step 1: Listing domains...');
        const domains = await gateway.listDomains();
        console.log(`✅ Found ${domains.length} domain(s)`);
        domains.forEach((d, i) => {
            console.log(`   ${i + 1}. ${d.name} (${d.id}) - ${d.status}`);
        });

        // Check if test domain exists
        let zoneId = domains.find(d => d.name === TEST_DOMAIN)?.id;

        // Step 2: Register Domain (if not exists)
        if (!zoneId) {
            console.log(`\n🌐 Step 2: Attempting to register domain ${TEST_DOMAIN}...`);
            try {
                const domain = await gateway.registerDomain({ name: TEST_DOMAIN });
                zoneId = domain.id;
                console.log(`✅ Domain registered: ${domain.id}`);
                console.log(`   NS Servers: ${domain.nameservers.join(', ')}`);
            } catch (error: any) {
                console.log(`⚠️  Registration failed (might need token permissions): ${error.message}`);
                console.log(`   Using first available domain instead...`);
                // Fall back to first available domain
                if (domains.length > 0) {
                    zoneId = domains[0].id;
                    console.log(`   Selected: ${domains[0].name} (${zoneId})`);
                } else {
                    throw new Error('No domains available for testing');
                }
            }
        } else {
            console.log(`\n✅ Step 2: Domain ${TEST_DOMAIN} already exists (${zoneId})`);
        }

        // Step 3: List DNS Records
        console.log(`\n📝 Step 3: Listing DNS records for ${TEST_DOMAIN}...`);
        const records = await gateway.listDnsRecords(zoneId!);
        console.log(`✅ Found ${records.length} DNS record(s)`);
        records.slice(0, 5).forEach((r, i) => {
            const content = r.type === DnsRecordType.SRV ? r.data.target : r.content;
            console.log(`   ${i + 1}. [${r.type}] ${r.name} → ${content}`);
        });

        // Step 4: Create DNS Record
        console.log('\n➕ Step 4: Creating A record...');
        const newRecord = await gateway.createDnsRecord({
            zoneId: zoneId!,
            type: DnsRecordType.A,
            name: 'test-verification',
            content: '192.0.2.1', // TEST-NET-1 (reserved for documentation)
            ttl: 3600,
            proxied: false,
        });
        console.log(`✅ Record created: ${newRecord.id}`);
        console.log(`   ${newRecord.type} ${newRecord.name} → ${'content' in newRecord ? newRecord.content : 'N/A'}`);

        // Step 5: Update DNS Record
        console.log('\n🔄 Step 5: Updating DNS record...');
        const updatedRecord = await gateway.updateDnsRecord(
            newRecord.id,
            zoneId!,
            {
                zoneId: zoneId!,
                type: DnsRecordType.A,
                name: 'test-verification',
                content: '192.0.2.2', // Updated IP
                ttl: 7200,
                proxied: false,
            }
        );
        console.log(`✅ Record updated: ${updatedRecord.id}`);
        console.log(`   New content: ${'content' in updatedRecord ? updatedRecord.content : 'N/A'}, TTL: ${updatedRecord.ttl}`);

        // Step 6: Delete DNS Record
        console.log('\n🗑️  Step 6: Deleting DNS record...');
        await gateway.deleteDnsRecord(newRecord.id, zoneId!);
        console.log(`✅ Record deleted: ${newRecord.id}`);

        console.log('\n✅ All verifications passed!\n');
    } catch (error: any) {
        console.error('\n❌ Verification failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

main();
