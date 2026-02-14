export interface ZoneAwareContext {
    setZoneId(id: string): void;
    getZoneId(): string | undefined;
}
