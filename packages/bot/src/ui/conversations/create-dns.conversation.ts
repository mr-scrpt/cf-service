//  packages/bot/src/ui/conversations/create-dns.conversation.ts
import type { Conversation, ConversationFlavor } from '@grammyjs/conversations';
import type { Context } from 'grammy';
import {
  DnsGatewayPort,
  DnsRecordType,
  createDnsRecordSchema,
  ValidationError,
  isProxiable,
} from '@cloudflare-bot/shared';
import {
  CallbackSerializer,
  CallbackPattern,
  type DnsZonePayload,
  type DnsTypePayload,
  type DnsTtlPayload,
  type DnsProxiedPayload,
} from '../callbacks/callback-data';
import {
  buildDnsTypeKeyboard,
  buildZoneListKeyboard,
  buildTtlKeyboard,
  buildProxiedKeyboard,
} from '../keyboards/dns.keyboard';
import { formatDnsRecordCreated } from '../../commands/dns/dns-messages.template';
import { ErrorMapper } from '../../core/errors/error-mapper';

export function createDnsConversationFactory(gateway: DnsGatewayPort) {
  return async function (conversation: Conversation<any>, ctx: any) {
    try {
      // 1. Zone
      const zones = await gateway.listDomains();
      await ctx.reply('Домен:', { reply_markup: buildZoneListKeyboard(zones) });
      const zC = await conversation.waitForCallbackQuery(CallbackPattern.dnsZone());
      const { payload: zonePayload } = CallbackSerializer.deserialize<DnsZonePayload>(zC.callbackQuery.data);
      const zoneId = zonePayload.zoneId;
      await zC.answerCallbackQuery();

      // 2. Type
      await ctx.reply('Тип:', { reply_markup: buildDnsTypeKeyboard() });
      const tC = await conversation.waitForCallbackQuery(CallbackPattern.dnsType());
      const { payload: typePayload } = CallbackSerializer.deserialize<DnsTypePayload>(tC.callbackQuery.data);
      const type = typePayload.recordType;
      await tC.answerCallbackQuery();

      // 3. Name (text)
      await ctx.reply('Имя (www, @):');
      const nM = await conversation.waitFor('message:text');
      const name = nM.message.text!.trim();

      // 4. Content (text)
      await ctx.reply('Значение (IP/домен):');
      const cM = await conversation.waitFor('message:text');
      const content = cM.message.text!.trim();

      // 5. TTL
      await ctx.reply('TTL:', { reply_markup: buildTtlKeyboard() });
      const ttlC = await conversation.waitForCallbackQuery(CallbackPattern.dnsTtl());
      const { payload: ttlPayload } = CallbackSerializer.deserialize<DnsTtlPayload>(ttlC.callbackQuery.data);
      const ttl = ttlPayload.ttl;
      await ttlC.answerCallbackQuery();

      // 6. Proxied (type-safe!)
      let proxied = false;
      if (isProxiable(type)) {
        await ctx.reply('Proxied?', { reply_markup: buildProxiedKeyboard() });
        const pC = await conversation.waitForCallbackQuery(CallbackPattern.dnsProxied());
        const { payload: proxiedPayload } = CallbackSerializer.deserialize<DnsProxiedPayload>(pC.callbackQuery.data);
        proxied = proxiedPayload.value;
        await pC.answerCallbackQuery();
      }

      // Validate & Create
      const result = createDnsRecordSchema.safeParse({ zoneId, type, name, content, ttl, proxied });
      if (!result.success) {
        await ctx.reply(ErrorMapper.toUserMessage(ValidationError.fromZod(result.error)));
        return;
      }

      const record = await gateway.createDnsRecord(result.data);
      await ctx.reply(formatDnsRecordCreated(record), { parse_mode: 'HTML' });
    } catch (error) {
      await ctx.reply(ErrorMapper.toUserMessage(error as Error));
    }
  };
}
