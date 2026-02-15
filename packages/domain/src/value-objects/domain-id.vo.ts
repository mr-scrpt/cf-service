import { InvalidDomainIdError } from '../errors/domain.error';

export class DomainId {
  private constructor(private readonly value: string) {}

  static create(value: string): DomainId {
    if (!value || value.trim().length === 0) {
      throw new InvalidDomainIdError(value);
    }
    return new DomainId(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: DomainId): boolean {
    return this.value === other.value;
  }
}
