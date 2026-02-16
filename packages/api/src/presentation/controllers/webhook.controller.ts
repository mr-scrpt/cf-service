import { Request, Response } from 'express';
import { WebhookService } from '@application/services/webhook.service';
import { ResponseHelper } from '@shared/utils/response.helper';

export class WebhookController {
  constructor(
    private readonly webhookService: WebhookService,
    private readonly responseHelper: ResponseHelper
  ) {}

  async handleNotification(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.webhookService.processWebhook(req.body);
      this.responseHelper.send(res, result, { successStatus: 202 });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }
}
