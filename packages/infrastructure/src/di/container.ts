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
} from '@cloudflare-bot/application';

import { MongoUserRepository, MongoDomainRepository } from '../database/repositories';
import { CloudflareAdapter } from '../cloudflare/cloudflare.adapter';
import { TelegramNotifierAdapter } from '../telegram/notifier.adapter';
import { Env } from '../config/env.schema';

export class DIContainer {
  private userRepository: IUserRepository;
  private domainRepository: IDomainRepository;
  private cloudflareGateway: ICloudflareGateway;
  private notifier: INotifier;

  constructor(private config: Env) {
    this.userRepository = new MongoUserRepository();
    this.domainRepository = new MongoDomainRepository();
    this.cloudflareGateway = new CloudflareAdapter(
      config.CLOUDFLARE_API_TOKEN,
      config.CLOUDFLARE_ACCOUNT_ID
    );
    this.notifier = new TelegramNotifierAdapter(config.TELEGRAM_BOT_TOKEN);
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

  getSendWebhookNotificationUseCase(): SendWebhookNotificationUseCase {
    return new SendWebhookNotificationUseCase(this.notifier, this.config.ALLOWED_CHAT_ID);
  }
}
