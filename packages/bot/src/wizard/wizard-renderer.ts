import { Context } from 'grammy';
import { InlineKeyboardMarkup, InlineKeyboardButton } from 'grammy/types';
import { WizardStep, WizardState, WizardConfig } from './wizard.interfaces';
import { FieldInputType } from '../strategies/field-config.interface';
import { CallbackAction } from '../constants';

export class WizardRenderer {
  async render(
    ctx: Context,
    step: WizardStep,
    state: WizardState,
    totalSteps: number
  ): Promise<void> {
    const message = this.buildMessage(step, state, totalSteps);
    const keyboard = this.buildKeyboard(step);

    await ctx.reply(message, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }

  private buildMessage(
    step: WizardStep,
    state: WizardState,
    totalSteps: number
  ): string {
    const progress = `[${state.currentStepIndex + 1}/${totalSteps}]`;
    const label = `<b>${step.fieldConfig.label}</b>`;
    const prompt = step.customMessage || step.fieldConfig.prompt;

    let message = `${progress} ${label}\n\n${prompt}`;

    if (step.fieldConfig.helpText) {
      message += `\n\n💡 ${step.fieldConfig.helpText}`;
    }

    if (step.fieldConfig.defaultValue !== undefined) {
      message += `\n\n<i>Default: ${step.fieldConfig.defaultValue}</i>`;
    }

    return message;
  }

  private buildKeyboard(step: WizardStep): InlineKeyboardMarkup | undefined {
    const buttons: InlineKeyboardButton[][] = [];

    if (
      step.fieldConfig.inputType === FieldInputType.SELECT &&
      step.fieldConfig.options
    ) {
      step.fieldConfig.options.forEach((option) => {
        buttons.push([
          {
            text: option.label,
            callback_data: this.serializeCallback(
              CallbackAction.WIZARD_SELECT_OPTION,
              { value: option.value }
            ),
          },
        ]);
      });
    }

    if (step.fieldConfig.inputType === FieldInputType.BOOLEAN) {
      buttons.push([
        {
          text: '✅ Yes',
          callback_data: this.serializeCallback(
            CallbackAction.WIZARD_SELECT_OPTION,
            { value: true }
          ),
        },
        {
          text: '❌ No',
          callback_data: this.serializeCallback(
            CallbackAction.WIZARD_SELECT_OPTION,
            { value: false }
          ),
        },
      ]);
    }

    if (!step.fieldConfig.required) {
      buttons.push([
        {
          text: '⏭ Skip',
          callback_data: CallbackAction.WIZARD_SKIP,
        },
      ]);
    }

    buttons.push([
      {
        text: '❌ Cancel',
        callback_data: CallbackAction.NAV_CANCEL,
      },
    ]);

    return buttons.length > 0 ? { inline_keyboard: buttons } : undefined;
  }

  async renderConfirmation(
    ctx: Context,
    state: WizardState,
    config: WizardConfig
  ): Promise<void> {
    const summary = this.buildSummary(state, config);
    const keyboard = this.buildConfirmationKeyboard();

    await ctx.reply(summary, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  }

  private buildSummary(state: WizardState, config: WizardConfig): string {
    let message = '✅ <b>Проверьте данные перед созданием</b>\n\n';

    config.steps.forEach((step) => {
      const value = state.fields[step.fieldConfig.key];
      const displayValue = this.formatValue(value);
      message += `<b>${step.fieldConfig.label}:</b> <code>${displayValue}</code>\n`;
    });

    message += '\n⚠️ Создать DNS запись с этими данными?';

    return message;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return 'not set';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  }

  private buildConfirmationKeyboard(): InlineKeyboardMarkup {
    return {
      inline_keyboard: [
        [
          {
            text: '✅ Создать',
            callback_data: CallbackAction.WIZARD_CONFIRM,
          },
        ],
        [
          {
            text: '❌ Отменить',
            callback_data: CallbackAction.NAV_CANCEL,
          },
        ],
      ],
    };
  }

  private serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }
}
