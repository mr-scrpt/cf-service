import type { DomainDto } from '@cloudflare-bot/application';
import { IDomainFormatter } from './domain-formatter.interface';

/**
 * Domain formatter - formats domain information for bot messages
 * Follows the same pattern as DnsRecordFormatter
 */
export class DomainFormatter implements IDomainFormatter {
  formatDomainRegistered(domain: DomainDto): string {
    const nsServers = domain.nameservers.join('\n• ');

    return `✅ <b>Domain registered successfully!</b>

📍 <b>Domain:</b> ${domain.name}
🆔 <b>Zone ID:</b> <code>${domain.id}</code>
📊 <b>Status:</b> ${domain.status}

🌐 <b>NS Servers</b> (add to your registrar):
• ${nsServers}

⚠️ <b>Important:</b> Update your domain registrar with these nameservers to activate Cloudflare.`;
  }

  formatDomainsList(domains: DomainDto[]): string {
    if (domains.length === 0) {
      return '📋 <b>No domains found.</b>\n\nRegister a domain to get started.';
    }

    const formatted = domains
      .map((d, i) => {
        const ns = d.nameservers.slice(0, 2).join(', ');
        return `<b>${i + 1}. ${d.name}</b>
   🆔 <code>${d.id}</code>
   📊 Status: ${d.status}
   🌐 NS: ${ns}`;
      })
      .join('\n\n');

    return `📋 <b>Your Domains</b> (${domains.length})\n\n${formatted}`;
  }
}
