import { Conversation } from '@grammyjs/conversations';
import { Context } from 'grammy';
import { WorkflowStep } from '../../core/workflow.step';
import { IStepResult, JumpToStepResult } from '../../core/step.result';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { FIELD_DEFINITIONS, DnsFieldDefinition } from '../edit-dns.config';
import { INPUT_STRATEGIES } from '../strategies/input.strategies';
import { EditDnsStep, DnsFieldName } from '../edit-dns.constants';

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

    const currentValue = this.resolveValue(state.getEffectiveRecord(), fieldDef, fieldName);

    const strategy = INPUT_STRATEGIES[fieldDef.input.type];

    await strategy.handle(conversation, ctx, state, fieldDef, currentValue);

    return new JumpToStepResult('edit_menu');
  }

  private resolveValue(record: any, fieldDef: DnsFieldDefinition, fieldName: string): unknown {
    if (fieldDef.path) {
      let val = record;
      for (const p of fieldDef.path) val = val ? val[p] : undefined;
      return val;
    }
    return record[fieldName];
  }
}
