export class Result<T, E = Error> {
  private constructor(
    private readonly value?: T,
    private readonly error?: E,
    public readonly isSuccess: boolean = true
  ) {}

  static ok<T>(value: T): Result<T, Error> {
    return new Result<T, Error>(value, undefined, true);
  }

  static fail<E = Error>(error: E): Result<never, E> {
    return new Result<never, E>(undefined, error, false);
  }

  getValue(): T {
    if (!this.isSuccess) {
      throw new Error('Cannot get value from failed result');
    }
    return this.value!;
  }

  getError(): E {
    if (this.isSuccess) {
      throw new Error('Cannot get error from successful result');
    }
    return this.error!;
  }
}
