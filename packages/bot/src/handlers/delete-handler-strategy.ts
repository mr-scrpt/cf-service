import { SessionContext } from '../routing';
import { DeleteDnsFlow } from '../flows';
import { FlowStep } from '../constants';
import { SessionValidator } from './session-validators';

interface DeleteStepHandler {
  handle(ctx: SessionContext, payload: { idx?: number }): Promise<void>;
}

class SelectRecordStepHandler implements DeleteStepHandler {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: { idx?: number }): Promise<void> {
    if (payload.idx === undefined) {
      await ctx.reply('❌ Invalid request. Please try again.');
      return;
    }

    const domain = SessionValidator.getDomainByIndex(ctx, payload.idx);
    if (!domain) {
      await ctx.reply('❌ Domain not found. Please try again.');
      return;
    }

    SessionValidator.setSelectedZone(ctx, domain);
    await this.deleteFlow.showRecordSelector(ctx);
  }
}

class ConfirmStepHandler implements DeleteStepHandler {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}

  async handle(ctx: SessionContext, payload: { idx?: number }): Promise<void> {
    if (payload.idx === undefined) {
      await ctx.reply('❌ Invalid request. Please try again.');
      return;
    }

    const record = SessionValidator.getRecordByIndex(ctx, payload.idx);
    if (!record) {
      await ctx.reply('❌ Record not found. Please try again.');
      return;
    }

    await this.deleteFlow.showConfirmation(ctx, payload.idx, record.name, record.type);
  }
}

export class DeleteHandlerStrategy {
  private readonly handlers: Map<FlowStep, DeleteStepHandler>;

  constructor(deleteFlow: DeleteDnsFlow) {
    this.handlers = new Map<FlowStep, DeleteStepHandler>();
    this.handlers.set(FlowStep.SELECT_RECORD, new SelectRecordStepHandler(deleteFlow));
    this.handlers.set(FlowStep.CONFIRM, new ConfirmStepHandler(deleteFlow));
  }

  async handle(ctx: SessionContext, step: FlowStep, payload: { idx?: number }): Promise<void> {
    const handler = this.handlers.get(step);
    if (!handler) {
      await ctx.reply('❌ Invalid operation. Please try again.');
      return;
    }

    await handler.handle(ctx, payload);
  }
}
