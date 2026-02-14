# Запуск и тестирование UI системы бота

## 1. Установка зависимостей

```bash
cd project/packages/bot
pnpm install
```

## 2. Настройка переменных окружения

Убедитесь что `.env` содержит:

```env
TELEGRAM_BOT_TOKEN=your_bot_token
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_ACCOUNT_ID=your_account_id
ALLOWED_CHAT_ID=your_telegram_id
```

## 3. Компиляция shared package

```bash
cd project
pnpm --filter @cloudflare-bot/shared build
```

## 4. Запуск бота в dev режиме

```bash
cd project/packages/bot
pnpm dev
```

## 5. Тестирование UI flows

### A. Создание DNS записи через UI

1. Отправьте `/dns` боту
2. Нажмите кнопку **➕ Создать DNS запись**
3. Выберите домен из списка
4. Выберите тип записи (A, AAAA, CNAME, MX, etc.)
5. Введите имя записи (например: `www`)
6. Введите значение (IP или домен)
7. Выберите TTL из предустановленных значений
8. Если запись проксируемая (A/AAAA/CNAME) - выбери Proxied/DNS Only
9. Запись создана! ✅

### B. Регистрация домена через UI

1. Отправьте `/domain` боту
2. Нажмите кнопку **➕ Зарегистрировать домен**
3. Введите имя домена (например: `example.com`)
4. Домен зарегистрирован! ✅

## 6. Проверка callback системы

Откройте DevTools бота и проверьте логи:

```
# Callback data в логах должны выглядеть так:
dns_zone:{"zoneId":"abc123"}
dns_type:{"recordType":"A"}
dns_ttl:{"ttl":3600}
dns_proxied:{"value":true}
```

## 7. Тестирование callback serializer

Запустите тестовый файл:

```bash
cd project/packages/bot
npx tsx src/ui/callbacks/__test-callback-system.ts
```

Должен вывести:

```
=== Callback System Test ===

1. Zone callback: dns_zone:{"zoneId":"zone-123"}
   Parsed type: dns_zone
   Parsed zoneId: zone-123

2. Type callback: dns_type:{"recordType":"A"}
   Parsed recordType: A

✅ All tests completed!
```

## 8. Troubleshooting

### Ошибка: "CONVERSATION_TIMEOUT"
- Увеличьте `conversationTimeout` в настройках бота
- Проверьте что conversation корректно завершается

### Ошибка: "Cannot deserialize callback data"
- Проверьте что keyboard использует `Callback` фабрики
- Убедитесь что `CallbackPattern` совпадает с типом callback

### UI не отображается
- Проверьте что `bot.use(conversations())` вызван ДО регистрации handlers
- Убедитесь что `registerConversations` вызывается с правильным gateway

## Готово!

Бот теперь полностью интегрирован с UI системой на базе:
- ✅ Type-safe callbacks (Strategy Pattern)
- ✅ Inline keyboards (data-driven)
- ✅ Conversation flows (wizards)
- ✅ Clean Architecture (SOLID)
