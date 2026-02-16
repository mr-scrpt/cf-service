import { ApiInitializer, InitializationContext } from '../initialization-context.interface';
import { createWebhookRoutes } from '../../../routes/webhooks.routes';
import { createUserRoutes } from '../../../routes/users.routes';
import { createRegistrationRoutes } from '../../../routes/registration.routes';
import { authMiddleware } from '../../../middleware/auth.middleware';
import { API_PREFIX, ROUTES } from '../../../constants/routes';

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
