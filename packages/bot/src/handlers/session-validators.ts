import { SessionContext } from '../routing';
import { Domain, DnsRecord } from '@cloudflare-bot/shared';

export class SessionValidator {
  static getDomainByIndex(ctx: SessionContext, idx: number): Domain | null {
    const domains = ctx.session.tempDomains;
    if (!domains || !domains[idx]) {
      return null;
    }
    return domains[idx];
  }

  static getRecordByIndex(ctx: SessionContext, idx: number): DnsRecord | null {
    const records = ctx.session.tempRecords;
    if (!records || !records[idx]) {
      return null;
    }
    return records[idx];
  }

  static getSelectedZone(ctx: SessionContext): { zoneId: string; zoneName: string } | null {
    const { selectedZoneId, selectedZoneName } = ctx.session;
    if (!selectedZoneId || !selectedZoneName) {
      return null;
    }
    return { zoneId: selectedZoneId, zoneName: selectedZoneName };
  }

  static setSelectedZone(ctx: SessionContext, domain: Domain): void {
    ctx.session.selectedZoneId = domain.id;
    ctx.session.selectedZoneName = domain.name;
  }
}
