/**
 * Centralized logging service for the application
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  details?: unknown;
}

class Logger {
  private logs: LogEntry[] = [];
  private isDev = process.env.NODE_ENV === 'development';

  log(level: LogLevel, message: string, details?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    };

    this.logs.push(entry);

    // Console output in development
    if (this.isDev) {
      const color = this.getColorForLevel(level);
      console.log(`${color}[${entry.timestamp}] [${level}]`, message, details || '');
    }
  }

  debug(message: string, details?: unknown) {
    this.log(LogLevel.DEBUG, message, details);
  }

  info(message: string, details?: unknown) {
    this.log(LogLevel.INFO, message, details);
  }

  warn(message: string, details?: unknown) {
    this.log(LogLevel.WARN, message, details);
  }

  error(message: string, error?: Error | unknown) {
    const details = error instanceof Error ? error.message : String(error);
    this.log(LogLevel.ERROR, message, details);
  }

  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let filtered = this.logs;
    if (level) {
      filtered = filtered.filter((l) => l.level === level);
    }
    if (limit) {
      filtered = filtered.slice(-limit);
    }
    return filtered;
  }

  clear() {
    this.logs = [];
  }

  private getColorForLevel(level: LogLevel): string {
    const colors = {
      [LogLevel.DEBUG]: '\x1b[36m', // Cyan
      [LogLevel.INFO]: '\x1b[32m', // Green
      [LogLevel.WARN]: '\x1b[33m', // Yellow
      [LogLevel.ERROR]: '\x1b[31m', // Red
    };
    return colors[level];
  }
}

export const logger = new Logger();
