import { DnsRecordType } from '@cloudflare-bot/shared';

/**
 * Базовый интерфейс для callback data
 * Open/Closed Principle: легко добавлять новые типы
 */
export interface CallbackData<T = unknown> {
    readonly type: string;
    readonly payload: T;
}

/**
 * Сериализатор/Десериализатор
 * Single Responsibility: только serialization/deserialization
 */
export class CallbackSerializer {
    static serialize<T>(data: CallbackData<T>): string {
        const payloadStr = data.payload !== undefined ? JSON.stringify(data.payload) : '';
        return payloadStr ? `${data.type}:${payloadStr}` : data.type;
    }

    static deserialize<T = unknown>(raw: string): CallbackData<T> {
        const colonIndex = raw.indexOf(':');
        if (colonIndex === -1) {
            return { type: raw, payload: undefined as T };
        }

        const type = raw.slice(0, colonIndex);
        const payloadStr = raw.slice(colonIndex + 1);

        return {
            type,
            payload: payloadStr ? (JSON.parse(payloadStr) as T) : (undefined as T),
        };
    }
}

/**
 * Константы типов callback (Domain-driven)
 * Single Source of Truth для всех callback actions
 */
export const CallbackType = {
    DNS_ZONE_SELECT: 'dns_zone',
    DNS_TYPE_SELECT: 'dns_type',
    DNS_TTL_SELECT: 'dns_ttl',
    DNS_PROXIED_SELECT: 'dns_proxied',
    DOMAIN_REGISTER: 'domain_register',
    CANCEL: 'cancel',
} as const;

export type CallbackType = (typeof CallbackType)[keyof typeof CallbackType];

/**
 * Типизированные payload интерфейсы
 */
export interface DnsZonePayload {
    zoneId: string;
}

export interface DnsTypePayload {
    recordType: DnsRecordType;
}

export interface DnsTtlPayload {
    ttl: number;
}

export interface DnsProxiedPayload {
    value: boolean;
}

/**
 * Type-safe фабрики (Factory Pattern)
 * Dependency Inversion: зависим от абстракции CallbackData
 */
export const Callback = {
    dnsZone: (zoneId: string): string =>
        CallbackSerializer.serialize<DnsZonePayload>({
            type: CallbackType.DNS_ZONE_SELECT,
            payload: { zoneId },
        }),

    dnsType: (recordType: DnsRecordType): string =>
        CallbackSerializer.serialize<DnsTypePayload>({
            type: CallbackType.DNS_TYPE_SELECT,
            payload: { recordType },
        }),

    dnsTtl: (ttl: number): string =>
        CallbackSerializer.serialize<DnsTtlPayload>({
            type: CallbackType.DNS_TTL_SELECT,
            payload: { ttl },
        }),

    dnsProxied: (value: boolean): string =>
        CallbackSerializer.serialize<DnsProxiedPayload>({
            type: CallbackType.DNS_PROXIED_SELECT,
            payload: { value },
        }),

    domainRegister: (): string =>
        CallbackSerializer.serialize({
            type: CallbackType.DOMAIN_REGISTER,
            payload: undefined,
        }),

    cancel: (): string =>
        CallbackSerializer.serialize({
            type: CallbackType.CANCEL,
            payload: undefined,
        }),
};

/**
 * Helper для создания regex паттернов для waitForCallbackQuery
 */
export const CallbackPattern = {
    dnsZone: () => new RegExp(`^${CallbackType.DNS_ZONE_SELECT}:`),
    dnsType: () => new RegExp(`^${CallbackType.DNS_TYPE_SELECT}:`),
    dnsTtl: () => new RegExp(`^${CallbackType.DNS_TTL_SELECT}:`),
    dnsProxied: () => new RegExp(`^${CallbackType.DNS_PROXIED_SELECT}:`),
    cancel: () => new RegExp(`^${CallbackType.CANCEL}$`),
};
