import { ApiInitializer, InitializationContext } from '../initialization-context.interface';
import { createRegistrationRoutes } from '@infrastructure/http/routes/registration.routes';
import { createUserRoutes } from '@infrastructure/http/routes/users.routes';
import { createWebhookRoutes } from '@infrastructure/http/routes/webhooks.routes';
import { authMiddleware } from '@infrastructure/http/middleware/auth.middleware';
import { API_PREFIX, ROUTES } from '@shared/constants/routes';

export class RoutesInitializer implements ApiInitializer {
  async initialize(context: InitializationContext): Promise<void> {
    context.app.get(ROUTES.HEALTH, (req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
    
    context.app.use(API_PREFIX, createWebhookRoutes(context.container));
    
    context.app.use(
      API_PREFIX, 
      authMiddleware(context.env.API_AUTH_TOKEN), 
      createUserRoutes(context.container)
    );
    
    context.app.use(
      API_PREFIX, 
      authMiddleware(context.env.API_AUTH_TOKEN), 
      createRegistrationRoutes(context.container)
    );
  }
}
