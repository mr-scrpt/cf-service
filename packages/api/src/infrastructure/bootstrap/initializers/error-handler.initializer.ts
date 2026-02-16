import { ApiInitializer, InitializationContext } from '../initialization-context.interface';
import { errorHandler } from '../../../middleware/error-handler.middleware';

export class ErrorHandlerInitializer implements ApiInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.app.use(errorHandler);
  }
}
