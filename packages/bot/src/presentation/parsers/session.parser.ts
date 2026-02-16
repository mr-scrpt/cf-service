import { SessionContext } from '@shared/types/bot-context.type';
import { DomainDto, DnsRecordDto } from '@cloudflare-bot/application';

export class SessionParser {
  static getDomainByIndex(ctx: SessionContext, idx: number): DomainDto | null {
    const domains = ctx.session.tempDomains;
    if (!domains || !domains[idx]) {
      return null;
    }
    return domains[idx];
  }

  static getRecordByIndex(ctx: SessionContext, idx: number): DnsRecordDto | null {
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

  static setSelectedZone(ctx: SessionContext, domain: DomainDto): void {
    ctx.session.selectedZoneId = domain.id;
    ctx.session.selectedZoneName = domain.name;
  }
}
