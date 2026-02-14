import { Context } from 'grammy';
import { BotCommand } from '../base/command.interface';
import { buildMainMenuKeyboard } from '../../ui/menus/main.menu';

export class StartCommand implements BotCommand {
    readonly name = 'start';
    readonly description = 'Start the bot and show main menu';

    async execute(ctx: Context): Promise<void> {
        const welcomeText =
            `👋 <b>Welcome to CoolCinema Bot!</b>

I can help you manage your DNS records and Domains easily.
Select an option below to get started:`;

        await ctx.reply(welcomeText, {
            parse_mode: 'HTML',
            reply_markup: buildMainMenuKeyboard(),
        });
    }
}
