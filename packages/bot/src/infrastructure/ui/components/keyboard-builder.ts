import { InlineKeyboardButton, InlineKeyboardMarkup } from 'grammy/types';
import { CallbackAction } from '../../../shared/constants';

export class KeyboardBuilder {
  private buttons: InlineKeyboardButton[][] = [];

  addButton(text: string, action: CallbackAction, payload?: unknown): this {
    const callbackData = this.serializeCallback(action, payload);
    this.buttons.push([{ text, callback_data: callbackData }]);
    return this;
  }

  addRow(buttons: InlineKeyboardButton[]): this {
    this.buttons.push(buttons);
    return this;
  }

  addButtonsGrid(
    items: Array<{ text: string; action: CallbackAction; payload?: unknown }>,
    columns = 2
  ): this {
    for (let i = 0; i < items.length; i += columns) {
      const row = items.slice(i, i + columns).map((item) => ({
        text: item.text,
        callback_data: this.serializeCallback(item.action, item.payload),
      }));
      this.buttons.push(row);
    }
    return this;
  }

  addNavigation(options: {
    back?: boolean;
    cancel?: boolean;
    mainMenu?: boolean;
  }): this {
    const row: InlineKeyboardButton[] = [];

    if (options.back) {
      row.push({
        text: '⬅️ Back',
        callback_data: this.serializeCallback(CallbackAction.NAV_BACK),
      });
    }

    if (options.cancel) {
      row.push({
        text: '❌ Cancel',
        callback_data: this.serializeCallback(CallbackAction.NAV_CANCEL),
      });
    }

    if (options.mainMenu) {
      row.push({
        text: '🏠 Main Menu',
        callback_data: this.serializeCallback(CallbackAction.NAV_MAIN_MENU),
      });
    }

    if (row.length > 0) {
      this.buttons.push(row);
    }

    return this;
  }

  build(): InlineKeyboardMarkup {
    return { inline_keyboard: this.buttons };
  }

  private serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }
}
