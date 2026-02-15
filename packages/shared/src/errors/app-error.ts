export abstract class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly meta?: Record<string, unknown>,
  ) {
    super(message);
    this.name = this.constructor.name;
  }

  static isInstance(error: Error): error is AppError {
    return error instanceof AppError;
  }
}
