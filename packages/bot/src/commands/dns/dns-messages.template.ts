import { DnsRecord } from '@cloudflare-bot/shared';

/**
 * Template helpers for DNS command responses
 * Keeps formatting logic separate from command logic
 */

export function formatDnsRecordCreated(record: DnsRecord): string {
    // Handle different record types (SRV has 'data', others have 'content')
    const contentDisplay =
        'content' in record
            ? record.content
            : `${record.data.target} (priority: ${record.data.priority}, weight: ${record.data.weight}, port: ${record.data.port})`;

    return (
        `✅ <b>DNS record created!</b>\n\n` +
        `🆔 <b>Record ID:</b> <code>${record.id}</code>\n` +
        `📝 <b>Type:</b> ${record.type}\n` +
        `🏷 <b>Name:</b> ${record.name}\n` +
        `📌 <b>Content:</b> ${contentDisplay}\n` +
        `⏱ <b>TTL:</b> ${record.ttl}s\n` +
        `🔒 <b>Proxied:</b> ${record.proxied ? 'Yes' : 'No'}`
    );
}

export function formatDnsRecordsList(records: DnsRecord[]): string {
    if (records.length === 0) {
        return '📋 No DNS records found for this zone.';
    }

    const formatted = records
        .map((r, i) => {
            // Handle SRV records with 'data', others with 'content'
            const content =
                'content' in r ? r.content : `${r.data.target} (priority: ${r.data.priority})`;

            return (
                `<b>${i + 1}. ${r.type} — ${r.name}</b>\n` +
                `   🆔 <code>${r.id}</code>\n` +
                `   📌 ${content}\n` +
                `   ⏱ TTL: ${r.ttl}s | 🔒 Proxied: ${r.proxied ? 'Yes' : 'No'}`
            );
        })
        .join('\n\n');

    return `📋 <b>DNS Records</b>\n\n${formatted}`;
}

export function formatDnsRecordDeleted(recordId: string): string {
    return `✅ <b>DNS record deleted successfully!</b>\n\n` + `🆔 Record ID: <code>${recordId}</code>`;
}

export const DnsCommandUsage = {
    create:
        `❌ <b>Usage:</b> /dns_create &lt;zone_id&gt; &lt;type&gt; &lt;name&gt; &lt;content&gt; [ttl] [proxied]\n\n` +
        `<b>Example:</b>\n` +
        `<code>/dns_create abc123... A @ 1.2.3.4</code>\n` +
        `<code>/dns_create abc123... CNAME www example.com 3600 true</code>`,

    list:
        `❌ <b>Usage:</b> /dns_list &lt;zone_id&gt;\n\n` +
        `<b>Example:</b> <code>/dns_list abc123...</code>`,

    delete:
        `❌ <b>Usage:</b> /dns_delete &lt;zone_id&gt; &lt;record_id&gt;\n\n` +
        `<b>Example:</b> <code>/dns_delete abc123... xyz789...</code>`,
} as const;
