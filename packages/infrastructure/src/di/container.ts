import {
  ICloudflareGateway,
  INotifier,
  RegisterDomainUseCase,
  AddUserUseCase,
  CheckUserAccessUseCase,
  ListUsersUseCase,
  RemoveUserUseCase,
  SendWebhookNotificationUseCase,
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

export class DIContainer {
  private userRepository: IUserRepository;
  private domainRepository: IDomainRepository;
  private registrationRequestRepository: IRegistrationRequestRepository;
  private cloudflareGateway: ICloudflareGateway;
  private notifier: INotifier;
  private telegramBot: ITelegramBot;
  private logger: ILogger;
  private databaseService: IDatabaseService;

  constructor(private config: Env, logger: ILogger) {
    this.logger = logger;
    this.databaseService = new MongooseDatabaseService(config.MONGODB_URI);
    this.userRepository = new MongoUserRepository();
    this.domainRepository = new MongoDomainRepository();
    this.registrationRequestRepository = new MongoRegistrationRequestRepository();
    this.cloudflareGateway = new CloudflareClient(
      config.CLOUDFLARE_API_TOKEN,
      config.CLOUDFLARE_ACCOUNT_ID
    );
    
    const telegramAdapter = new TelegramAdapter(config.TELEGRAM_BOT_TOKEN, logger);
    this.notifier = telegramAdapter;
    this.telegramBot = telegramAdapter;
  }

  getLogger(): ILogger {
    return this.logger;
  }

  getDatabaseService(): IDatabaseService {
    return this.databaseService;
  }

  getRegisterDomainUseCase(): RegisterDomainUseCase {
    return new RegisterDomainUseCase(this.cloudflareGateway, this.domainRepository);
  }

  getNotifier(): INotifier {
    return this.notifier;
  }

  getTelegramBot(): ITelegramBot {
    return this.telegramBot;
  }

  getTelegramAdapter(): TelegramAdapter {
    const telegramAdapter = new TelegramAdapter(this.config.TELEGRAM_BOT_TOKEN, this.logger);
    return telegramAdapter;
  }

  getCloudflareGateway(): ICloudflareGateway {
    return this.cloudflareGateway;
  }

  getAddUserUseCase(): AddUserUseCase {
    return new AddUserUseCase(this.userRepository, this.telegramBot);
  }

  getCheckUserAccessUseCase(): CheckUserAccessUseCase {
    return new CheckUserAccessUseCase(this.userRepository);
  }

  getListUsersUseCase(): ListUsersUseCase {
    return new ListUsersUseCase(this.userRepository);
  }

  getRemoveUserUseCase(): RemoveUserUseCase {
    return new RemoveUserUseCase(this.userRepository);
  }

  getSyncUsernameUseCase(): SyncUsernameUseCase {
    return new SyncUsernameUseCase(this.userRepository);
  }

  getSendWebhookNotificationUseCase(): SendWebhookNotificationUseCase {
    return new SendWebhookNotificationUseCase(this.notifier, this.config.ALLOWED_CHAT_ID);
  }

  getCreateRegistrationRequestUseCase(): CreateRegistrationRequestUseCase {
    return new CreateRegistrationRequestUseCase(this.userRepository, this.registrationRequestRepository);
  }

  getListPendingRequestsUseCase(): ListPendingRequestsUseCase {
    return new ListPendingRequestsUseCase(this.registrationRequestRepository);
  }

  getApproveRegistrationRequestUseCase(): ApproveRegistrationRequestUseCase {
    return new ApproveRegistrationRequestUseCase(this.userRepository, this.registrationRequestRepository, this.notifier);
  }

  getRejectRegistrationRequestUseCase(): RejectRegistrationRequestUseCase {
    return new RejectRegistrationRequestUseCase(this.registrationRequestRepository, this.notifier);
  }

  getRegistrationRequestRepository(): IRegistrationRequestRepository {
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

  getWebhookService() {
    return {
      sendNotificationUseCase: this.getSendWebhookNotificationUseCase(),
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
