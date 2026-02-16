import { Request, Response } from 'express';
import { RegistrationService } from '@application/services/registration.service';
import { ResponseHelper } from '@shared/utils/response.helper';
import { RequestParamsParser } from '@presentation/parsers';

export class RegistrationController {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly responseHelper: ResponseHelper
  ) {}

  async createRequest(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registrationService.createRequest(req.body);
      this.responseHelper.send(res, result, { successStatus: 201 });
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async listPending(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registrationService.listPending();
      this.responseHelper.send(res, result);
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async approve(req: Request, res: Response): Promise<void> {
    try {
      const requestId = RequestParamsParser.getStringParam(req.params, 'requestId');
      const { reviewedBy } = req.body;
      
      const result = await this.registrationService.approve({
        requestId,
        reviewedBy,
      });
      
      this.responseHelper.sendMessage(res, result, 'Registration request approved');
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }

  async reject(req: Request, res: Response): Promise<void> {
    try {
      const requestId = RequestParamsParser.getStringParam(req.params, 'requestId');
      const { reviewedBy } = req.body;
      
      const result = await this.registrationService.reject({
        requestId,
        reviewedBy,
      });
      
      this.responseHelper.sendMessage(res, result, 'Registration request rejected');
    } catch (error) {
      res.status(400).json({ success: false, message: error instanceof Error ? error.message : 'Invalid request' });
    }
  }
}
