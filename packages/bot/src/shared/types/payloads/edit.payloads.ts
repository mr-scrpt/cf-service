export interface EditDomainIndexPayload {
  idx: number;
}

export interface EditRecordSelectPayload {
  idx: number;
}

export interface EditFieldPayload {
  idx: number;
  field?: string;
}

export interface ConfirmFieldPayload {
  value: unknown;
}

export interface SaveAllPayload {
  idx: number;
}
