import { InlineKeyboard } from 'grammy';
import { MenuCallbacks, buildDnsMenuKeyboard, buildMainMenuKeyboard } from './main.menu';
import { MenuDefinition } from './menu.types';

export const MENU_DEFINITIONS: Record<string, MenuDefinition> = {
    [MenuCallbacks.main]: () => ({
        type: 'edit',
        text: `👋 <b>Welcome to CoolCinema Bot!</b>\n\nI can help you manage your DNS records and Domains easily.\nSelect an option below to get started:`,
        keyboard: buildMainMenuKeyboard()
    }),
    [MenuCallbacks.dns]: () => ({
        type: 'edit',
        text: `🌐 <b>DNS Management</b>\n\nManage your DNS records here. Select an action:`,
        keyboard: buildDnsMenuKeyboard()
    }),
    [MenuCallbacks.createDns]: () => ({
        type: 'conversation',
        name: 'createDns'
    }),
    [MenuCallbacks.delete]: () => ({
        type: 'conversation',
        name: 'deleteDns'
    }),
    [MenuCallbacks.domain]: () => ({
        type: 'edit',
        text: `🏰 <b>Domain Management</b>\n\nManage your domains here. Select an action:`,
        keyboard: new InlineKeyboard().text('Coming Soon', MenuCallbacks.noop).row().text('🔙 Back', MenuCallbacks.main)
    }),
    [MenuCallbacks.noop]: () => ({
        type: 'noop',
        message: 'Coming soon!'
    }),
};
