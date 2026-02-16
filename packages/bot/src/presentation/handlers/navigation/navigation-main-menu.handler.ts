import { CallbackHandler, SessionContext } from '@infrastructure/routing';
import { MainMenuFlow } from '@application/flows';

export class NavigationMainMenuHandler implements CallbackHandler<unknown> {
  constructor(private readonly mainMenu: MainMenuFlow) {}

  async handle(ctx: SessionContext): Promise<void> {
    await this.mainMenu.show(ctx);
  }
}
