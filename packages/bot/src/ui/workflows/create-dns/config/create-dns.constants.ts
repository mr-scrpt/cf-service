export enum CreateDnsStep {
    SELECT_ZONE = 'select_zone',
    SELECT_TYPE = 'select_type',
    INPUT_WIZARD = 'input_wizard',
    CREATE_FIELD = 'create_field',
    CREATE_REVIEW = 'create_review',
    CREATE_RECORD = 'create_record'
}

export const CreateDnsTrigger = {
    TEXT: 'message:text'
} as const;

export enum CreateDnsAction {
    CREATE = 'create',
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
