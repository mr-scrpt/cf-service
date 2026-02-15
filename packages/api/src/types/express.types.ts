import { Request, Response, NextFunction } from 'express';

export interface TypedRequestBody<T> extends Request {
  body: T;
}

export interface TypedRequestParams<T extends Record<string, string>> extends Request {
  params: T;
}

export interface TypedRequest<P extends Record<string, string> = {}, B = {}> extends Request {
  params: P;
  body: B;
}

export type AsyncHandler<Req = Request, Res = Response> = (
  req: Req,
  res: Res,
  next: NextFunction
) => Promise<void> | void;

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
}
