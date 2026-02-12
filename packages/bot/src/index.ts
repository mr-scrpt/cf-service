import { Bot } from 'grammy';
import { env } from './config/env.config';
import { formatIncomingRequest } from './utils/format';

// 1. Инициализация
const bot = new Bot(env.TELEGRAM_BOT_TOKEN);

// 2. Логирование старта
bot.api.getMe().then((me) => {
  console.log(`Bot started as @${me.username}`);
  console.log(`Configured Admin ID: ${env.ALLOWED_CHAT_ID}`);
});

// 3. Тест утилиты (временный)
console.log('Formatter test:\n', formatIncomingRequest('GET', '/test', '127.0.0.1'));

// 4. Временный обработчик для узнавания Chat ID
// Напишите боту любое сообщение, чтобы увидеть ID в консоли
bot.on('message', (ctx) => {
  console.log('💬 New message. Chat ID:', ctx.chat.id);

  if (ctx.chat.id !== env.ALLOWED_CHAT_ID) {
    console.warn(`⚠️ Warning: Message from unauthorized chat ${ctx.chat.id}`);
  } else {
    console.log('✅ Authorized admin request');
  }
});

// 5. Запуск (Long Polling для dev)
bot.start({
  onStart: () => console.log('Bot is running... Send a message to find your Chat ID.'),
});

// Graceful Stop
process.once('SIGINT', () => bot.stop());
process.once('SIGTERM', () => bot.stop());
