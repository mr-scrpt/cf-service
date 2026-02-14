import { Context } from 'grammy';
import { BotCommand } from '../base/command.interface';
import { CommandName, CallbackAction } from '../../constants';
import { KeyboardBuilder } from '../../ui/components';
import { logger } from '../../utils/logger';

export class StartCommand implements BotCommand {
    readonly name = CommandName.START;
    readonly description = 'Start the bot and show main menu';

    async execute(ctx: Context): Promise<void> {
        logger.debug('StartCommand.execute called', { 
            user_id: ctx.from?.id,
            chat_id: ctx.chat?.id 
        });
        
        const welcomeText =
            `👋 <b>Welcome to Cloudflare Management Bot!</b>

I can help you manage your Cloudflare resources.
Select a section:`;

        const keyboard = new KeyboardBuilder()
            .addButton('🌐 DNS Management', CallbackAction.DNS_MANAGEMENT)
            .addButton('🏢 Domain Management', CallbackAction.DOMAIN_MANAGEMENT);

        await ctx.reply(welcomeText, {
            parse_mode: 'HTML',
            reply_markup: keyboard.build(),
        });
        
        logger.info('Start menu sent to user', { user_id: ctx.from?.id });
    }
}
