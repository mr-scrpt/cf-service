import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class RequestId {
  private constructor(private readonly value: string) {
    if (!uuidValidate(value)) {
      throw new Error('Invalid RequestId format');
    }
  }

  static create(): RequestId {
    return new RequestId(uuidv4());
  }

  static fromString(id: string): RequestId {
    return new RequestId(id);
  }

  toString(): string {
    return this.value;
  }

  equals(other: RequestId): boolean {
    return this.value === other.value;
  }
}
