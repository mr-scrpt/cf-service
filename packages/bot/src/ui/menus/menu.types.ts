import { InlineKeyboard } from 'grammy';

export type MenuActionType = 'edit' | 'conversation' | 'noop';

export type MenuResult =
    | { type: 'edit'; text: string; keyboard: InlineKeyboard }
    | { type: 'conversation'; name: string }
    | { type: 'noop'; message?: string };

export type MenuDefinition = () => MenuResult;
