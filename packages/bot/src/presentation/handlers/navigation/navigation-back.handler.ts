import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { MainMenu } from '@application/flows';

export class NavigationBackHandler implements CallbackHandler<unknown> {
  constructor(private readonly mainMenu: MainMenu) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.mainMenu.show(ctx);
  }
}
