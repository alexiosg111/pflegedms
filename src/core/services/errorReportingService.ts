/**
 * Error Reporting Service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  severity?: 'fatal' | 'error' | 'warning';
  context?: Record<string, any>;
}

export class ErrorReportingService {
  
  /**
   * Log an error to the local database
   */
  async reportError(report: ErrorReport): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const appVersion = await window.api.getAppVersion().catch(() => 'unknown');

    try {
      const sql = `
        INSERT INTO client_errors (
          id, error_message, stack_trace, component_stack, 
          severity, user_context, app_version, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await window.api.executeDatabase(sql, [
        id,
        report.message,
        report.stack || null,
        report.componentStack || null,
        report.severity || 'error',
        report.context ? JSON.stringify(report.context) : null,
        appVersion,
        now
      ]);

      logger.error(`Error reported locally: ${id}`, report);
      
      return id;
    } catch (err) {
      // Fallback to console if DB logging fails
      console.error('Failed to log error to database', err);
      console.error('Original error:', report);
      return '';
    }
  }

  /**
   * Setup global error handlers
   */
  initGlobalHandlers() {
    window.onerror = (message, source, lineno, colno, error) => {
      this.reportError({
        message: String(message),
        stack: error?.stack,
        context: { source, lineno, colno },
        severity: 'error'
      });
    };

    window.onunhandledrejection = (event) => {
      this.reportError({
        message: `Unhandled Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        severity: 'error'
      });
    };
    
    logger.info('Global error handlers initialized');
  }
}

export const errorReportingService = new ErrorReportingService();
