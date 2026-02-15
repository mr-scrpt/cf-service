import { Context, SessionFlavor } from 'grammy';
import { SessionManager } from '@services/session';
import { SessionKey } from '@shared/constants';
import { WizardConfig, WizardState, WizardStep } from './wizard.interfaces';
import { WizardValidator } from './wizard-validator';
import { WizardRenderer } from './wizard-renderer';
import { SessionData } from '@shared/types';

type SessionContext = Context & SessionFlavor<SessionData>;

export class WizardEngine {
  constructor(
    private readonly session: SessionManager,
    private readonly validator: WizardValidator,
    private readonly renderer: WizardRenderer
  ) {}

  async start(ctx: SessionContext, config: WizardConfig): Promise<void> {
    const state: WizardState = {
      currentStepIndex: 0,
      fields: {},
      metadata: config.metadata,
    };

    await this.session.set(ctx, SessionKey.WIZARD_STATE, state);
    await this.session.set(ctx, SessionKey.WIZARD_CONFIG, config);

    await this.renderCurrentStep(ctx, config, state);
  }

  async handleTextInput(ctx: SessionContext, input: string): Promise<void> {
    const config = await this.session.get<WizardConfig>(
      ctx,
      SessionKey.WIZARD_CONFIG
    );
    const state = await this.session.get<WizardState>(
      ctx,
      SessionKey.WIZARD_STATE
    );

    if (!config || !state) {
      return;
    }

    const currentStep = config.steps[state.currentStepIndex];

    const validation = this.validator.validate(currentStep.fieldConfig, input);

    if (!validation.success) {
      await ctx.reply(`❌ ${validation.error}\n\nPlease try again:`);
      return;
    }

    await this.saveFieldAndProceed(ctx, config, state, currentStep, validation.data);
  }

  async handleOptionSelect(ctx: SessionContext, optionValue: unknown): Promise<void> {
    const config = await this.session.get<WizardConfig>(
      ctx,
      SessionKey.WIZARD_CONFIG
    );
    const state = await this.session.get<WizardState>(
      ctx,
      SessionKey.WIZARD_STATE
    );

    if (!config || !state) {
      return;
    }

    const currentStep = config.steps[state.currentStepIndex];

    await this.saveFieldAndProceed(ctx, config, state, currentStep, optionValue);
  }

  async skip(ctx: SessionContext): Promise<void> {
    const config = await this.session.get<WizardConfig>(
      ctx,
      SessionKey.WIZARD_CONFIG
    );
    const state = await this.session.get<WizardState>(
      ctx,
      SessionKey.WIZARD_STATE
    );

    if (!config || !state) {
      return;
    }

    const currentStep = config.steps[state.currentStepIndex];

    if (currentStep.fieldConfig.required) {
      await ctx.reply('❌ This field is required and cannot be skipped.');
      return;
    }

    if (currentStep.fieldConfig.defaultValue !== undefined) {
      await this.saveFieldAndProceed(
        ctx,
        config,
        state,
        currentStep,
        currentStep.fieldConfig.defaultValue
      );
    } else {
      await this.moveToNextStep(ctx, config, state);
    }
  }

  async cancel(ctx: SessionContext): Promise<void> {
    const config = await this.session.get<WizardConfig>(
      ctx,
      SessionKey.WIZARD_CONFIG
    );

    await this.session.clear(ctx, SessionKey.WIZARD_STATE);
    await this.session.clear(ctx, SessionKey.WIZARD_CONFIG);

    if (config?.onCancel) {
      await config.onCancel(ctx);
    } else {
      await ctx.reply('❌ Operation cancelled');
    }
  }

  private async saveFieldAndProceed(
    ctx: SessionContext,
    config: WizardConfig,
    state: WizardState,
    step: WizardStep,
    value: unknown
  ): Promise<void> {
    state.fields[step.fieldConfig.key] = value;

    await this.moveToNextStep(ctx, config, state);
  }

  private async moveToNextStep(
    ctx: SessionContext,
    config: WizardConfig,
    state: WizardState
  ): Promise<void> {
    if (state.currentStepIndex < config.steps.length - 1) {
      state.currentStepIndex++;
      await this.session.set(ctx, SessionKey.WIZARD_STATE, state);
      await this.renderCurrentStep(ctx, config, state);
    } else {
      await this.showConfirmation(ctx, config, state);
    }
  }

  private async renderCurrentStep(
    ctx: SessionContext,
    config: WizardConfig,
    state: WizardState
  ): Promise<void> {
    const step = config.steps[state.currentStepIndex];
    await this.renderer.render(ctx, step, state, config.steps.length);
  }

  private async showConfirmation(
    ctx: SessionContext,
    config: WizardConfig,
    state: WizardState
  ): Promise<void> {
    await this.session.set(ctx, SessionKey.WIZARD_STATE, state);
    await this.renderer.renderConfirmation(ctx, state, config);
  }

  async confirm(ctx: SessionContext): Promise<void> {
    const config = await this.session.get<WizardConfig>(ctx, SessionKey.WIZARD_CONFIG);
    const state = await this.session.get<WizardState>(ctx, SessionKey.WIZARD_STATE);

    if (!config || !state) {
      return;
    }

    await this.complete(ctx, config, state);
  }

  private async complete(
    ctx: SessionContext,
    config: WizardConfig,
    state: WizardState
  ): Promise<void> {
    await this.session.clear(ctx, SessionKey.WIZARD_STATE);
    await this.session.clear(ctx, SessionKey.WIZARD_CONFIG);

    await config.onComplete(ctx, state.fields);
  }

  async isActive(ctx: SessionContext): Promise<boolean> {
    return await this.session.has(ctx, SessionKey.WIZARD_STATE);
  }
}
