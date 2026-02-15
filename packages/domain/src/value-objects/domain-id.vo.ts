export class DomainId {
  private constructor(private readonly value: string) {}

  static create(value: string): DomainId {
    if (!value || value.trim().length === 0) {
      throw new Error('DomainId cannot be empty');
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
