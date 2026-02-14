import { DnsRecordType } from '@cloudflare-bot/shared';
import { FlowStep } from '../constants';

export interface DomainSelectionPayload {
  zoneId: string;
  zoneName: string;
}

export interface DomainIndexPayload {
  idx: number;
}

export interface TypeSelectionPayload {
  type: DnsRecordType;
}

export interface ListRecordsPayload extends DomainSelectionPayload {
  page?: number;
}

export interface PaginationPayload {
  page: number;
}

export interface DeleteRecordSelectPayload {
  step: FlowStep;
  idx?: number;
}

export interface DeleteRecordConfirmPayload {
  idx: number;
}

export interface WizardOptionPayload {
  value: unknown;
}
