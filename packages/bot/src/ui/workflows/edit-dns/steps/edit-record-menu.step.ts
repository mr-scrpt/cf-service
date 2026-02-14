import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { EditDnsState } from '../edit-dns.context';
import { DnsRecord } from '@cloudflare-bot/shared';

export class EditRecordMenuStep {
    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsState): Promise<'save' | 'cancel' | 'name' | 'content' | 'ttl' | 'proxied'> {
        const record = state.getEffectiveRecord();
        const modified = state.modifiedRecord;

        // Helper to show changed state
        const showChange = (field: keyof DnsRecord, original: any, current: any) => {
            if (original !== current) {
                return `${original} ➝ <b>${current}</b>`;
            }
            return `${current}`;
        };

        const isSrv = record.type === 'SRV';
        let contentDisplay = '';
        if (isSrv) {
            const data = record.data;
            contentDisplay = `Priority: ${data.priority}, Weight: ${data.weight}, Port: ${data.port}, Target: ${data.target}`;
        } else {
            contentDisplay = record.content;
        }

        const message = `✏️ <b>Editing Record</b>: ${record.name} (${record.type})\n\n` +
            `🔹 <b>Name:</b> ${showChange('name', state.originalRecord!.name, record.name)}\n` +
            `🔹 <b>Content:</b> ${contentDisplay}\n` + // content change logic is complex for SRV, simplified for now
            `🔹 <b>TTL:</b> ${showChange('ttl', state.originalRecord!.ttl, record.ttl)}\n` +
            `🔹 <b>Proxied:</b> ${showChange('proxied', state.originalRecord!.proxied, record.proxied)}\n\n` +
            `👇 Select a field to edit:`;

        const keyboard = new InlineKeyboard()
            .text('📝 Name', 'edit:name').text('📝 Content', 'edit:content').row()
            .text('⏱ TTL', 'edit:ttl').text('🛡 Proxy', 'edit:proxied').row()
            .text('💾 Save Changes', 'edit:save').text('❌ Cancel', 'edit:cancel');

        await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

        const callback = await conversation.waitForCallbackQuery(/^edit:/);
        await callback.answerCallbackQuery();

        const action = callback.callbackQuery.data.split(':')[1];
        return action as 'save' | 'cancel' | 'name' | 'content' | 'ttl' | 'proxied';
    }
}
