import { INotifier } from '../../ports/notifier.port';
import { WebhookPayloadDto } from '../../dto/webhook-payload.dto';

export class SendWebhookNotificationUseCase {
  constructor(
    private readonly notifier: INotifier,
    private readonly adminChatId: number
  ) {}

  async execute(payload: WebhookPayloadDto): Promise<void> {
    const message = this.formatMessage(payload);
    await this.notifier.sendMessage(this.adminChatId, message, { parse_mode: 'HTML' });
  }

  private formatMessage(payload: WebhookPayloadDto): string {
    const lines = [
      '<b>🔔 Webhook Received</b>',
      '',
      `<b>Method:</b> ${payload.method}`,
      `<b>IP:</b> <code>${payload.ip}</code>`,
      `<b>Time:</b> ${payload.timestamp.toISOString()}`,
    ];

    if (payload.headers && Object.keys(payload.headers).length > 0) {
      lines.push('', '<b>Headers:</b>');
      Object.entries(payload.headers).forEach(([key, value]) => {
        if (value) {
          lines.push(`  <code>${key}</code>: ${Array.isArray(value) ? value.join(', ') : value}`);
        }
      });
    }

    if (payload.body) {
      lines.push('', '<b>Body:</b>');
      lines.push(`<pre>${JSON.stringify(payload.body, null, 2)}</pre>`);
    }

    return lines.join('\n');
  }
}
