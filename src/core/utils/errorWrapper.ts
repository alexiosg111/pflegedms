/**
 * Utility wrapper for async operations with built-in error handling
 */

import { errorDialog } from '../services/errorDialog';
import { logger } from './logger';

/**
 * Execute async operation with error handling
 */
export async function executeWithErrorHandling<T>(
  fn: () => Promise<T>,
  errorContext: string = 'Operation',
  onError?: (err: Error) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(`${errorContext} failed`, error);

    if (onError) {
      onError(error);
    } else {
      errorDialog.handleDatabaseError(error, errorContext);
    }

    return null;
  }
}

/**
 * Wrap a component method with error handling
 */
export function wrapWithErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`${context} error`, error);
      errorDialog.showError({
        code: 'OPERATION_ERROR',
        message: `${context}: ${error.message}`,
        details: error,
        severity: 'error',
      });
      throw error;
    }
  }) as T;
}

/**
 * Safe localStorage access
 */
export const safeLocalStorage = {
  getItem: (key: string, defaultValue?: any) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : defaultValue;
    } catch (err) {
      logger.warn(`LocalStorage getItem failed for ${key}`, err);
      return defaultValue;
    }
  },

  setItem: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      logger.error(`LocalStorage setItem failed for ${key}`, err);
      return false;
    }
  },

  removeItem: (key: string) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      logger.error(`LocalStorage removeItem failed for ${key}`, err);
      return false;
    }
  },

  clear: () => {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      logger.error('LocalStorage clear failed', err);
      return false;
    }
  },
};

/**
 * Retry logic for failed operations
 */
export async function retryOperation<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      logger.warn(`Operation attempt ${attempt + 1} failed, retrying...`, lastError);

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error('Operation failed after retries');
}
