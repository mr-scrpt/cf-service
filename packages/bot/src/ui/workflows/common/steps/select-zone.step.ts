import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { DnsGatewayPort } from '@cloudflare-bot/shared';
import { CallbackPattern, CallbackSerializer, DnsZonePayload } from '../../../callbacks/callback-data';
import { buildZoneListKeyboard } from '../../../keyboards/dns.keyboard';
import { ZoneAwareContext } from '../interfaces/zone-aware.interface';

// Note: ConversationStep is generic enough, but strictly typed to DnsWizardContext in previous file.
// We should update ConversationStep interface to be generic <TContext>
// But for now, we can make this step accept any T extends ZoneAwareContext

export class SelectZoneStep<TContext extends ZoneAwareContext> {
    constructor(private gateway: DnsGatewayPort) { }

    async execute(conversation: Conversation<any>, ctx: Context, state: TContext): Promise<void> {
        const zones = await this.gateway.listDomains();
        await ctx.reply('Домен:', { reply_markup: buildZoneListKeyboard(zones) });

        // Wait for either Zone Selection OR Cancel
        const matcher = new RegExp(`^${CallbackPattern.dnsZone().source}|^${CallbackPattern.cancel().source}`);
        const zC = await conversation.waitForCallbackQuery(matcher);

        const data = zC.callbackQuery.data;

        if (CallbackPattern.cancel().test(data)) {
            await zC.answerCallbackQuery('Canceled');
            return; // Exit without setting zoneId
        }

        const { payload } = CallbackSerializer.deserialize<DnsZonePayload>(data);
        state.setZoneId(payload.zoneId);

        const selectedZone = zones.find(z => z.id === payload.zoneId);
        if (selectedZone) {
            state.setZoneName(selectedZone.name);
        }

        await zC.answerCallbackQuery();
    }
}
