import { Context } from 'grammy';
import { InlineKeyboardMarkup, InlineKeyboardButton } from 'grammy/types';
import { WizardStep, WizardState, WizardConfig } from './wizard.interfaces';
import { CommonButtons } from '../ui/components/common-buttons';
import {
  WizardButtonBuilder,
  SelectButtonBuilder,
  BooleanButtonBuilder,
  SkipButtonBuilder,
} from './button-builders';

export class WizardRenderer {
  private readonly buttonBuilders: WizardButtonBuilder[] = [
    new SelectButtonBuilder(),
    new BooleanButtonBuilder(),
    new SkipButtonBuilder(),
  ];

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
    const buttons = this.buttonBuilders
      .filter((builder) => builder.canBuild(step))
      .flatMap((builder) => builder.build(step));

    buttons.push([CommonButtons.cancel()]);

    return { inline_keyboard: buttons };
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

    const prompt = config.confirmationPrompt || '⚠️ Подтвердить создание?';
    message += `\n${prompt}`;

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
      inline_keyboard: [[CommonButtons.confirm()], [CommonButtons.cancel()]],
    };
  }

}
