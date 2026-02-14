import type { Conversation } from '@grammyjs/conversations';
import {
    DnsGatewayPort,
    ValidationError,
} from '@cloudflare-bot/shared';
import { formatDnsRecordCreated } from '../../common/templates/dns.templates';
import { ErrorMapper } from '../../../core/errors/error-mapper';
import { logger } from '../../../utils/logger';
import { CreateDnsContext } from './create-dns.context';
import { ConversationStep } from '../common/interfaces/conversation-step.interface';
import { SelectZoneStep } from '../common/steps/select-zone.step';
import { SelectTypeStep } from './steps/select-type.step';
import { EnterNameStep } from './steps/enter-name.step';
import { CollectRecordDataStep } from './steps/collect-record-data.step';
import { SelectTtlStep } from './steps/select-ttl.step';
import { SelectProxiedStep } from './steps/select-proxied.step';
import { buildDnsMenuKeyboard } from '../../menus/main.menu';

export function createDnsFlowFactory(gateway: DnsGatewayPort) {
    return async function (conversation: Conversation<any>, ctx: any) {
        try {
            // 1. Initialize Context
            const state = new CreateDnsContext();

            // 2. Define Steps Pipeline
            const steps: ConversationStep<CreateDnsContext>[] = [
                new SelectZoneStep(gateway),
                new SelectTypeStep(),
                new EnterNameStep(),
                new CollectRecordDataStep(),
                new SelectTtlStep(),
                new SelectProxiedStep(),
            ];

            // 3. Execute Steps (Generic Step Execution Loop)
            // Ideally this loop logic could also be extracted to a Workflow Executor, 
            // but for now it's simple enough to stay here.
            for (const step of steps) {
                await step.execute(conversation, ctx, state);
            }

            // 4. Validate & Create
            logger.info('Create DNS Flow: State before validation', { ...state });

            const validationResult = state.validate();
            if (!validationResult.success) {
                logger.error('Validation failed', { errors: validationResult.error.issues });
                await ctx.reply(ErrorMapper.toUserMessage(ValidationError.fromZod(validationResult.error)));
                return;
            }

            logger.info('Creating DNS record', validationResult.data);
            const record = await gateway.createDnsRecord(validationResult.data);
            logger.info('DNS record created successfully', { record });

            await ctx.reply(formatDnsRecordCreated(record), {
                parse_mode: 'HTML',
                reply_markup: buildDnsMenuKeyboard()
            });

        } catch (error) {
            logger.error('Error in createDnsFlow', {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
            });
            await ctx.reply(ErrorMapper.toUserMessage(error as Error), {
                reply_markup: buildDnsMenuKeyboard()
            });
        }
    };
}
