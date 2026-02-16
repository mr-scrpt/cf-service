import { InlineKeyboardButton, InlineKeyboardMarkup } from 'grammy/types';
import { CallbackAction } from '@shared/constants';

import { IPaginationComponent, PaginationConfig, PaginationResult } from './pagination.interface';

export class PaginationComponent implements IPaginationComponent {
  paginate<T>(config: PaginationConfig<T>): PaginationResult {
    const { items, pageSize, currentPage, renderItem, renderEmpty } = config;

    if (items.length === 0) {
      return {
        message: renderEmpty ? renderEmpty() : 'No items found',
        hasNext: false,
        hasPrev: false,
        totalPages: 0,
      };
    }

    const totalPages = Math.ceil(items.length / pageSize);
    const start = currentPage * pageSize;
    const end = start + pageSize;
    const pageItems = items.slice(start, end);

    const itemsText = pageItems
      .map((item, i) => renderItem(item, start + i))
      .join('\n\n');
    const footer = `\n\n📄 Page ${currentPage + 1} of ${totalPages} (${items.length} total)`;

    return {
      message: itemsText + footer,
      hasNext: currentPage < totalPages - 1,
      hasPrev: currentPage > 0,
      totalPages,
    };
  }

  buildPaginationKeyboard(
    hasNext: boolean,
    hasPrev: boolean,
    currentPage: number,
    context?: Record<string, unknown>
  ): InlineKeyboardMarkup {
    const row: InlineKeyboardButton[] = [];

    if (hasPrev) {
      row.push({
        text: '⬅️ Previous',
        callback_data: this.serializeCallback(CallbackAction.PAGE_PREV, {
          page: currentPage - 1,
          ...(context || {}),
        }),
      });
    }

    if (hasNext) {
      row.push({
        text: 'Next ➡️',
        callback_data: this.serializeCallback(CallbackAction.PAGE_NEXT, {
          page: currentPage + 1,
          ...(context || {}),
        }),
      });
    }

    return { inline_keyboard: row.length > 0 ? [row] : [] };
  }

  private serializeCallback(action: CallbackAction, payload?: unknown): string {
    if (!payload) return action;
    return `${action}:${JSON.stringify(payload)}`;
  }
}
