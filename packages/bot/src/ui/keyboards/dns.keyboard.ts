import { InlineKeyboard } from 'grammy';
import { Domain } from '@cloudflare-bot/shared';
import { DNS_TYPE_UI_CONFIG, TTL_PRESETS, PROXIED_OPTIONS } from '../data';
import { Callback } from '../callbacks/callback-data';

// DNS Type
export function buildDnsTypeKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();

  const common = DNS_TYPE_UI_CONFIG.filter((c) => c.group === 'common');
  const advanced = DNS_TYPE_UI_CONFIG.filter((c) => c.group === 'advanced');

  common.forEach((c) => kb.text(c.label, Callback.dnsType(c.type)));
  kb.row();

  advanced.forEach((c) => kb.text(c.label, Callback.dnsType(c.type)));
  kb.row().text('❌ Отмена', Callback.cancel());

  return kb;
}

// Zone List
export function buildZoneListKeyboard(zones: Domain[]): InlineKeyboard {
  const kb = new InlineKeyboard();

  zones.forEach((z) => kb.text(z.name, Callback.dnsZone(z.id)).row());
  kb.text('❌ Отмена', Callback.cancel());

  return kb;
}

// TTL
export function buildTtlKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();

  TTL_PRESETS.forEach((p, i) => {
    kb.text(p.label, Callback.dnsTtl(p.value));
    if ((i + 1) % 2 === 0) kb.row();
  });

  return kb;
}

// Proxied
export function buildProxiedKeyboard(): InlineKeyboard {
  const kb = new InlineKeyboard();

  PROXIED_OPTIONS.forEach((o) => {
    kb.text(`${o.emoji} ${o.label}`, Callback.dnsProxied(o.value)).row();
  });

  return kb;
}
