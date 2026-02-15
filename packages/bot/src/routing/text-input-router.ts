import { Context, SessionFlavor } from 'grammy';
import { SessionData } from '../types';
import { WizardEngine } from '../wizard';
import { EditDnsFlow } from '../flows';

type SessionContext = Context & SessionFlavor<SessionData>;
type TextInputHandler = (ctx: SessionContext, text: string) => Promise<boolean>;

/**
 * Declarative router for text input handling.
 * Uses Chain of Responsibility pattern - each handler decides if it can process the input.
 */
export class TextInputRouter {
  private handlers: TextInputHandler[] = [];

  constructor(
    private readonly wizardEngine: WizardEngine,
    private readonly editFlow: EditDnsFlow
  ) {
    this.registerHandlers();
  }

  private registerHandlers(): void {
    this.handlers = [
      this.handleWizardInput.bind(this),
      this.handleEditFieldInput.bind(this),
    ];
  }

  async route(ctx: SessionContext, text: string): Promise<boolean> {
    for (const handler of this.handlers) {
      const handled = await handler(ctx, text);
      if (handled) {
        return true;
      }
    }
    return false;
  }

  private async handleWizardInput(ctx: SessionContext, text: string): Promise<boolean> {
    const isActive = await this.wizardEngine.isActive(ctx);
    if (isActive) {
      await this.wizardEngine.handleTextInput(ctx, text);
      return true;
    }
    return false;
  }

  private async handleEditFieldInput(ctx: SessionContext, text: string): Promise<boolean> {
    const isEditing = ctx.session.editField !== undefined;
    if (isEditing) {
      await this.editFlow.validateFieldInput(ctx, text);
      return true;
    }
    return false;
  }
}
