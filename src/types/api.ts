/**
 * Type definitions for Electron IPC API
 * This file is shared between Main and Renderer processes
 */

export interface ApiContext {
  // Database operations
  queryDatabase: (sql: string, params?: unknown[]) => Promise<Record<string, unknown>[]>;
  executeDatabase: (
    sql: string,
    params?: unknown[]
  ) => Promise<{ changes: number; lastInsertRowid: number }>;

  // File operations
  selectFile: (options?: FileDialogOptions) => Promise<string | null>;
  saveFile: (content: string, filename: string) => Promise<boolean>;
  openFile: (filePath: string) => Promise<boolean>;

  // Backup operations
  selectDirectory: () => Promise<string | null>;
  createBackup: (targetDir: string) => Promise<boolean>;

  // App info
  getAppVersion: () => Promise<string>;
  getAppPath: () => Promise<string>;

  // Event listeners
  onDatabaseReady: (callback: (isReady: boolean) => void) => void;
  onError: (callback: (error: string) => void) => void;
}

export interface FileDialogOptions {
  title?: string;
  defaultPath?: string;
  buttonLabel?: string;
  filters?: Array<{
    name: string;
    extensions: string[];
  }>;
  properties?: string[];
}

declare global {
  interface Window {
    api: ApiContext;
  }
}

export const api = window.api;
