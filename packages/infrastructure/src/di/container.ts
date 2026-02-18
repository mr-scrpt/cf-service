import {
  ICloudflareGateway,
  INotifier,
  RegisterDomainUseCase,
  AddUserUseCase,
  CheckUserAccessUseCase,
  ListUsersUseCase,
  RemoveUserUseCase,
  SendNotificationUseCase,
  SyncUsernameUseCase,
  CreateRegistrationRequestUseCase,
  ListPendingRequestsUseCase,
  ApproveRegistrationRequestUseCase,
  RejectRegistrationRequestUseCase,
  ILogger,
  IDatabaseService,
  ITelegramBot
} from '@cloudflare-bot/application';
import { IUserRepository, IDomainRepository, IRegistrationRequestRepository } from '@cloudflare-bot/domain';
import { MongoUserRepository, MongoDomainRepository, MongoRegistrationRequestRepository } from '../database/repositories';
import { MongooseDatabaseService } from '../database';
import { CloudflareClient } from '../cloudflare/cloudflare.client';
import { TelegramAdapter } from '../telegram';
import { Env } from '../config/env.schema';
import { DnsGatewayAdapter } from '../adapters/dns-gateway.adapter';

export class DIContainer {
  private userRepository?: IUserRepository;
  private domainRepository?: IDomainRepository;
  private registrationRequestRepository?: IRegistrationRequestRepository;
  private cloudflareGateway?: ICloudflareGateway;
  private telegramAdapter?: TelegramAdapter;
  private databaseService?: IDatabaseService;
  private dnsGatewayAdapter?: DnsGatewayAdapter;

  constructor(private config: Env, private logger: ILogger) {
  }

  getLogger(): ILogger {
    return this.logger;
  }

  getDatabaseService(): IDatabaseService {
    if (!this.databaseService) {
      this.databaseService = new MongooseDatabaseService(this.config.MONGODB_URI);
    }
    return this.databaseService;
  }
  
  getUserRepository(): IUserRepository {
    if (!this.userRepository) {
      this.userRepository = new MongoUserRepository();
    }
    return this.userRepository;
  }
  
  getDomainRepository(): IDomainRepository {
    if (!this.domainRepository) {
      this.domainRepository = new MongoDomainRepository();
    }
    return this.domainRepository;
  }

  getRegisterDomainUseCase(): RegisterDomainUseCase {
    return new RegisterDomainUseCase(this.getCloudflareGateway(), this.getDomainRepository());
  }

  getTelegramAdapter(): TelegramAdapter {
    if (!this.telegramAdapter) {
      this.telegramAdapter = new TelegramAdapter(this.config.TELEGRAM_BOT_TOKEN, this.logger);
    }
    return this.telegramAdapter;
  }
  
  getNotifier(): INotifier {
    return this.getTelegramAdapter();
  }

  getTelegramBot(): ITelegramBot {
    return this.getTelegramAdapter();
  }

  getCloudflareGateway(): ICloudflareGateway {
    if (!this.cloudflareGateway) {
      this.cloudflareGateway = new CloudflareClient(
        this.config.CLOUDFLARE_API_TOKEN,
        this.config.CLOUDFLARE_ACCOUNT_ID
      );
    }
    return this.cloudflareGateway;
  }

  getDnsGatewayAdapter(): DnsGatewayAdapter {
    if (!this.dnsGatewayAdapter) {
      this.dnsGatewayAdapter = new DnsGatewayAdapter(this.getCloudflareGateway());
    }
    return this.dnsGatewayAdapter;
  }

  getAddUserUseCase(): AddUserUseCase {
    return new AddUserUseCase(this.getUserRepository());
  }

  getCheckUserAccessUseCase(): CheckUserAccessUseCase {
    return new CheckUserAccessUseCase(this.getUserRepository());
  }

  getListUsersUseCase(): ListUsersUseCase {
    return new ListUsersUseCase(this.getUserRepository());
  }

  getRemoveUserUseCase(): RemoveUserUseCase {
    return new RemoveUserUseCase(this.getUserRepository());
  }

  getSyncUsernameUseCase(): SyncUsernameUseCase {
    return new SyncUsernameUseCase(this.getUserRepository());
  }

  getSendNotificationUseCase(): SendNotificationUseCase {
    return new SendNotificationUseCase(this.getNotifier(), this.config.ALLOWED_CHAT_ID);
  }

  getCreateRegistrationRequestUseCase(): CreateRegistrationRequestUseCase {
    return new CreateRegistrationRequestUseCase(this.getUserRepository(), this.getRegistrationRequestRepository());
  }

  getListPendingRequestsUseCase(): ListPendingRequestsUseCase {
    return new ListPendingRequestsUseCase(this.getRegistrationRequestRepository());
  }

  getApproveRegistrationRequestUseCase(): ApproveRegistrationRequestUseCase {
    return new ApproveRegistrationRequestUseCase(this.getUserRepository(), this.getRegistrationRequestRepository(), this.getNotifier());
  }

  getRejectRegistrationRequestUseCase(): RejectRegistrationRequestUseCase {
    return new RejectRegistrationRequestUseCase(this.getRegistrationRequestRepository(), this.getNotifier());
  }

  getRegistrationRequestRepository(): IRegistrationRequestRepository {
    if (!this.registrationRequestRepository) {
      this.registrationRequestRepository = new MongoRegistrationRequestRepository();
    }
    return this.registrationRequestRepository;
  }

  getUserService() {
    return {
      addUserUseCase: this.getAddUserUseCase(),
      listUsersUseCase: this.getListUsersUseCase(),
      removeUserUseCase: this.getRemoveUserUseCase(),
      logger: this.logger,
    };
  }

  getNotificationService() {
    return {
      sendNotificationUseCase: this.getSendNotificationUseCase(),
      logger: this.logger,
    };
  }

  getResponseHelper() {
    return { errorMapper: {} };
  }

  getRegistrationService() {
    return {
      createRequestUseCase: this.getCreateRegistrationRequestUseCase(),
      listPendingRequestsUseCase: this.getListPendingRequestsUseCase(),
      approveRequestUseCase: this.getApproveRegistrationRequestUseCase(),
      rejectRequestUseCase: this.getRejectRegistrationRequestUseCase(),
      logger: this.logger,
    };
  }
}
