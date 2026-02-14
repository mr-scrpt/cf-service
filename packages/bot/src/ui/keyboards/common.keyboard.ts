import { InlineKeyboard } from 'grammy';

interface BooleanKeyboardOptions {
    trueCallback: string;
    falseCallback: string;
    cancelCallback: string;
    currentValue?: unknown;
    trueLabel?: string;
    falseLabel?: string;
    cancelLabel?: string;
}

export function buildBooleanKeyboard(opts: BooleanKeyboardOptions): InlineKeyboard {
    const {
        trueCallback,
        falseCallback,
        cancelCallback,
        currentValue,
        trueLabel = 'True',
        falseLabel = 'False',
        cancelLabel = '❌ Cancel'
    } = opts;

    return new InlineKeyboard()
        .text(currentValue === true ? `✅ ${trueLabel}` : trueLabel, trueCallback)
        .text(currentValue === false ? `✅ ${falseLabel}` : falseLabel, falseCallback)
        .row()
        .text(cancelLabel, cancelCallback);
}

interface SelectionOption {
    label: string;
    callback: string;
}

export function buildSelectionKeyboard(
    options: SelectionOption[],
    cancelCallback: string,
    cancelLabel: string = '❌ Cancel'
): InlineKeyboard {
    const kb = new InlineKeyboard();

    options.forEach((opt) => {
        kb.text(opt.label, opt.callback).row();
    });

    kb.text(cancelLabel, cancelCallback);
    return kb;
}
