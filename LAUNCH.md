# 🤖 Cloudflare DNS Management Bot

Telegram-бот для управління DNS-записами через Cloudflare API з REST API для зовнішньої інтеграції та веб-панеллю адміністратора.

> 📖 **Детальний опис архітектури:** [README.md](./README.md) 🇺🇦

---

## 📋 Опис

Монорепо-проєкт для автоматизації управління доменами та DNS-записами в Cloudflare:

- **Telegram Bot** - інтерактивний інтерфейс для користувачів
- **REST API** - програмний доступ для зовнішніх систем
- **Web Panel** (Next.js) - адміністративна панель
- **Shared Libraries** - багаторазово використовувана бізнес-логіка

### Основний функціонал

- ✅ Реєстрація доменів у Cloudflare
- ✅ Управління DNS-записами (A, AAAA, CNAME, MX, NS, SRV, TXT)
- ✅ Система авторизації та запитів доступу
- ✅ Wizard-інтерфейс для створення DNS-записів
- ✅ Сповіщення через Telegram

---

## 🏗️ Технологічний стек

**Backend:**
- **Node.js** (20.6+) - runtime з нативною підтримкою `--env-file`
- **TypeScript** - статична типізація
- **pnpm** - ефективний package manager
- **MongoDB** - сховище даних
- **Cloudflare API** - управління DNS

**Frontend:**
- **Next.js** - React framework
- **TanStack Query** - server state management
- **Feature-Sliced Design** - архітектурна методологія

**Tools:**
- **tsx** - TypeScript execution
- **ESLint** + **Prettier** - code quality
- **Docker Compose** - локальна MongoDB
- **Zod** - runtime validation (env, schemas)

---

## 📦 Структура проєкту

```
packages/
├── shared/          # Спільні утиліти, конфіги, LoggerPort
├── domain/          # Entities, Value Objects, Repository interfaces
├── application/     # Use Cases, Ports
├── infrastructure/  # Adapters (DB, Cloudflare, Telegram, DI)
├── bot/             # Telegram bot entry point
├── api/             # REST API entry point
└── web/             # Next.js admin panel
```

---

## 🚀 Встановлення та запуск

### Попередні вимоги

- **Node.js** >= 20.6.0
- **pnpm** >= 10.25.0
- **Docker** (для MongoDB)

### 1. Встановлення залежностей

```bash
# Встановлення pnpm (якщо не встановлено)
npm install -g pnpm

# Встановлення залежностей всіх пакетів
pnpm install
```

### 2. Налаштування оточення

Створіть `.env` файл у корені проєкту (використовуйте `.env.example` як шаблон):

```bash
cp .env.example .env
```

Заповніть необхідні змінні:

```bash
# Environment
NODE_ENV=development

# Cloudflare API
CLOUDFLARE_API_TOKEN=your_cloudflare_api_token
CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
CLOUDFLARE_API_URL=https://api.cloudflare.com/client/v4

# Telegram Bot
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
ALLOWED_CHAT_ID=123456789

# MongoDB
MONGODB_URI=mongodb://admin:secret@localhost:27017/cloudflare_bot?authSource=admin

# REST API Server
API_AUTH_TOKEN=your_secret_api_token_min_32_chars
API_PORT=3000

# Web Panel (Next.js)
NEXT_PUBLIC_API_URL=http://localhost:3000  # URL REST API для клієнта
ADMIN_USERNAME=admin                        # Логін для адмін-панелі
ADMIN_PASSWORD=admin123                     # Пароль для адмін-панелі
SESSION_SECRET=your_session_secret_min_32_characters_long  # Секрет для сесій (min 32 символи)
```

#### 🔑 Отримання Cloudflare API ключів

⚠️ **Важливо:** Для роботи з доменами потрібні API ключі **рівня акаунту** (Account-level API Token), а не користувача.

**Як створити API Token:**

1. Перейдіть в [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Натисніть **"Create Token"**
3. Виберіть шаблон **"Edit zone DNS"** або створіть Custom Token
4. **Обов'язкові дозволи:**
   - `Zone` → `DNS` → `Edit`
   - `Zone` → `Zone` → `Read`
   - `Account` → `Account Settings` → `Read` (для роботи з доменами)
5. Скопіюйте згенерований токен в `CLOUDFLARE_API_TOKEN`

**Account ID:**
- Знайдіть на головній сторінці Cloudflare Dashboard (праворуч в sidebar)
- Або у налаштуваннях будь-якої зони

#### 🔌 Порти за замовчуванням

Після запуску сервіси будуть доступні на наступних портах:

- **REST API:** `http://localhost:3000` (можна змінити через `API_PORT`)
- **Web Panel:** `http://localhost:5050`
- **MongoDB:** `localhost:27017`
- **Telegram Bot:** Не використовує порт (підключення через Telegram API)

#### 📱 Telegram Bot Token

1. Відкрийте [@BotFather](https://t.me/BotFather) в Telegram
2. Відправте команду `/newbot`
3. Слідуйте інструкціям для створення бота
4. Скопіюйте отриманий токен в `TELEGRAM_BOT_TOKEN`

**ALLOWED_CHAT_ID:**
- Ваш особистий Telegram ID (адміністратор бота)
- Отримати можна через [@userinfobot](https://t.me/userinfobot)

---

**Система валідації оточення:**

Проєкт використовує **Zod** для валідації environment variables при старті застосунку. Кожен пакет (bot, api, web) має свою схему валідації:

```typescript
// packages/bot/src/shared/config/env.config.ts
const botEnvSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  CLOUDFLARE_API_TOKEN: z.string().min(1),
  // ...
});

export const env = botEnvSchema.parse(process.env); // ✅ Валідація при імпорті
```

**Переваги підходу:**
- ✅ **Type-safe** - автоматичний вивід типів зі схеми
- ✅ **Fail-fast** - застосунок не запуститься з невалідними env
- ✅ **Централізація** - `env` об'єкт замість `process.env` по всьому коду
- ✅ **Документація** - схема як source of truth для required змінних

### 3. Запуск MongoDB

```bash
pnpm docker:up
```

### 4. Запуск застосунків

**Development режим:**

У корені проєкту запустіть потрібні сервіси:

```bash
# Telegram Bot (з hot-reload)
pnpm dev:bot

# REST API (з hot-reload)
pnpm dev:api

# Web Panel (з hot-reload)
pnpm dev:web
```

Можна запустити всі три сервіси одночасно в різних терміналах.

**Production режим:**

```bash
# Збірка всіх пакетів
pnpm build

# Запуск Telegram Bot
pnpm start:bot

# Запуск REST API
pnpm start:api

# Запуск Web Panel
pnpm start:web
```

---

## 📝 Доступні скрипти

### Development

- `pnpm dev:bot` - запуск Telegram бота з hot-reload
- `pnpm dev:api` - запуск REST API з hot-reload
- `pnpm dev:web` - запуск Next.js панелі

### Production

- `pnpm build` - збірка всіх TypeScript пакетів
- `pnpm build:clean` - очищення та перезбірка
- `pnpm start:bot` - запуск зібраного бота
- `pnpm start:api` - запуск зібраного API
- `pnpm start:web` - запуск зібраної веб-панелі

### Code Quality

- `pnpm lint` - перевірка коду ESLint
- `pnpm lint:fix` - автоматичне виправлення
- `pnpm format` - форматування коду Prettier
- `pnpm format:check` - перевірка форматування

### Docker

- `pnpm docker:up` - запуск MongoDB
- `pnpm docker:down` - зупинка MongoDB
- `pnpm docker:logs` - перегляд логів MongoDB

---

## 🎯 Функціональність

### Telegram Bot

**Команди:**
- `/start` - початок роботи з ботом, головне меню

**Можливості:**
- Управління доменами та DNS-записами через інтерактивне меню
- Wizard-інтерфейс для створення DNS-записів
- Перегляд та управління DNS-записами через inline-клавіатури
- Система запитів доступу для нових користувачів
- Сповіщення про важливі події

### REST API

**Endpoints:**

```
POST   /api/domains              # Реєстрація домену
GET    /api/domains              # Список доменів
GET    /api/domains/:id/records  # DNS записи домену
POST   /api/domains/:id/records  # Створення DNS запису
PUT    /api/records/:id          # Оновлення DNS запису
DELETE /api/records/:id          # Видалення DNS запису

POST   /api/users                # Додавання користувача
GET    /api/users                # Список користувачів
DELETE /api/users/:telegramId   # Видалення користувача

POST   /api/notifications        # Відправка сповіщення
```

#### 📮 Postman Collection

Для зручного тестування API використовуйте готову Postman колекцію:

**📁 Файл:** [`packages/api/POSTMAN_SCHEMA.json`](./packages/api/POSTMAN_SCHEMA.json)

Колекція містить всі endpoints з прикладами запитів та параметрами. Імпортуйте файл у Postman для швидкого старту роботи з API.

### Web Panel (Next.js)

- Адміністративний інтерфейс
- Управління користувачами
- Перегляд доменів та DNS-записів
- Feature-Sliced Design архітектура

---

## 📚 Документація

### 🏗️ Архітектура проєкту

> ⭐ **Основна документація:** Детальний опис архітектурних рішень, патернів проєктування та технічних підходів.

**Читати:** [**README.md**](./README.md) 🇺🇦

### 📖 Інструкція по запуску

Даний файл містить повну інструкцію по встановленню, налаштуванню та запуску проєкту.

---

## ⚠️ Важливо

Проєкт створено в освітніх цілях для демонстрації архітектурних підходів та патернів проєктування. У production-проєктах рекомендується застосовувати окремі ідеї залежно від контексту та цілей бізнесу.
