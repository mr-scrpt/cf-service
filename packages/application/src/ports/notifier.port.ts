export interface INotifier {
  sendMessage(chatId: number, message: string, options?: { parse_mode?: 'HTML' | 'Markdown' }): Promise<void>;
}
