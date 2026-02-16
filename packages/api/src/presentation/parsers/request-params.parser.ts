import { MissingRequestParamError, InvalidParamTypeError } from '@presentation/errors';

export class RequestParamsParser {
  static getStringParam(params: Record<string, string | string[]>, key: string): string {
    const value = params[key];
    
    if (!value) {
      throw new MissingRequestParamError(key);
    }
    
    if (Array.isArray(value)) {
      return value[0];
    }
    
    return value;
  }

  static getNumberParam(params: Record<string, string | string[]>, key: string): number {
    const stringValue = this.getStringParam(params, key);
    const numValue = parseInt(stringValue, 10);
    
    if (isNaN(numValue)) {
      throw new InvalidParamTypeError(key, 'number', stringValue);
    }
    
    return numValue;
  }

  static getOptionalStringParam(params: Record<string, string | string[]>, key: string): string | undefined {
    const value = params[key];
    
    if (!value) {
      return undefined;
    }
    
    if (Array.isArray(value)) {
      return value[0];
    }
    
    return value;
  }
}
