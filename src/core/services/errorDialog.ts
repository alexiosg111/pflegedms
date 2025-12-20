/**
 * Centralized error dialog service
 */

import { toastStore } from '../stores/toastStore';
import { logger } from '../utils/logger';

export interface ErrorInfo {
  code: string;
  message: string;
  details?: unknown;
  userMessage?: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class ErrorDialogService {
  /**
   * Show error to user with logging
   */
  static showError(error: ErrorInfo): void {
    // Log to console (development only via logger)
    logger.error(`[${error.code}] ${error.message}`, error.details);

    // Show user-friendly message via toast
    const userMessage = error.userMessage || this.getDefaultUserMessage(error.severity);
    const duration = error.severity === 'critical' ? 0 : 5000;

    toastStore.show(userMessage, 'error', duration);

    // Log to file
    this.logToFile(error);
  }

  /**
   * Show warning to user
   */
  static showWarning(message: string, details?: unknown): void {
    logger.warn(message, details);
    toastStore.show(message, 'warning', 4000);
    this.logToFile({
      code: 'WARN',
      message,
      details,
      severity: 'warning',
    });
  }

  /**
   * Show info message
   */
  static showInfo(message: string): void {
    logger.info(message);
    toastStore.show(message, 'info', 3000);
  }

  /**
   * Show success message
   */
  static showSuccess(message: string): void {
    logger.info(message);
    toastStore.show(message, 'success', 3000);
  }

  /**
   * Handle database errors
   */
  static handleDatabaseError(err: Error, context: string = 'Database'): void {
    this.showError({
      code: 'DB_ERROR',
      message: `Datenbankfehler in ${context}: ${err.message}`,
      details: err,
      userMessage: 'Ein Fehler bei der Datenbankoperation ist aufgetreten. Bitte versuchen Sie es später erneut.',
      severity: 'error',
    });
  }

  /**
   * Handle file operation errors
   */
  static handleFileError(err: Error, operation: string = 'File operation'): void {
    this.showError({
      code: 'FILE_ERROR',
      message: `Dateifehler bei ${operation}: ${err.message}`,
      details: err,
      userMessage: 'Ein Fehler bei der Dateioperation ist aufgetreten. Überprüfen Sie Ihre Berechtigungen.',
      severity: 'error',
    });
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(err: Error, endpoint: string = 'API'): void {
    this.showError({
      code: 'NETWORK_ERROR',
      message: `Netzwerkfehler zu ${endpoint}: ${err.message}`,
      details: err,
      userMessage: 'Ein Netzwerkfehler ist aufgetreten. Überprüfen Sie Ihre Internetverbindung.',
      severity: 'error',
    });
  }

  /**
   * Handle validation errors
   */
  static handleValidationError(message: string, fields?: string[]): void {
    this.showWarning(
      `Validierungsfehler: ${message}`,
      fields ? { invalidFields: fields } : undefined
    );
  }

  /**
   * Handle authentication errors
   */
  static handleAuthError(message: string = 'Authentifizierungsfehler'): void {
    this.showError({
      code: 'AUTH_ERROR',
      message,
      userMessage: 'Bitte melden Sie sich erneut an.',
      severity: 'error',
    });
  }

  /**
   * Get default user message by severity
   */
  private static getDefaultUserMessage(severity: string): string {
    const messages = {
      info: 'Information',
      warning: 'Warnung: Überprüfen Sie die Eingabe.',
      error: 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.',
      critical: 'Ein kritischer Fehler ist aufgetreten. Die Anwendung wird möglicherweise nicht korrekt ausgeführt.',
    };
    return messages[severity as keyof typeof messages] || messages.error;
  }

  /**
   * Log error to file
   */
  private static logToFile(error: ErrorInfo): void {
    // In production, this would write to error.log file
    // For now, we just log via the logger service
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...error,
    };
    logger.info(`Error logged: ${JSON.stringify(logEntry)}`);
  }
}

export const errorDialog = ErrorDialogService;
