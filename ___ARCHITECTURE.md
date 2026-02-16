# 🏗️ Архитектура проекта

> ⚠️ **Disclaimer:** Проект осознанно усложнен с целью продемонстрировать различные подходы и понимание архитектурных паттернов. В реальных production проектах обычно применяются отдельные идеи или части этих подходов в зависимости от контекста и требований бизнеса. Это не означает, что я всегда строю системы именно так — выбор архитектуры всегда зависит от масштаба, команды и задачи и ГЛАВНОЕ целей бизнеса.

---

## 📚 Архитектурные подходы

Проект вдохновлен:
- **Domain-Driven Design (DDD)** - Rich Domain Model, Value Objects, Repository Pattern
- **Clean Architecture** - слоевая архитектура с зависимостями от domain к infrastructure
- **Hexagonal Architecture (Ports & Adapters)** - изоляция бизнес-логики от внешних зависимостей
- **Design Patterns** - Strategy, Factory, Builder, Proxy, Repository, State Machine

---

## 🛠️ Технические решения

### Module System
**ESM (ES Modules)** вместо CommonJS - современный стандарт, нативная поддержка в Node.js, лучший tree-shaking.

### TypeScript Execution
**tsx** как loader для запуска `.ts` файлов без компиляции.

**Trade-off:**
- ✅ Dev experience - imports без `.js` extensions, быстрый старт
- ❌ Production - требует `tsx` в dependencies (альтернатива: pre-build + native Node.js)

### Package Manager
**pnpm** - эффективное использование дискового пространства через content-addressable storage, быстрая установка зависимостей, strict node_modules structure.

### Environment Variables
Native Node.js `--env-file=.env` (Node 20.6+) вместо `dotenv/dotenv-cli`.

**Обоснование:** Нет лишних зависимостей, production platforms (Docker, K8s, PaaS) управляют env самостоятельно.

### Environment Validation
**Zod-схемы** для runtime валидации environment variables при старте приложения.

```typescript
// packages/bot/src/shared/config/env.config.ts
const botEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  // ...
});

export const env = botEnvSchema.parse(process.env);
```

**Преимущества:**
- ✅ **Type-safe** - автоматический вывод типов из схемы (`type Env = z.infer<typeof schema>`)
- ✅ **Fail-fast** - приложение не запустится с невалидными переменными
- ✅ **Централизация** - `env` объект вместо `process.env` напрямую
- ✅ **Self-documenting** - схема как single source of truth для required переменных

Каждый пакет (bot, api, web) имеет свою схему валидации, что обеспечивает изоляцию и явные зависимости.

---

## 📦 Структура монорепы

```
packages/
├── shared/          # Общие утилиты, конфиги, ошибки, LoggerPort
├── domain/          # Entities, Value Objects, Repository interfaces
├── application/     # Use Cases, Ports (ICloudflareGateway, ILogger)
├── infrastructure/  # Adapters (DB, Cloudflare API, Telegram, DI Container)
├── bot/             # Telegram bot entry point
├── api/             # REST API entry point
└── web/             # Next.js admin panel
```

**TypeScript Project References** - инкрементальная компиляция, явная изоляция зависимостей.

---

##  Domain Layer (DDD)

### Rich Domain Model

**Entities с бизнес-логикой:**
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
- Защита инвариантов внутри entities

**Value Objects:**
```typescript
class DomainName {
  private constructor(private value: string) {}
  static create(value: string): DomainName;  // ✅ Self-validating
}

class Email { /* ... */ }
// ID типы: UserId, DomainId, RequestId
```

- Immutable, инкапсуляция правил валидации

**Repository interfaces** в domain слое (порт определяет domain, адаптер - infrastructure).

### Trade-off: Zod-схемы в domain/validation

- Для input validation на границах приложения (API, Telegram bot)
- Не заменяют бизнес-логику entities/VOs, а дополняют
- **Обоснование:** Схемы описывают контракты данных, entities защищают инварианты

---

## 🔌 Ports & Adapters

### Ports (интерфейсы)

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

### Adapters (реализации)

**Infrastructure layer:**
- `CloudflareClient` → `ICloudflareGateway`
- `TelegramAdapter` → `ITelegramBot`, `INotifier`
- `WinstonLoggerAdapter` → `ILogger`
- `MongooseRepositories` → `IUserRepository`, etc.

### Преимущества

- ✅ Инверсия зависимостей - бизнес-логика не знает о деталях реализации
- ✅ Тестируемость - легко подменить адаптеры на моки
- ✅ Гибкость - замена провайдера без изменения use cases

**Примечание:** Это не full Hexagonal Architecture (entry points не абстрагированы через порты), но ключевая идея сохранена.

---

## 🎨 Design Patterns

### 1️⃣ Strategy Pattern (DNS Records)

**7 стратегий** для разных типов DNS записей:

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

**Преимущества:** Легко добавить новый тип записи (Open/Closed Principle).

### 2️⃣ Wizard Engine (State Machine)

Переиспользуемый механизм для multi-step форм в Telegram:

```typescript
interface WizardConfig<TContext> {
  steps: WizardStep[];
  onComplete: (ctx: TContext, fields: Record<string, unknown>) => Promise<void>;
}
```

**Composable Button Builders:**
- `BooleanButtonBuilder` - Yes/No для boolean полей
- `SelectButtonBuilder` - опции для SELECT полей
- `SkipButtonBuilder` - Skip для optional полей

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

- ✅ Простота - явная конфигурация
- ✅ Type safety - IDE autocomplete
- ❌ Boilerplate для каждого use case

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

Pipeline с shared context - каждый инициализатор добавляет зависимости для следующих.

---

## 📝 Logging System

### Архитектура

**Абстракция:**
- `LoggerPort` (shared) / `ILogger` (application)
- Dependency Injection в use cases и services

**Реализация:**
- Winston + `WinstonLoggerAdapter`
- Builder pattern для конфигурации

### Возможности

**Запись на диск:**
- Раздельные файлы: `error.log`, `combined.log`, `requests.log`
- Ротация: max 5MB per file, 5 последних файлов

**Форматы:**
- Файлы: JSON (structured logging)
- Console: Pretty format с цветами (dev only)

**Environment-dependent:**
- Development: DEBUG level + console + файлы
- Production: INFO level + только файлы

### Logging Proxy Pattern

**Реализован, но не используется:**

```typescript
const gateway = createLoggingProxy(
  new CloudflareClient(token),
  logger,
  'CloudflareGateway'
);
```

- Автоматически логирует вызовы методов + результаты + ошибки
- Sanitization аргументов (удаляет `password`, `token`)
- **Применимо:** Adapters, Repositories (infrastructure layer)
- **Не применимо:** Use Cases (нужен domain-specific контекст)

---

## 🚂 Result Pattern (Railway Oriented Programming)

**Частично реализован** в API layer:

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

**Использование:**
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

**Связь с Either Monad:** Упрощенная версия Either, без `map`/`flatMap`/`fold`. Решает проблему явной обработки ошибок.

---

## 🌐 Web Package (Next.js)

### Feature-Sliced Design (FSD)

**Архитектурная методология** для frontend приложений:

```
web/src/
├── app/           # Next.js App Router (pages, layouts)
├── pages/         # Next.js Pages (если используется)
├── widgets/       # Композитные блоки страниц
├── features/      # Бизнес-фичи (создание домена, управление DNS)
├── entities/      # Бизнес-сущности (Domain, User, DnsRecord)
├── shared/        # Переиспользуемые UI компоненты, утилиты
└── processes/     # Сложные сценарии (опционально)
```

**Принципы FSD:**
- **Слои** - четкая иерархия (app → pages → widgets → features → entities → shared)
- **Слайсы** - группировка по бизнес-доменам внутри слоев
- **Сегменты** - ui, api, model, lib внутри каждого слайса
- **Public API** - каждый модуль экспортирует только то, что нужно наружу

**Преимущества:**
- ✅ Масштабируемость - легко добавлять новые фичи
- ✅ Изоляция - модули не знают о деталях друг друга
- ✅ Переиспользуемость - shared слой для общих компонентов

### TanStack Query (React Query)

**Управление серверным состоянием:**

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['domains'],
  queryFn: () => api.domains.list(),
  staleTime: 5 * 60 * 1000, // 5 минут
});

const mutation = useMutation({
  mutationFn: (dto: CreateDomainDto) => api.domains.create(dto),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['domains'] });
  },
});
```

**Возможности:**
- **Батчинг** - автоматическое объединение запросов
- **Дедупликация** - предотвращение дублирующих запросов
- **Ревалидация** - автоматическое обновление данных (stale-while-revalidate)
- **Кеширование** - умное кеширование с настраиваемым временем жизни
- **Оптимистичные обновления** - UI обновляется до ответа сервера
- **Background refetch** - автообновление при фокусе окна/переподключении

**Trade-off:**
- ✅ Из коробки решает 90% проблем state management для серверных данных
- ✅ Декларативный подход - меньше boilerplate чем с Redux/MobX
- ❌ Не подходит для клиентского состояния (формы, UI state) - для этого Zustand/Jotai

---

## ⚠️ Слабые места и точки роста

### 1. 🔴 Обработка ошибок

**Проблема:** Не систематизирована, встречаются разные подходы:
- В bot: прямой `try-catch` + throw
- В API: частичное использование `Result` pattern
- В use cases: прямой throw

**Решение:** Унификация через монадический подход:
- Полный переход на `Result<T, E>` везде
- Либо использование `neverthrow` / `fp-ts` для композиции операций
- Либо последовательное применение существующего `Result` на все слои

### 2. 🔴 Логирование

**Проблема:** Не систематизировано:
- Где-то используется прямой `logger.info()`
- Где-то через `BaseService.execute()` (только API)
- Logging Proxy реализован, но не используется
- Разный уровень детализации логов

**Решение:**
- Определить единый подход для каждого слоя
- Применить Logging Proxy для infrastructure layer
- Стандартизировать structured logging (единые поля контекста)

### 3. 🟡 Type Safety

**Проблема:** В некоторых местах встречается:
- `any` типы
- Type casting (`as` assertions)
- Отсутствие строгой типизации в legacy code

### 4. 🟡 DI Container

**Проблема:** Manual boilerplate для каждого use case в `DIContainer.getXxxUseCase()`.

**Решение:** 
- Если проект разрастается - рассмотреть InversifyJS / TypeDI
- Либо создать factory методы для типовых use cases

### 5. 🟡 Winston в shared package

**Проблема:** Coupling на конкретную библиотеку в shared слое.

**Решение:**
- Перенести Winston-специфичные адаптеры в infrastructure
- В shared оставить только абстракции (`LoggerPort`)

---

## 📊 Итоги

### ✅ Сильные стороны

- Четкая слоевая архитектура с изоляцией зависимостей
- Rich Domain Model с защитой инвариантов
- Ports & Adapters для внешних зависимостей
- Переиспользуемые паттерны (Strategy, Wizard Engine, Builder)
- Type-safe DI Container
- Modern tooling (ESM, pnpm, tsx, TypeScript Project References)

### 🔧 Требует доработки

- Систематизация обработки ошибок (полный переход на Result pattern)
- Унификация подхода к логированию
- Устранение `any` типов и type assertions
- Применение Logging Proxy для infrastructure layer
