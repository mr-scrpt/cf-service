import { Conversation } from '@grammyjs/conversations';
import { Context, InlineKeyboard } from 'grammy';
import { Callback, CallbackPattern } from '../../../callbacks/callback-data';
import { IStepResult, JumpToStepResult } from '../../core/step.result';
import { WorkflowStep } from '../../core/workflow.step';
import { DnsFieldDefinition, FIELD_DEFINITIONS, getFieldsForType } from '../edit-dns.config';
import { EditDnsStep } from '../edit-dns.constants';
import { EditDnsWorkflowContext } from '../edit-dns.workflow.context';
import { MENU_ACTION_STRATEGIES } from '../strategies/menu.strategies';

export class EditMenuWorkflowStep implements WorkflowStep<EditDnsWorkflowContext> {
  readonly id = EditDnsStep.EDIT_MENU;

  async execute(
    conversation: Conversation<any>,
    ctx: Context,
    state: EditDnsWorkflowContext,
  ): Promise<IStepResult> {
    const record = state.getEffectiveRecord();
    const layoutKeys = getFieldsForType(record.type);

    let displayName = record.name;
    const zoneName = state.zoneName;
    if (zoneName) {
      const suffix = '.' + zoneName;
      if (displayName.endsWith(suffix)) {
        displayName = displayName.substring(0, displayName.length - suffix.length);
      }
    }

    let message = `✏️ <b>Editing Record</b>: ${displayName} (${record.type})\n\n`;

    for (const key of layoutKeys) {
      const def = FIELD_DEFINITIONS[key];
      if (!def) continue;

      const originalVal = this.resolveValue(state.originalRecord, def, key);
      const currentVal = this.resolveValue(record, def, key);

      message += this.formatChange(def.label, originalVal, currentVal);
    }

    message += `\n👇 Select a field to edit:`;

    const keyboard = new InlineKeyboard();
    let rowCount = 0;

    for (const key of layoutKeys) {
      const def = FIELD_DEFINITIONS[key];
      if (!def) continue;

      keyboard.text(def.label, Callback.dnsEditField(key));
      rowCount++;
      if (rowCount % 2 === 0) keyboard.row();
    }
    if (rowCount % 2 !== 0) keyboard.row();

    keyboard
      .text('💾 Save Changes', Callback.dnsSaveRecord())
      .text('❌ Cancel', Callback.dnsEditCancel());

    await ctx.reply(message, { reply_markup: keyboard, parse_mode: 'HTML' });

    const callback = await conversation.waitForCallbackQuery([
      CallbackPattern.dnsEditField(),
      CallbackPattern.dnsSaveRecord(),
    ]);
    await callback.answerCallbackQuery();

    const data = callback.callbackQuery.data;

    for (const strategy of MENU_ACTION_STRATEGIES) {
      if (strategy.matches(data)) {
        const result = await strategy.handle(ctx, state, data);
        if (result) return result;
      }
    }

    return new JumpToStepResult(EditDnsStep.EDIT_MENU);
  }

  private resolveValue(record: any, def: DnsFieldDefinition, key: string): any {
    if (!record) return undefined;
    if (def.path) {
      let val = record;
      for (const p of def.path) {
        val = val ? val[p] : undefined;
      }
      return val;
    }

    return record[key];
  }

  private formatChange(label: string, original: any, current: any) {
    const cleanLabel = label.includes(' ') ? label.split(' ').slice(1).join(' ') : label;

    if (String(original) !== String(current)) {
      return `🔹 <b>${cleanLabel}:</b> ${original} ➝ <b>${current}</b>\n`;
    }
    return `🔹 <b>${cleanLabel}:</b> ${current}\n`;
  }
}
