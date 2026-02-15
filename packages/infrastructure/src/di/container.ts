import { IUserRepository, IDomainRepository } from '@cloudflare-bot/domain';
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
  ILogger,
  IDatabaseService
} from '@cloudflare-bot/application';

import { MongoUserRepository, MongoDomainRepository } from '../database/repositories';
import { MongooseDatabaseService } from '../database';
import { CloudflareAdapter } from '../cloudflare/cloudflare.adapter';
import { TelegramNotifierAdapter } from '../telegram/notifier.adapter';
import { Env } from '../config/env.schema';

export class DIContainer {
  private userRepository: IUserRepository;
  private domainRepository: IDomainRepository;
  private cloudflareGateway: ICloudflareGateway;
  private notifier: INotifier;
  private logger: ILogger;
  private databaseService: IDatabaseService;

  constructor(private config: Env, logger: ILogger) {
    this.logger = logger;
    this.databaseService = new MongooseDatabaseService(config.MONGODB_URI);
    this.userRepository = new MongoUserRepository();
    this.domainRepository = new MongoDomainRepository();
    this.cloudflareGateway = new CloudflareAdapter(
      config.CLOUDFLARE_API_TOKEN,
      config.CLOUDFLARE_ACCOUNT_ID
    );
    this.notifier = new TelegramNotifierAdapter(config.TELEGRAM_BOT_TOKEN);
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

  getAddUserUseCase(): AddUserUseCase {
    return new AddUserUseCase(this.userRepository);
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
}
