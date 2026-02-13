export interface NotifierPort {
  sendMessage(text: string): Promise<void>;

  sendFormattedMessage(text: string, parseMode?: 'HTML' | 'MarkdownV2'): Promise<void>;
}
