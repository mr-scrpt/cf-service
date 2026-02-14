import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { IStepResult, JumpToStepResult } from '../../../core/step.result';
import { WorkflowStep } from '../../../core/workflow.step';
import { resolveDnsFieldValue } from '../../../shared/dns.utils';
import { FIELD_DEFINITIONS } from '../../config/edit-dns.config';
import { DnsFieldName, EditDnsStep } from '../../config/edit-dns.constants';
import { EditDnsWorkflowContext } from '../../edit-dns.workflow.context';
import { INPUT_STRATEGIES } from '../../strategies/input.strategies';

export class EditFieldWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
  readonly id = EditDnsStep.EDIT_FIELD;

  async execute(
    conversation: Conversation<any>,
    ctx: Context,
    state: EditDnsWorkflowContext,
  ): Promise<IStepResult> {
    const fieldName = state.getActiveField() as DnsFieldName;
    const fieldDef = FIELD_DEFINITIONS[fieldName];

    if (!fieldDef) {
      await ctx.reply('⚠️ Invalid field selected.');
      return new JumpToStepResult(EditDnsStep.EDIT_MENU);
    }

    const currentValue = resolveDnsFieldValue(state.getEffectiveRecord(), fieldDef, fieldName);

    const strategy = INPUT_STRATEGIES[fieldDef.input.type];

    await strategy.handle(conversation, ctx, state, fieldDef, currentValue);

    return new JumpToStepResult(EditDnsStep.EDIT_MENU);
  }
}
