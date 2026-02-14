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

I can help you manage your DNS records and Domains easily.
Select an option below to get started:`;

        const keyboard = new KeyboardBuilder()
            .addButton('🌐 DNS Management', CallbackAction.DNS_MANAGEMENT)
            .addButton('📋 List DNS Records', CallbackAction.DNS_LIST_DOMAIN)
            .addButton('🗑 Delete DNS Record', CallbackAction.DNS_DELETE_SELECT);

        await ctx.reply(welcomeText, {
            parse_mode: 'HTML',
            reply_markup: keyboard.build(),
        });
        
        logger.info('Start menu sent to user', { user_id: ctx.from?.id });
    }
}
