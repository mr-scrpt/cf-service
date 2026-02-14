/**
 * Templates for User Input Prompts
 */

export function formatTextInputPrompt(label: string, currentValue: unknown): string {
    return (
        `Editing <b>${label}</b>\n` +
        `Current Value: <code>${currentValue}</code>\n\n` +
        `Enter new value:`
    );
}

export function formatNumberInputPrompt(label: string, currentValue: unknown): string {
    return (
        `Editing <b>${label}</b>\n` +
        `Current Value: <code>${currentValue}</code>\n\n` +
        `Enter new number:`
    );
}

export function formatSelectInputPrompt(label: string, currentValue: unknown): string {
    return `Select new ${label} (Current: ${currentValue}):`;
}

export function formatBooleanInputPrompt(label: string): string {
    return `Set ${label}:`;
}

export const InputMessages = {
    INVALID_NUMBER: '❌ Invalid number. Operation cancelled.',
    CANCELLED: 'Cancelled.',
    ERROR_UNKNOWN_FIELD: (key: string) => `⚠️ Error: Unknown field configuration for '${key}'.`,
    ERROR_NO_STRATEGY: (type: string) => `⚠️ Error: No strategy found for input type '${type}'.`,
} as const;
