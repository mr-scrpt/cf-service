import { LoggerPort } from '../ports';

/**
 * Creates a transparent logging proxy for any service/adapter
 * Automatically logs all method calls, results, and errors
 *
 * @template T - The interface type (e.g., DnsGatewayPort, UserRepository)
 * @param target - The actual implementation instance
 * @param logger - Logger instance
 * @param serviceName - Service name for log context (e.g., "CloudflareGateway")
 * @returns Proxied instance with automatic logging
 *
 * @example
 * ```typescript
 * const gateway = createLoggingProxy(
 *   new CloudflareGatewayAdapter(env),
 *   logger,
 *   'CloudflareGateway'
 * );
 * ```
 */
export function createLoggingProxy<T extends object>(
    target: T,
    logger: LoggerPort,
    serviceName: string,
): T {
    return new Proxy(target, {
        get(obj, prop, receiver) {
            const original = Reflect.get(obj, prop, receiver);

            // If not a function, return as-is
            if (typeof original !== 'function') {
                return original;
            }

            // Wrap method with logging
            return async function (this: any, ...args: any[]) {
                const methodName = String(prop);

                logger.debug(`[${serviceName}] ${methodName} called`, {
                    args: sanitizeArgs(args),
                });

                try {
                    const result = await original.apply(this === receiver ? obj : this, args);

                    logger.info(`[${serviceName}] ${methodName} succeeded`, {
                        result: sanitizeResult(result),
                    });

                    return result;
                } catch (error: any) {
                    logger.error(`[${serviceName}] ${methodName} failed`, {
                        error: error.message,
                        stack: error.stack,
                    });
                    throw error;
                }
            };
        },
    });
}

/**
 * Sanitize arguments to avoid logging sensitive data
 */
function sanitizeArgs(args: any[]): any[] {
    return args.map((arg) => {
        if (arg && typeof arg === 'object') {
            // Remove potential sensitive fields
            const { password, token, apiKey, secret, ...safe } = arg;
            return safe;
        }
        return arg;
    });
}

/**
 * Sanitize result to avoid verbose logs
 */
function sanitizeResult(result: any): any {
    // For arrays, show count and first few items
    if (Array.isArray(result)) {
        return {
            count: result.length,
            sample: result.slice(0, 2),
        };
    }

    // For objects, show only key fields
    if (result && typeof result === 'object') {
        const { id, name, status, type } = result;
        return { id, name, status, type };
    }

    return result;
}
