export enum EditDnsStep {
    SELECT_ZONE = 'select_zone',
    SELECT_RECORD = 'select_record',
    EDIT_MENU = 'edit_menu',
    EDIT_FIELD = 'edit_field',
    SAVE_CHANGES = 'save_changes'
}

export const EditDnsTrigger = {
    TEXT: 'message:text'
} as const;

export enum EditDnsAction {
    SAVE = 'save',
    CANCEL = 'cancel',
    SET = 'set',
    PREV = 'prev',
    NEXT = 'next',
    NOOP = 'noop'
}

export enum DnsInputType {
    TEXT = 'text',
    NUMBER = 'number',
    SELECT = 'select',
    BOOLEAN = 'boolean'
}

export const DnsFieldName = {
    NAME: 'name',
    CONTENT: 'content',
    TTL: 'ttl',
    PROXIED: 'proxied',
    PRIORITY: 'priority',
    SRV_PRIORITY: 'srv_priority',
    SRV_WEIGHT: 'srv_weight',
    SRV_PORT: 'srv_port',
    SRV_TARGET: 'srv_target'
} as const;

export type DnsFieldName = typeof DnsFieldName[keyof typeof DnsFieldName];
