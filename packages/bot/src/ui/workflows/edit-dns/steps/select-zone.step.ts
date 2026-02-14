import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../core/workflow.step';
import { IStepResult, NextStepResult, ExitFlowResult } from '../../core/step.result';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { buildZoneListKeyboard } from '../../../keyboards/dns.keyboard';
import { CallbackPattern, CallbackSerializer, DnsZonePayload } from '../../../callbacks/callback-data';
import { InlineKeyboard } from 'grammy';
import { MenuCallbacks } from '../../../menus/main.menu';
import { EditDnsStep } from '../edit-dns.constants';

export class SelectZoneWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
    readonly id = EditDnsStep.SELECT_ZONE;

    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: EditDnsWorkflowContext): Promise<IStepResult> {
        const zones = await this.gateway.listDomains();
        await ctx.reply('Домен:', { reply_markup: buildZoneListKeyboard(zones) });

        // Wait for either Zone Selection OR Cancel
        const matcher = new RegExp(`^${CallbackPattern.dnsZone().source}|^${CallbackPattern.cancel().source}`);
        const zC = await conversation.waitForCallbackQuery(matcher);

        const data = zC.callbackQuery.data;

        if (CallbackPattern.cancel().test(data)) {
            await zC.answerCallbackQuery('Canceled');
            await ctx.reply('❌ Operation cancelled.', {
                reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns)
            });
            return new ExitFlowResult();
        }

        const { payload } = CallbackSerializer.deserialize<DnsZonePayload>(data);
        state.setZoneId(payload.zoneId);

        const selectedZone = zones.find(z => z.id === payload.zoneId);
        if (selectedZone) {
            state.setZoneName(selectedZone.name);
        }

        await zC.answerCallbackQuery();

        return new NextStepResult();
    }
}
