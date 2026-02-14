import { Conversation } from '@grammyjs/conversations';
import { DeleteDnsContext, DeleteDnsState } from './delete-dns.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { SelectZoneStep } from '../common/steps/select-zone.step';
import { SelectRecordPaginationStep } from './steps/select-record-pagination.step';
import { ConfirmDeleteStep } from './steps/confirm-delete.step';
import { MenuCallbacks } from '../../menus/main.menu';
import { InlineKeyboard } from 'grammy';
import { formatDnsRecordDeleted } from '../../common/templates/dns.templates';

export function deleteDnsFlowFactory(gateway: DnsGatewayPort) {
    return async function deleteDnsFlow(conversation: Conversation<any>, ctx: any) {
        // 0. Initialize State
        const state = new DeleteDnsState();

        // 1. Select Zone
        const selectZoneStep = new SelectZoneStep<DeleteDnsState>(gateway);
        await selectZoneStep.execute(conversation, ctx, state);

        if (!state.zoneId) {
            await ctx.reply('❌ Zone selection failed.');
            return;
        }

        // 2. Select Record (Paginated)
        const selectRecordStep = new SelectRecordPaginationStep(gateway);
        const record = await selectRecordStep.execute(conversation, ctx, state);

        if (!record) {
            // Cancelled or no records
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return;
        }

        // 3. Confirm Delete
        const confirmStep = new ConfirmDeleteStep();
        const confirmed = await confirmStep.execute(conversation, ctx, record);

        if (confirmed) {
            // ... (in deleteDnsFlow)

            try {
                await conversation.external(() => gateway.deleteDnsRecord(record.id, state.zoneId!));

                const keyboard = new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns);
                await ctx.reply(formatDnsRecordDeleted(record), {
                    parse_mode: 'HTML',
                    reply_markup: keyboard
                });
            } catch (error) {
                await ctx.reply(`❌ <b>Error:</b> Failed to delete record.\n${error instanceof Error ? error.message : String(error)}`, { parse_mode: 'HTML' });
            }
        } else {
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
        }
    };
}
