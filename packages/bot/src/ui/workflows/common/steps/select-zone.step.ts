import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { CallbackPattern, CallbackSerializer, DnsZonePayload } from '../../../callbacks/callback-data';
import { buildZoneListKeyboard } from '../../../keyboards/dns.keyboard';
import { ConversationStep } from '../../../conversations/__flow/conversation.step';
import { ZoneAwareContext } from '../interfaces/zone-aware.interface';

// Note: ConversationStep is generic enough, but strictly typed to DnsWizardContext in previous file.
// We should update ConversationStep interface to be generic <TContext>
// But for now, we can make this step accept any T extends ZoneAwareContext

export class SelectZoneStep<TContext extends ZoneAwareContext> {
    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: TContext): Promise<void> {
        const zones = await this.gateway.listDomains();
        await ctx.reply('Домен:', { reply_markup: buildZoneListKeyboard(zones) });
        const zC = await conversation.waitForCallbackQuery(CallbackPattern.dnsZone());
        const { payload } = CallbackSerializer.deserialize<DnsZonePayload>(zC.callbackQuery.data);
        state.setZoneId(payload.zoneId);
        await zC.answerCallbackQuery();
    }
}
