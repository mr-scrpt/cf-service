import { InlineKeyboardButton } from 'grammy/types';
import { CallbackAction } from '../../../shared/constants';

/**
 * Factory for commonly used buttons across the application.
 * Centralizes button text and styling for consistency.
 */
export class CommonButtons {
  private static serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }

  static yes(payload?: unknown): InlineKeyboardButton {
    return {
      text: '✅ Yes',
      callback_data: this.serializeCallback(CallbackAction.WIZARD_SELECT_OPTION, payload || { value: true }),
    };
  }

  static no(payload?: unknown): InlineKeyboardButton {
    return {
      text: '❌ No',
      callback_data: this.serializeCallback(CallbackAction.WIZARD_SELECT_OPTION, payload || { value: false }),
    };
  }

  static skip(): InlineKeyboardButton {
    return {
      text: '⏭ Skip',
      callback_data: CallbackAction.WIZARD_SKIP,
    };
  }

  static cancel(): InlineKeyboardButton {
    return {
      text: '❌ Cancel',
      callback_data: CallbackAction.NAV_CANCEL,
    };
  }

  static confirm(): InlineKeyboardButton {
    return {
      text: '✅ Confirm',
      callback_data: CallbackAction.WIZARD_CONFIRM,
    };
  }

  static back(): InlineKeyboardButton {
    return {
      text: '⬅️ Back',
      callback_data: CallbackAction.NAV_BACK,
    };
  }

  static option(label: string, value: unknown): InlineKeyboardButton {
    return {
      text: label,
      callback_data: this.serializeCallback(CallbackAction.WIZARD_SELECT_OPTION, { value }),
    };
  }
}
