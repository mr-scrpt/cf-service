import { Context, SessionFlavor } from 'grammy';
import { ConversationFlavor } from '@grammyjs/conversations';
import { Domain, DnsRecord } from '@cloudflare-bot/shared';

export interface WizardState {
  currentStepIndex: number;
  fields: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

export interface EditingRecordData {
  recordId: string;
  zoneId: string;
  fieldKey?: string;
  currentValues: Record<string, unknown>;
}

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface SessionData {
  wizard_state?: WizardState;
  wizard_config?: unknown;
  editing_record?: EditingRecordData;
  selected_domain?: string;
  current_flow?: string;
  pagination_state?: PaginationState;
  tempDomains?: Domain[];
  selectedZoneId?: string;
  selectedZoneName?: string;
  tempRecords?: DnsRecord[];
  currentPage?: number;
}

export type BotContext = Context & SessionFlavor<SessionData> & ConversationFlavor<Context>;
