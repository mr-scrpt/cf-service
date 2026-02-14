import { InlineKeyboard } from 'grammy';
import { Callback } from '../../../callbacks/callback-data';
import { FIELD_DEFINITIONS, getFieldsForType } from '../config/edit-dns.config';
import { formatRelativeName, resolveRecordValue } from '../utils/edit-dns.utils';
import { DnsRecord, DnsRecordType } from '@cloudflare-bot/shared';

/**
 * Builds the text message for the Edit Record menu.
 */
export function buildEditRecordMessage(record: DnsRecord, originalRecord: DnsRecord, zoneName?: string): string {
    const displayName = formatRelativeName(record.name, zoneName);
    let message = `✏️ <b>Editing Record</b>: ${displayName} (${record.type})\n\n`;

    const layoutKeys = getFieldsForType(record.type as DnsRecordType);

    for (const key of layoutKeys) {
        const def = FIELD_DEFINITIONS[key];
        if (!def) continue;

        const originalVal = resolveRecordValue(originalRecord, def, key);
        const currentVal = resolveRecordValue(record, def, key);

        message += formatChange(def.label, originalVal, currentVal);
    }

    message += `\n👇 Select a field to edit:`;
    return message;
}

/**
 * Builds the keyboard for the Edit Record menu.
 */
export function buildEditRecordKeyboard(recordType: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    const layoutKeys = getFieldsForType(recordType as DnsRecordType);
    let rowCount = 0;

    for (const key of layoutKeys) {
        const def = FIELD_DEFINITIONS[key];
        if (!def) continue;

        keyboard.text(def.label, Callback.dnsEditField(key));
        rowCount++;
        if (rowCount % 2 === 0) keyboard.row();
    }
    if (rowCount % 2 !== 0) keyboard.row();

    keyboard
        .text('💾 Save Changes', Callback.dnsSaveRecord())
        .text('❌ Cancel', Callback.dnsEditCancel());

    return keyboard;
}

function formatChange(label: string, original: any, current: any) {
    const cleanLabel = label.includes(' ') ? label.split(' ').slice(1).join(' ') : label;

    if (String(original) !== String(current)) {
        return `🔹 <b>${cleanLabel}:</b> ${original} ➝ <b>${current}</b>\n`;
    }
    return `🔹 <b>${cleanLabel}:</b> ${current}\n`;
}
