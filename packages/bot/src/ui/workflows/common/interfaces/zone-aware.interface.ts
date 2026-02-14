export interface ZoneAwareContext {
    setZoneId(id: string): void;
    getZoneId(): string | undefined;
    setZoneName(name: string): void;
    getZoneName(): string | undefined;
}
