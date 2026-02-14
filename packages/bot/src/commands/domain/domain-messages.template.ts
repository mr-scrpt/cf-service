import { Domain } from '@cloudflare-bot/shared';

/**
 * Template helpers for Domain command responses
 * Keeps formatting logic separate from command logic
 */

export function formatDomainRegistered(domain: Domain): string {
    const nsServers = domain.nameservers.join('\n• ');

    return (
        `✅ <b>Domain registered successfully!</b>\n\n` +
        `📍 <b>Domain:</b> ${domain.name}\n` +
        `🆔 <b>Zone ID:</b> <code>${domain.id}</code>\n` +
        `📊 <b>Status:</b> ${domain.status}\n\n` +
        `🌐 <b>NS Servers</b> (add to your registrar):\n• ${nsServers}`
    );
}

export function formatDomainsList(domains: Domain[]): string {
    if (domains.length === 0) {
        return '📋 No domains found.';
    }

    const formatted = domains
        .map((d, i) => {
            const ns = d.nameservers.slice(0, 2).join(', ');
            return (
                `<b>${i + 1}. ${d.name}</b>\n` +
                `   🆔 <code>${d.id}</code>\n` +
                `   📊 Status: ${d.status}\n` +
                `   🌐 NS: ${ns}`
            );
        })
        .join('\n\n');

    return `📋 <b>Your Domains</b>\n\n${formatted}`;
}
