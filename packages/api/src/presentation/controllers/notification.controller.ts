import { Request, Response } from 'express';
import { NotificationService } from '@application/services/notification.service';
import { ResponseHelper } from '@shared/utils/response.helper';
import type { NotificationPayloadDto } from '@cloudflare-bot/application';

export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly responseHelper: ResponseHelper
  ) {}

  async handleNotification(req: Request, res: Response): Promise<void> {
    try {
      const payload: NotificationPayloadDto = {
        method: req.method,
        ip: this.extractIP(req),
        headers: req.headers,
        body: req.body,
        timestamp: new Date(),
      };

      const result = await this.notificationService.processNotification(payload);
      this.responseHelper.send(res, result, { successStatus: 202 });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async getInfo(req: Request, res: Response): Promise<void> {
    res.json({
      status: 'ready',
      message: 'Send POST request with JSON body to trigger Telegram notification',
      your_ip: this.extractIP(req),
      endpoint: '/api/notify',
    });
  }

  private extractIP(req: Request): string {
    const ip = req.ip || req.socket.remoteAddress || '';
    
    if (ip === '::1' || ip === '::ffff:127.0.0.1' || ip === '127.0.0.1') {
      return 'localhost';
    }
    
    if (ip.startsWith('::ffff:')) {
      return ip.substring(7);
    }
    
    return ip || 'unknown';
  }
}
