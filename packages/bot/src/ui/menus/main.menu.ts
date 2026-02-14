import { InlineKeyboard } from 'grammy';
import { Callback } from '../callbacks/callback-data';

export const MenuCallbacks = {
    main: 'menu:main',
    dns: 'menu:dns',
    domain: 'menu:domain',
    help: 'menu:help',
    createDns: 'dns:create',
    delete: 'dns:delete',
    noop: 'menu:noop',
};

export function buildMainMenuKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text('🌐 DNS Management', MenuCallbacks.dns)
        .text('🏰 Domain Management', MenuCallbacks.domain)
        .row()
        .text('❓ Help', MenuCallbacks.help);
}

export function buildDnsMenuKeyboard(): InlineKeyboard {
    return new InlineKeyboard()
        .text('📝 Create Record', 'dns:create') // Triggers conversation
        .text('📋 List Records', 'dns:list')
        .row()
        .text('✏️ Edit Record', 'dns:edit')
        .text('🗑️ Delete Record', MenuCallbacks.delete)
        .row()
        .text('🔙 Back', MenuCallbacks.main);
}
