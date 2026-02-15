export interface ValidationIssue {
  path: string[];
  message: string;
  code: string;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly issues: ValidationIssue[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }

  getUserFriendlyMessage(): string {
    return this.issues.map(i => i.message).join('\n');
  }
}
