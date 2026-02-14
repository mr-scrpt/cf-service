import { Conversation } from '@grammyjs/conversations';
import { EditDnsContext, EditDnsState } from './edit-dns.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { SelectZoneStep } from '../common/steps/select-zone.step';
import { SelectRecordPaginationStep } from '../delete-dns/steps/select-record-pagination.step'; // Reuse
import { EditRecordMenuStep } from './steps/edit-record-menu.step';
import { EditNameStep } from './steps/edit-name.step';
import { EditContentStep } from './steps/edit-content.step';
import { EditTtlStep } from './steps/edit-ttl.step';
import { EditProxiedStep } from './steps/edit-proxied.step';
import { MenuCallbacks } from '../../menus/main.menu';
import { InlineKeyboard } from 'grammy';
import { logger } from '../../../utils/logger';

export function editDnsFlowFactory(gateway: DnsGatewayPort) {
    return async function editDnsFlow(conversation: Conversation<any>, ctx: any) {
        // 0. Initialize State
        const state = new EditDnsState();

        // 1. Select Zone
        const selectZoneStep = new SelectZoneStep<EditDnsState>(gateway);
        await selectZoneStep.execute(conversation, ctx, state);

        if (!state.zoneId) {
            // Cancelled or failed
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return;
        }

        // 2. Select Record (Reuse Pagination Step)
        const selectRecordStep = new SelectRecordPaginationStep(gateway);
        const record = await selectRecordStep.execute(conversation, ctx, state);

        if (!record) {
            logger.info('Record selection cancelled');
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return;
        }

        state.setRecord(record);

        // 3. Edit Loop
        // 3. Edit Loop
        const editMenu = new EditRecordMenuStep();
        const steps = {
            name: new EditNameStep(),
            content: new EditContentStep(),
            ttl: new EditTtlStep(),
            proxied: new EditProxiedStep()
        };

        let loop = true;
        while (loop) {
            const action = await editMenu.execute(conversation, ctx, state);
            logger.info(`Edit action selected: ${action}`, { recordId: state.recordId, action });

            if (action === 'save') {
                try {
                    const finalRecord = state.getEffectiveRecord();
                    logger.info('Saving DNS record changes', {
                        original: state.originalRecord,
                        modified: state.modifiedRecord,
                        effective: finalRecord
                    });

                    await conversation.external(() => gateway.updateDnsRecord(state.recordId!, state.zoneId!, finalRecord));

                    logger.info('DNS record updated successfully', { recordId: state.recordId });
                    await ctx.reply('✅ Record updated successfully!', {
                        reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
                    });
                    loop = false;
                } catch (e: any) {
                    logger.error('Error updating DNS record', {
                        error: e.message || String(e),
                        recordId: state.recordId,
                        zoneId: state.zoneId
                    });
                    // Catching specifically to show user
                    await ctx.reply(`❌ Error updating record: ${e.message || String(e)}`);
                }
            } else if (action === 'cancel') {
                logger.info('Edit cancelled by user');
                await ctx.reply('❌ Edit cancelled.', {
                    reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
                });
                loop = false;
            } else {
                // Action mapping
                const step = steps[action];
                if (step) {
                    await step.execute(conversation, ctx, state);
                    // Log state after step execution
                    logger.info(`Step ${action} executed`, {
                        modifiedRecord: state.modifiedRecord
                    });
                } else {
                    logger.warn(`Unknown action: ${action}`);
                    await ctx.reply('⚠️ Unknown action.');
                }
            }
        }
    };
}
