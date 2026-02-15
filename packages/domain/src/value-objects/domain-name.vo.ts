import { InvalidDomainNameError } from '../errors/domain.error';

export class DomainName {
  private constructor(private readonly value: string) {}

  static create(value: string): DomainName {
    const normalized = value.trim().toLowerCase();
    
    if (!this.isValid(normalized)) {
      throw new InvalidDomainNameError(value);
    }
    
    return new DomainName(normalized);
  }

  private static isValid(value: string): boolean {
    const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,}$/;
    return domainRegex.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: DomainName): boolean {
    return this.value === other.value;
  }
}
