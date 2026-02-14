import { DnsRecordType } from '@cloudflare-bot/shared';
import { DnsRecordHandler } from './dns-record.handler';
import { StandardRecordHandler } from './standard-record.handler';
import { MxRecordHandler } from './mx-record.handler';
import { SrvRecordHandler } from './srv-record.handler';

export class DnsHandlerFactory {
    static getHandler(type: DnsRecordType): DnsRecordHandler {
        switch (type) {
            case DnsRecordType.MX:
                return new MxRecordHandler();
            case DnsRecordType.SRV:
                return new SrvRecordHandler();
            default:
                return new StandardRecordHandler();
        }
    }
}
