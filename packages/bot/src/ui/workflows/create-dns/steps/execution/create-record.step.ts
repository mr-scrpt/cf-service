import { DnsGatewayPort, ValidationError } from '@cloudflare-bot/shared';
import { createDnsRecordSchema } from '@cloudflare-bot/shared/dist/domain/dns-record.schema';
import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { ErrorMapper } from '../../../../../core/errors/error-mapper';
import { logger } from '../../../../../utils/logger';
import { formatDnsRecordCreated } from '../../../../common/templates/dns.templates';
import { MenuCallbacks } from '../../../../menus/main.menu';
import { ExitFlowResult, IStepResult, JumpToStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { CreateDnsStep } from '../../config/create-dns.constants';
import { CreateDnsWorkflowContext } from '../../create-dns.workflow.context';

export class CreateRecordWorkflowStep implements WorkflowStep<CreateDnsWorkflowContext> {
  readonly id = CreateDnsStep.CREATE_RECORD;

  constructor(private gateway: DnsGatewayPort) {}

  async execute(
    conversation: Conversation<any>,
    ctx: Context,
    state: CreateDnsWorkflowContext,
  ): Promise<IStepResult> {
    const draft = state.getEffectiveRecord();

    const payload = {
      ...draft,
      zoneId: state.zoneId,
    };

    const validation = createDnsRecordSchema.safeParse(payload);

    if (!validation.success) {
      const error = ValidationError.fromZod(validation.error);
      await ctx.reply(`⚠️ <b>Validation Error:</b>\n${error.message}`, { parse_mode: 'HTML' });

      return new JumpToStepResult(CreateDnsStep.CREATE_MENU);
    }

    try {
      logger.info('Creating DNS record', {
        zoneId: state.zoneId,
        payload: validation.data,
      });

      await ctx.reply('💾 Creating record...');

      const record = await conversation.external(() =>
        this.gateway.createDnsRecord(validation.data),
      );

      logger.info('DNS record created successfully', { recordId: record.id });

      await ctx.reply(formatDnsRecordCreated(record), {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns),
      });

      return new ExitFlowResult();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error creating DNS record', {
        error: err.message,
        stack: err.stack,
        zoneId: state.zoneId,
        draft: validation.data,
      });

      const userMessage = ErrorMapper.toUserMessage(err);

      await ctx.reply(userMessage, {
        reply_markup: new InlineKeyboard().text('🔙 Back to Menu', MenuCallbacks.dns),
      });

      return new ExitFlowResult();
    }
  }
}
