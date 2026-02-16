export type DomainStatus = 
  | 'active' 
  | 'pending' 
  | 'initializing' 
  | 'moved' 
  | 'deleted' 
  | 'deactivated' 
  | 'read_only' 
  | 'unknown';

export interface DomainDto {
  id: string;
  name: string;
  status: DomainStatus;
  nameservers: string[];
}
