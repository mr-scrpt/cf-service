# 🏗️ Архітектура проєкту

> ⚠️ **Disclaimer:** Проєкт свідомо ускладнений з метою продемонструвати різні підходи та розуміння архітектурних патернів. У реальних production проєктах зазвичай застосовуються окремі ідеї або частини цих підходів залежно від контексту та вимог бізнесу. Це не означає, що я завжди будую системи саме так — вибір архітектури завжди залежить від масштабу, команди та задачі, а ГОЛОВНЕ цілей БІЗНЕСУ.

---

## 📚 Архітектурні підходи

Проєкт натхненний:
- **Domain-Driven Design (DDD)** - Rich Domain Model, Value Objects, Repository Pattern
- **Clean Architecture** - шарова архітектура з залежностями від domain до infrastructure
- **Hexagonal Architecture (Ports & Adapters)** - ізоляція бізнес-логіки від зовнішніх залежностей
- **Design Patterns** - Strategy, Factory, Builder, Proxy, Repository, State Machine

---

## 🛠️ Технічні рішення

### Module System
**ESM (ES Modules)** замість CommonJS - сучасний стандарт, нативна підтримка в Node.js, кращий tree-shaking.

### TypeScript Execution
**tsx** як loader для запуску `.ts` файлів без компіляції.

**Trade-off:**
- ✅ Dev experience - imports без `.js` extensions, швидкий старт
- ❌ Production - вимагає `tsx` в dependencies (альтернатива: pre-build + native Node.js)

### Package Manager
**pnpm** - ефективне використання дискового простору через content-addressable storage, швидке встановлення залежностей, strict node_modules structure.

### Environment Variables
Native Node.js `--env-file=.env` (Node 20.6+) замість `dotenv/dotenv-cli`.

**Обґрунтування:** Немає зайвих залежностей, production platforms (Docker, K8s, PaaS) керують env самостійно.

### Environment Validation
**Zod-схеми** для runtime валідації environment variables при старті застосунку.

```typescript
// packages/bot/src/shared/config/env.config.ts
const botEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  // ...
});

export const env = botEnvSchema.parse(process.env);
```

**Переваги:**
- ✅ **Type-safe** - автоматичний вивід типів зі схеми (`type Env = z.infer<typeof schema>`)
- ✅ **Fail-fast** - застосунок не запуститься з невалідними змінними
- ✅ **Централізація** - `env` об'єкт замість `process.env` напряму
- ✅ **Self-documenting** - схема як single source of truth для required змінних

Кожен пакет (bot, api, web) має свою схему валідації, що забезпечує ізоляцію та явні залежності.

---

## 📦 Структура монорепи

```
packages/
├── shared/          # Спільні утиліти, конфіги, помилки, LoggerPort
├── domain/          # Entities, Value Objects, Repository interfaces
├── application/     # Use Cases, Ports (ICloudflareGateway, ILogger)
├── infrastructure/  # Adapters (DB, Cloudflare API, Telegram, DI Container)
├── bot/             # Telegram bot entry point
├── api/             # REST API entry point
└── web/             # Next.js admin panel
```

**TypeScript Project References** - інкрементальна компіляція, явна ізоляція залежностей.

---

## 🎯 Domain Layer (DDD)

### Rich Domain Model

**Entities з бізнес-логікою:**
```typescript
class Domain {
  activate(): void;
  markAsFailed(): void;
}

class User {
  allow(): void;
  deny(): void;
  isAllowed(): boolean;
}

class RegistrationRequest {
  approve(reviewedBy: string): void;  // ✅ Validates state
  reject(reviewedBy: string): void;
}
```

- Private constructors + Factory methods (`create`/`reconstruct`)
- Захист інваріантів всередині entities

**Value Objects:**
```typescript
class DomainName {
  private constructor(private value: string) {}
  static create(value: string): DomainName;  // ✅ Self-validating
}

class Email { /* ... */ }
// ID типи: UserId, DomainId, RequestId
```

- Immutable, інкапсуляція правил валідації

**Repository interfaces** в domain шарі (порт визначає domain, адаптер - infrastructure).

### Trade-off: Zod-схеми в domain/validation

- Для input validation на межах застосунку (API, Telegram bot)
- Не замінюють бізнес-логіку entities/VOs, а доповнюють
- **Обґрунтування:** Схеми описують контракти даних, entities захищають інваріанти

---

## 🔌 Ports & Adapters

### Ports (інтерфейси)

**Domain layer:**
```typescript
interface IUserRepository {
  findById(id: UserId): Promise<User | null>;
  save(user: User): Promise<void>;
}
```

**Application layer:**
```typescript
interface ICloudflareGateway {
  createZone(domainName: DomainName): Promise<Domain>;
}

interface ILogger {
  info(message: string, meta?: Record<string, unknown>): void;
}
```

### Adapters (реалізації)

**Infrastructure layer:**
- `CloudflareClient` → `ICloudflareGateway`
- `TelegramAdapter` → `ITelegramBot`, `INotifier`
- `WinstonLoggerAdapter` → `ILogger`
- `MongooseRepositories` → `IUserRepository`, etc.

### Переваги

- ✅ Інверсія залежностей - бізнес-логіка не знає про деталі реалізації
- ✅ Тестовність - легко підміняти адаптери на моки
- ✅ Гнучкість - заміна провайдера без зміни use cases

**Примітка:** Це не full Hexagonal Architecture (entry points не абстраговані через порти), але ключова ідея збережена.

---

## 🎨 Design Patterns

### 1️⃣ Strategy Pattern (DNS Records)

**7 стратегій** для різних типів DNS записів:

```typescript
interface DnsRecordStrategy<TData, TRecord, TFieldKey> {
  readonly type: DnsRecordType;
  getFieldConfigs(): FieldConfig[];
  validate(data: Partial<TData>): ValidationResult;
  formatSummary(data: TData): string;
  toCreateInput(wizardData: WizardData<TData>): CreateDnsRecordInput;
}

class DnsStrategyRegistry {
  private strategies = new Map<DnsRecordType, DnsRecordStrategy>();
  register(strategy: DnsRecordStrategy): void;
}
```

**Переваги:** Легко додати новий тип запису (Open/Closed Principle).

### 2️⃣ Wizard Engine (State Machine)

Багаторазово використовуваний механізм для multi-step форм у Telegram:

```typescript
interface WizardConfig<TContext> {
  steps: WizardStep[];
  onComplete: (ctx: TContext, fields: Record<string, unknown>) => Promise<void>;
}
```

**Composable Button Builders:**
- `BooleanButtonBuilder` - Yes/No для boolean полів
- `SelectButtonBuilder` - опції для SELECT полів
- `SkipButtonBuilder` - Skip для optional полів

### 3️⃣ Builder Pattern

```typescript
new LoggerConfigBuilder()
  .withServiceName('api')
  .withLevel(LogLevel.DEBUG)
  .addFileTransport('error.log', LogLevel.ERROR)
  .build();

new KeyboardBuilder()
  .addButton('Create', CallbackAction.DNS_CREATE)
  .addRow()
  .build();
```

### 4️⃣ DI Container (Manual, Type-Safe)

```typescript
class DIContainer {
  constructor(config: Env, logger: ILogger) {
    this.userRepository = new MongoUserRepository();
    this.cloudflareGateway = new CloudflareClient(config.CLOUDFLARE_API_TOKEN);
  }
  
  getAddUserUseCase(): AddUserUseCase {
    return new AddUserUseCase(this.userRepository, this.notifier, this.logger);
  }
}
```

- ✅ Простота - явна конфігурація
- ✅ Type safety - IDE autocomplete
- ❌ Boilerplate для кожного use case

### 5️⃣ Initializer Pattern (Bootstrap Pipeline)

```typescript
class BotApplication {
  private initializers = [
    new DomainInitializer(),
    new InfrastructureInitializer(),
    new ApplicationInitializer(),
  ];
  
  async initialize(): Promise<void> {
    for (const initializer of this.initializers) {
      await initializer.initialize(context);
    }
  }
}
```

Pipeline зі shared context - кожен ініціалізатор додає залежності для наступних.

---

## 📝 Logging System

### Архітектура

**Абстракція:**
- `LoggerPort` (shared) / `ILogger` (application)
- Dependency Injection в use cases та services

**Реалізація:**
- Winston + `WinstonLoggerAdapter`
- Builder pattern для конфігурації

### Можливості

**Запис на диск:**
- Окремі файли: `error.log`, `combined.log`, `requests.log`
- Ротація: max 5MB per file, 5 останніх файлів

**Формати:**
- Файли: JSON (structured logging)
- Console: Pretty format з кольорами (dev only)

**Environment-dependent:**
- Development: DEBUG level + console + файли
- Production: INFO level + тільки файли

### Logging Proxy Pattern

**Реалізовано, але не використовується:**

```typescript
const gateway = createLoggingProxy(
  new CloudflareClient(token),
  logger,
  'CloudflareGateway'
);
```

- Автоматично логує виклики методів + результати + помилки
- Sanitization аргументів (видаляє `password`, `token`)
- **Застосовне:** Adapters, Repositories (infrastructure layer)
- **Не застосовне:** Use Cases (потрібен domain-specific контекст)

---

## 🚂 Result Pattern (Railway Oriented Programming)

**Частково реалізовано** в API layer:

```typescript
class Result<T, E = Error> {
  private constructor(
    private readonly value?: T,
    private readonly error?: E,
    public readonly isSuccess: boolean
  ) {}

  static ok<T>(value: T): Result<T, Error>;
  static fail<E>(error: E): Result<never, E>;
  getValue(): T;
  getError(): E;
}
```

```typescript
abstract class BaseService {
  protected async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    context?: LogContext
  ): Promise<Result<T, Error>> {
    try {
      const result = await operation();
      this.logger.info(`${operationName} succeeded`, context);
      return Result.ok(result);
    } catch (error) {
      this.logger.error(`${operationName} failed`, { error, ...context });
      return Result.fail(this.normalizeError(error));
    }
  }
}
```

**Використання:**
```typescript
// Service
async addUser(dto: AddUserDto): Promise<Result<UserDto, Error>> {
  return this.execute(() => this.addUserUseCase.execute(dto), 'Add user');
}

// Controller
const result = await userService.addUser(dto);
if (result.isSuccess) {
  res.json({ data: result.getValue() });
} else {
  res.status(400).json({ error: result.getError().message });
}
```

**Зв'язок з Either Monad:** Спрощена версія Either, без `map`/`flatMap`/`fold`. Вирішує проблему явної обробки помилок.

---

## 🌐 Web Package (Next.js)

### Feature-Sliced Design (FSD)

**Архітектурна методологія** для frontend застосунків:

```
web/src/
├── app/           # Next.js App Router (pages, layouts)
├── pages/         # Next.js Pages (якщо використовується)
├── widgets/       # Композитні блоки сторінок
├── features/      # Бізнес-фічі (створення домену, управління DNS)
├── entities/      # Бізнес-сутності (Domain, User, DnsRecord)
├── shared/        # Багаторазово використовувані UI компоненти, утиліти
└── processes/     # Складні сценарії (опціонально)
```

**Принципи FSD:**
- **Шари** - чітка ієрархія (app → pages → widgets → features → entities → shared)
- **Слайси** - групування по бізнес-доменам всередині шарів
- **Сегменти** - ui, api, model, lib всередині кожного слайсу
- **Public API** - кожен модуль експортує тільки те, що потрібно назовні

**Переваги:**
- ✅ Масштабованість - легко додавати нові фічі
- ✅ Ізоляція - модулі не знають про деталі один одного
- ✅ Багаторазове використання - shared шар для спільних компонентів

### TanStack Query (React Query)

**Управління серверним станом:**

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['domains'],
  queryFn: () => api.domains.list(),
  staleTime: 5 * 60 * 1000, // 5 хвилин
});

const mutation = useMutation({
  mutationFn: (dto: CreateDomainDto) => api.domains.create(dto),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['domains'] });
  },
});
```

**Можливості:**
- **Батчинг** - автоматичне об'єднання запитів
- **Дедуплікація** - запобігання дублюючих запитів
- **Ревалідація** - автоматичне оновлення даних (stale-while-revalidate)
- **Кешування** - розумне кешування з налаштовуваним часом життя
- **Оптимістичні оновлення** - UI оновлюється до відповіді сервера
- **Background refetch** - автооновлення при фокусі вікна/перепідключенні

**Trade-off:**
- ✅ З коробки вирішує 90% проблем state management для серверних даних
- ✅ Декларативний підхід - менше boilerplate ніж з Redux/MobX
- ❌ Не підходить для клієнтського стану (форми, UI state) - для цього Zustand/Jotai

---

## ⚠️ Слабкі місця та точки зростання

### 1. 🔴 Обробка помилок

**Проблема:** Не систематизована, зустрічаються різні підходи:
- У bot: прямий `try-catch` + throw
- В API: часткове використання `Result` pattern
- В use cases: прямий throw

**Рішення:** Уніфікація через монадичний підхід:
- Повний перехід на `Result<T, E>` всюди
- Або використання `neverthrow` / `fp-ts` для композиції операцій
- Або послідовне застосування існуючого `Result` на всі шари

### 2. 🔴 Логування

**Проблема:** Не систематизовано:
- Десь використовується прямий `logger.info()`
- Десь через `BaseService.execute()` (тільки API)
- Logging Proxy реалізовано, але не використовується
- Різний рівень деталізації логів

**Рішення:**
- Визначити єдиний підхід для кожного шару
- Застосувати Logging Proxy для infrastructure layer
- Стандартизувати structured logging (єдині поля контексту)

### 3. 🟡 Type Safety

**Проблема:** В деяких місцях зустрічається:
- `any` типи
- Type casting (`as` assertions)
- Відсутність строгої типізації в legacy code

### 4. 🟡 DI Container

**Проблема:** Manual boilerplate для кожного use case в `DIContainer.getXxxUseCase()`.

**Рішення:** 
- Якщо проєкт розростається - розглянути InversifyJS / TypeDI
- Або створити factory методи для типових use cases

### 5. 🟡 Winston в shared package

**Проблема:** Coupling на конкретну бібліотеку в shared шарі.

**Рішення:**
- Перенести Winston-специфічні адаптери в infrastructure
- В shared залишити тільки абстракції (`LoggerPort`)

---

## 📊 Підсумки

### ✅ Сильні сторони

- Чітка шарова архітектура з ізоляцією залежностей
- Rich Domain Model із захистом інваріантів
- Ports & Adapters для зовнішніх залежностей
- Багаторазово використовувані патерни (Strategy, Wizard Engine, Builder)
- Type-safe DI Container
- Modern tooling (ESM, pnpm, tsx, TypeScript Project References)

### 🔧 Потребує доопрацювання

- Систематизація обробки помилок (повний перехід на Result pattern)
- Уніфікація підходу до логування
- Усунення `any` типів та type assertions
- Застосування Logging Proxy для infrastructure layer
