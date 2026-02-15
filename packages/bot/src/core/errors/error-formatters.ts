import { ValidationError, InfrastructureError, AppError } from '@cloudflare-bot/shared';
import { ERROR_EMOJI_MAP } from './error-messages';

/**
 * Error formatting functions
 * Pure functions that convert errors to user-friendly Telegram messages
 * 
 * Each function is referenced by error-formatter-registry.ts
 */

export function formatValidationError(error: ValidationError): string {
  return `${ERROR_EMOJI_MAP.VALIDATION} <b>Invalid Input</b>\n\n${error.getUserFriendlyMessage()}`;
}

export function formatInfrastructureError(error: InfrastructureError): string {
  // Try to extract Cloudflare-specific error details
  const cloudflareError = extractCloudflareError(error);
  
  if (cloudflareError) {
    return formatCloudflareError(cloudflareError);
  }

  // Fallback to generic infrastructure error
  return `${ERROR_EMOJI_MAP.INFRA} <b>Service Error</b>\n\n${error.message}\n\nPlease try again in a moment.`;
}

export function formatAppError(error: AppError): string {
  return `${ERROR_EMOJI_MAP.APP} <b>Error</b>\n\n${error.message}`;
}

// Helper functions for Cloudflare error extraction

interface CloudflareErrorDetails {
  code: number;
  message: string;
  statusCode?: number;
}

function extractCloudflareError(error: InfrastructureError): CloudflareErrorDetails | null {
  const meta = error.meta;
  
  if (!meta) {
    return null;
  }

  // Extract from Cloudflare API error structure
  const cfError = meta.error as any;
  
  if (cfError && typeof cfError === 'object') {
    // Cloudflare returns errors in this format:
    // { success: false, errors: [{ code: 1118, message: "..." }], ... }
    if (cfError.errors && Array.isArray(cfError.errors) && cfError.errors.length > 0) {
      const firstError = cfError.errors[0];
      return {
        code: firstError.code,
        message: firstError.message,
        statusCode: meta.status as number,
      };
    }
  }

  return null;
}

function formatCloudflareError(details: CloudflareErrorDetails): string {
  const { code, message } = details;
  
  // Provide user-friendly context based on error code
  const context = getCloudflareErrorContext(code);
  
  let formatted = `${ERROR_EMOJI_MAP.INFRA} <b>Cloudflare Error</b>\n\n`;
  
  if (context) {
    formatted += `${context}\n\n`;
  }
  
  formatted += `<b>Details:</b>\n${message}`;
  
  // Add error code for technical users
  if (code) {
    formatted += `\n\n<i>Error code: ${code}</i>`;
  }
  
  return formatted;
}

function getCloudflareErrorContext(code: number): string | null {
  const contextMap: Record<number, string> = {
    1001: '🔐 Invalid API credentials. Please check your token.',
    1118: '⚠️ Zone limit reached. Please activate some zones first.',
    1099: '🌐 Invalid domain name. Make sure it\'s a real registered domain.',
    1428: '🔒 Domain is protected or reserved.',
    7003: '❌ DNS record already exists with this name.',
    81053: '⏱ Rate limit exceeded. Please wait a moment.',
    1004: '🔐 Authentication failed. Check your API token permissions.',
  };

  return contextMap[code] || null;
}
