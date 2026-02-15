import { KeyboardBuilder } from '@infrastructure/ui/components';
import { CallbackAction } from '@shared/constants';

interface PaginationConfig {
  hasNext: boolean;
  hasPrev: boolean;
  currentPage: number;
}

export class PaginationBuilder {
  static buildPaginationButtons(config: PaginationConfig): KeyboardBuilder {
    const keyboard = new KeyboardBuilder();

    if (!config.hasNext && !config.hasPrev) {
      return keyboard;
    }

    const buttons = [];

    if (config.hasPrev) {
      buttons.push({
        text: '⬅️ Previous',
        callback_data: this.serializeCallback(CallbackAction.PAGE_PREV, {
          page: config.currentPage - 1,
        }),
      });
    }

    if (config.hasNext) {
      buttons.push({
        text: 'Next ➡️',
        callback_data: this.serializeCallback(CallbackAction.PAGE_NEXT, {
          page: config.currentPage + 1,
        }),
      });
    }

    keyboard.addRow(buttons);
    return keyboard;
  }

  private static serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }
}
