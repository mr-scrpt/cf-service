import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { DnsRecord } from '@cloudflare-bot/shared';
import { DeleteDnsContext } from '../delete-dns.context';

import { formatConfirmDeleteDnsRecord } from '../../../common/templates/dns.templates';

export class ConfirmDeleteStep {
    async execute(conversation: Conversation<DeleteDnsContext>, ctx: Context, record: DnsRecord): Promise<boolean> {
        const message = formatConfirmDeleteDnsRecord(record);

        const keyboard = new InlineKeyboard()
            .text('✅ Yes, Delete', 'confirm:yes')
            .text('❌ No, Cancel', 'confirm:no');

        await ctx.reply(message, {
            parse_mode: 'HTML',
            reply_markup: keyboard
        });

        const callback = await conversation.waitForCallbackQuery(/^confirm:/);
        await callback.answerCallbackQuery();

        return callback.callbackQuery.data === 'confirm:yes';
    }
}
