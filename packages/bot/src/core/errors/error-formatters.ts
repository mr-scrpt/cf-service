import { ValidationError, InfrastructureError, AppError, CloudflareApiError, NetworkError } from '@cloudflare-bot/shared';
import type { CloudflareErrorDetails } from '@cloudflare-bot/shared';
import { ERROR_EMOJI_MAP } from './error-emoji';

export function formatValidationError(error: ValidationError): string {
  return `${ERROR_EMOJI_MAP.VALIDATION} <b>Invalid Input</b>\n\n${error.getUserFriendlyMessage()}`;
}

export function formatInfrastructureError(error: InfrastructureError): string {
  if (error instanceof CloudflareApiError) {
    return formatCloudflareError(error);
  }

  if (error instanceof NetworkError) {
    return formatNetworkError(error);
  }

  return `${ERROR_EMOJI_MAP.INFRA} <b>Service Error</b>\n\n${error.message}\n\nPlease try again in a moment.`;
}

export function formatAppError(error: AppError): string {
  return `${ERROR_EMOJI_MAP.APP} <b>Error</b>\n\n${error.message}`;
}

function formatCloudflareError(error: CloudflareApiError): string {
  const firstError = error.getFirstError();

  if (!firstError) {
    return `${ERROR_EMOJI_MAP.INFRA} <b>Cloudflare Error</b>\n\n${error.message}`;
  }

  const { code, message } = firstError;
  const context = getCloudflareErrorContext(code);

  let formatted = `${ERROR_EMOJI_MAP.INFRA} <b>Cloudflare Error</b>\n\n`;

  if (context) {
    formatted += `${context}\n\n`;
  }

  formatted += `<b>Details:</b>\n${message}`;

  if (code) {
    formatted += `\n\n<i>Error code: ${code}</i>`;
  }

  return formatted;
}

function getCloudflareErrorContext(code: number): string | null {
  const contextMap: Record<number, string> = {
    1001: '🔐 Invalid API credentials. Please check your token.',
    1118: '⚠️ Zone limit reached. Please activate some zones first.',
    1099: "🌐 Invalid domain name. Make sure it's a real registered domain.",
    1428: '🔒 Domain is protected or reserved.',
    7003: '❌ DNS record already exists with this name.',
    81053: '⏱ Rate limit exceeded. Please wait a moment.',
    1004: '🔐 Authentication failed. Check your API token permissions.',
  };

  return contextMap[code] || null;
}

function formatNetworkError(error: NetworkError): string {
  const timeoutNote = error.isTimeout ? '\n\n⏱ Request timed out.' : '';
  return `${ERROR_EMOJI_MAP.INFRA} <b>Network Error</b>\n\n${error.message}${timeoutNote}\n\nPlease check your connection and try again.`;
}
