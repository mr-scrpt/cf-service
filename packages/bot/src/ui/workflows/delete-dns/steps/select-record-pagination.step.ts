import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { DnsGatewayPort, DnsRecord } from '@cloudflare-bot/shared';
import { DeleteDnsContext, DeleteDnsState } from '../delete-dns.context';

export class SelectRecordPaginationStep {
    private readonly PAGE_SIZE = 10;

    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<DeleteDnsContext>, ctx: Context, state: DeleteDnsState): Promise<DnsRecord | null> {
        const zoneId = state.zoneId;
        if (!zoneId) throw new Error('Zone ID is missing in state');

        // 1. Fetch all records (assuming < 100 or acceptable limit)
        // In a real generic implementation, we might need real pagination from API, 
        // but user requested client-side for stability.
        let records: DnsRecord[] = [];
        try {
            records = await conversation.external(() => this.gateway.listDnsRecords(zoneId));
        } catch (error) {
            await ctx.reply('❌ Failed to fetch DNS records. Please try again later.');
            return null;
        }

        if (records.length === 0) {
            await ctx.reply('⚠️ No DNS records found for this domain.');
            return null;
        }

        // 2. Pagination Loop
        let page = 0;
        const totalPages = Math.ceil(records.length / this.PAGE_SIZE);

        while (true) {
            const start = page * this.PAGE_SIZE;
            const end = start + this.PAGE_SIZE;
            const pageRecords = records.slice(start, end);

            const keyboard = new InlineKeyboard();

            // Record Buttons
            for (const record of pageRecords) {
                // formatting: [A] example.com (1.2.3.4)
                let content = '';
                if (record.type === 'SRV') {
                    content = `${record.data.priority} ${record.data.weight} ${record.data.port} ${record.data.target}`;
                } else {
                    content = record.content;
                }

                const contentSummary = content.length > 20 ? content.substring(0, 17) + '...' : content;
                const label = `[${record.type}] ${record.name.split('.')[0]} (${contentSummary})`;
                keyboard.text(label, `record:${record.id}`).row();
            }

            // Navigation Buttons
            const navRow = [];
            if (page > 0) navRow.push({ text: '⬅️ Prev', callback_data: 'nav:prev' });
            navRow.push({ text: `Page ${page + 1}/${totalPages}`, callback_data: 'nav:noop' }); // Indicator
            if (page < totalPages - 1) navRow.push({ text: 'Next ➡️', callback_data: 'nav:next' });

            if (navRow.length > 0) keyboard.row(...navRow);

            // Cancel Button
            keyboard.row().text('❌ Cancel', 'nav:cancel');

            await ctx.reply('Select a DNS record to delete:', { reply_markup: keyboard });

            // 3. Wait for selection
            const callback = await conversation.waitForCallbackQuery(/^record:|nav:/);
            const data = callback.callbackQuery.data;

            await callback.answerCallbackQuery(); // acknowledge immediately

            if (data === 'nav:cancel') {
                await ctx.reply('Operation cancelled.');
                return null;
            } else if (data === 'nav:prev') {
                page = Math.max(0, page - 1);
            } else if (data === 'nav:next') {
                page = Math.min(totalPages - 1, page + 1);
            } else if (data.startsWith('record:')) {
                const recordId = data.split(':')[1];
                return records.find(r => r.id === recordId) || null;
            }

            // Loop continues for nav actions (will update UI in next iteration)
            // Ideally we should edit the message instead of sending new ones to avoid spam,
            // but for simplicity in this step structure, new message is safer. 
            // IMPROVEMENT: We can use editMessageText if we track the message ID.
            // But let's stick to simple flow first.
        }
    }
}
