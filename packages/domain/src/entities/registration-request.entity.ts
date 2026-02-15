import { RequestId } from '../value-objects/request-id.vo';

export enum RequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class RegistrationRequest {
  private constructor(
    public readonly id: RequestId,
    public readonly telegramId: number,
    public readonly username: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    private _status: RequestStatus,
    public readonly requestedAt: Date,
    private _reviewedAt: Date | null = null,
    private _reviewedBy: string | null = null
  ) {}

  static create(params: {
    telegramId: number;
    username: string;
    firstName: string;
    lastName?: string | null;
  }): RegistrationRequest {
    return new RegistrationRequest(
      RequestId.create(),
      params.telegramId,
      params.username,
      params.firstName,
      params.lastName || null,
      RequestStatus.PENDING,
      new Date(),
      null,
      null
    );
  }

  static reconstruct(params: {
    id: RequestId;
    telegramId: number;
    username: string;
    firstName: string;
    lastName: string | null;
    status: RequestStatus;
    requestedAt: Date;
    reviewedAt: Date | null;
    reviewedBy: string | null;
  }): RegistrationRequest {
    return new RegistrationRequest(
      params.id,
      params.telegramId,
      params.username,
      params.firstName,
      params.lastName,
      params.status,
      params.requestedAt,
      params.reviewedAt,
      params.reviewedBy
    );
  }

  get status(): RequestStatus {
    return this._status;
  }

  get reviewedAt(): Date | null {
    return this._reviewedAt;
  }

  get reviewedBy(): string | null {
    return this._reviewedBy;
  }

  isPending(): boolean {
    return this._status === RequestStatus.PENDING;
  }

  isApproved(): boolean {
    return this._status === RequestStatus.APPROVED;
  }

  isRejected(): boolean {
    return this._status === RequestStatus.REJECTED;
  }

  approve(reviewedBy: string): void {
    if (!this.isPending()) {
      throw new Error('Only pending requests can be approved');
    }
    this._status = RequestStatus.APPROVED;
    this._reviewedAt = new Date();
    this._reviewedBy = reviewedBy;
  }

  reject(reviewedBy: string): void {
    if (!this.isPending()) {
      throw new Error('Only pending requests can be rejected');
    }
    this._status = RequestStatus.REJECTED;
    this._reviewedAt = new Date();
    this._reviewedBy = reviewedBy;
  }
}
