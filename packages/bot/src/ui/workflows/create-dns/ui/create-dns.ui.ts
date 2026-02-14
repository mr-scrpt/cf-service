import { InlineKeyboard } from 'grammy';
import { Callback } from '../../../callbacks/callback-data';
import { FIELD_DEFINITIONS, getFieldsForType } from '../config/create-dns.config';
import { DnsRecordType } from '@cloudflare-bot/shared';
// Import schema for validation
import { createDnsRecordSchema } from '@cloudflare-bot/shared/dist/domain/dns-record.schema';

/**
 * Validates the draft record and returns success status and formatted error/missing fields.
 */
export function validateDraft(draft: Record<string, any>, zoneId: string = 'placeholder') {
    // We need a dummy zoneId for validation if it's not set in draft (it usually isn't)
    // The schema requires zoneId.
    const payload = { ...draft, zoneId };
    const result = createDnsRecordSchema.safeParse(payload);
    return result;
}

/**
 * Builds the text message for the Create Record menu (Draft).
 */
export function buildCreateRecordMessage(draftRecord: Record<string, any>, zoneName?: string): string {
    const type = draftRecord.type || 'Unknown';
    let message = `🆕 <b>Creating Record</b>: ${zoneName || ''} (${type})\n\n`;

    // specific validation for field highlighting
    // We can't easily valid individual fields with Zod discriminators without full payload,
    // but we can check if the value is missing/empty against the definition.

    if (draftRecord.type) {
        const layoutKeys = getFieldsForType(draftRecord.type as DnsRecordType);

        for (const key of layoutKeys) {
            const def = FIELD_DEFINITIONS[key];
            if (!def) continue;

            const val = resolveRecordValue(draftRecord, def, key);

            // formatting
            let icon = '';
            // Simple check: is it empty/missing?
            // Real validation is complex, but for UI feedback:
            const rawVal = resolveRawValue(draftRecord, def, key);
            const isEmpty = rawVal === undefined || rawVal === '' || rawVal === null;

            // TTL and Proxied usually have defaults, but if user explicitly sets them they might be valid.
            // Text fields are required.
            if (isEmpty) {
                icon = ' ❌ <i>(Required)</i>';
            } else {
                icon = ' ✅';
            }

            message += `🔹 <b>${def.label}:</b> ${val}${icon}\n`;
        }
    }

    const validation = validateDraft(draftRecord);
    if (!validation.success) {
        message += `\n⚠️ <i>Some fields are missing or invalid.</i>`;
    }

    message += `\n👇 Fill in the fields to create:`;
    return message;
}

/**
 * Builds the keyboard for the Create Record menu.
 */
export function buildCreateRecordKeyboard(recordType: string, draftRecord: Record<string, any>): InlineKeyboard {
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

    const isValid = validateDraft(draftRecord).success;
    const createLabel = isValid ? '✅ Create Record' : '⚠️ Create Record (Incomplete)';

    keyboard
        .text(createLabel, Callback.dnsSaveRecord())
        .text('❌ Cancel', Callback.dnsEditCancel());

    return keyboard;
}

function resolveRawValue(record: any, def: any, key: string) {
    if (def.path && def.path[0] === 'data') {
        const subKey = def.path[1];
        return record.data?.[subKey];
    }
    return record[key];
}

function resolveRecordValue(record: any, def: any, key: string) {
    const raw = resolveRawValue(record, def, key);
    return raw ?? '<i>empty</i>';
}
