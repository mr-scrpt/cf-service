import { InlineKeyboard } from 'grammy';
import { Domain } from '@cloudflare-bot/shared';

export function buildMainMenuKeyboard(): InlineKeyboard {
  return new InlineKeyboard()
    .text('📋 Мои домены', 'domain:list')
    .row()
    .text('➕ Регистрация', 'domain:register');
}

export function buildDomainListKeyboard(domains: Domain[]): InlineKeyboard {
  const kb = new InlineKeyboard();

  domains.forEach((d) => {
    kb.text(`📍 ${d.name}`, `domain:view:${d.id}`).text('🌐', `dns:list:${d.id}`).row();
  });

  kb.text('➕ Добавить', 'domain:register');
  return kb;
}
