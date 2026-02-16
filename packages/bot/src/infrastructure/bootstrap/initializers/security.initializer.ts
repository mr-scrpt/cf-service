import { BotInitializer, InitializationContext } from '@infrastructure/bootstrap/initialization-context.interface';
import { initAuthGuard } from '@infrastructure/middleware/auth.middleware';

export class SecurityInitializer implements BotInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    initAuthGuard(context.container);
  }
}
