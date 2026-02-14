import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { CallbackPattern, CallbackSerializer, DnsZonePayload } from '../../callbacks/callback-data';
import { buildZoneListKeyboard } from '../../keyboards/dns.keyboard';
import { ConversationStep } from '../__flow/conversation.step';
import { DnsWizardContext } from '../__flow/dns-wizard.context';

export class SelectZoneStep implements ConversationStep {
    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: DnsWizardContext): Promise<void> {
        const zones = await this.gateway.listDomains();
        await ctx.reply('Домен:', { reply_markup: buildZoneListKeyboard(zones) });
        const zC = await conversation.waitForCallbackQuery(CallbackPattern.dnsZone());
        const { payload } = CallbackSerializer.deserialize<DnsZonePayload>(zC.callbackQuery.data);
        state.zoneId = payload.zoneId;
        await zC.answerCallbackQuery();
    }
}
