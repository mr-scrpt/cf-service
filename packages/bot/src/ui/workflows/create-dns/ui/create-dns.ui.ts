import { InlineKeyboard } from 'grammy';
import { Callback } from '../../../callbacks/callback-data';
import { FIELD_DEFINITIONS, getFieldsForType } from '../config/create-dns.config';
import { DnsRecordType } from '@cloudflare-bot/shared';
import { DnsFieldName } from '../config/create-dns.constants';

/**
 * Builds the text message for the Create Record menu (Draft).
 */
export function buildCreateRecordMessage(draftRecord: Record<string, any>, zoneName?: string): string {
    const type = draftRecord.type || 'Unknown';
    let message = `🆕 <b>Creating Record</b>: ${zoneName || ''} (${type})\n\n`;

    if (draftRecord.type) {
        const layoutKeys = getFieldsForType(draftRecord.type as DnsRecordType);

        for (const key of layoutKeys) {
            const def = FIELD_DEFINITIONS[key];
            if (!def) continue;

            const val = resolveRecordValue(draftRecord, def, key);
            message += `🔹 <b>${def.label}:</b> ${val}\n`;
        }
    }

    message += `\n👇 Fill in the fields to create:`;
    return message;
}

/**
 * Builds the keyboard for the Create Record menu.
 */
export function buildCreateRecordKeyboard(recordType: string): InlineKeyboard {
    const keyboard = new InlineKeyboard();
    const layoutKeys = getFieldsForType(recordType as DnsRecordType);
    let rowCount = 0;

    for (const key of layoutKeys) {
        const def = FIELD_DEFINITIONS[key];
        if (!def) continue;

        keyboard.text(def.label, Callback.dnsEditField(key)); // Reusing dnsEditField generic callback
        rowCount++;
        if (rowCount % 2 === 0) keyboard.row();
    }
    if (rowCount % 2 !== 0) keyboard.row();

    // Uses generic 'dnsSaveRecord' pattern or we defined 'Create' strategy for it?
    // In menu.strategies.ts we check CreateDnsAction.CREATE which is 'create'.
    // We should probably use a dedicated callback 'dnsCreate' or reuse save if strategy maps 'save' to CREATE.
    // Let's us `Callback.dnsSaveRecord()` but in menu.strategies we handle it.
    // Wait, `dnsSaveRecord` produces `dns_save` type.
    // In `strategies/menu.strategies.ts`.
    // We didn't define mappings for `dns_save` type to `CreateDnsAction` yet (serialization does payload).
    // Let's use `Callback.dnsSaveRecord()` as the UI button, and in the Step we handle it.
    keyboard
        .text('✅ Create Record', Callback.dnsSaveRecord())
        .text('❌ Cancel', Callback.dnsEditCancel()); // Reusing generic cancel

    return keyboard;
}

function resolveRecordValue(record: any, def: any, key: string) {
    if (def.path && def.path[0] === 'data') {
        const subKey = def.path[1];
        return record.data?.[subKey] ?? '<i>empty</i>';
    }
    return record[key] ?? '<i>empty</i>';
}
