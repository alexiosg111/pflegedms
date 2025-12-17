import { contextBridge, ipcRenderer } from 'electron';

// Expose safe APIs to renderer process
contextBridge.exposeInMainWorld('api', {
  // Database operations
  queryDatabase: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:query', sql, params),
  executeDatabase: (sql: string, params?: unknown[]) =>
    ipcRenderer.invoke('db:execute', sql, params),

  // File operations
  selectFile: (options?: Record<string, unknown>) =>
    ipcRenderer.invoke('file:select', options),
  saveFile: (content: string, filename: string) =>
    ipcRenderer.invoke('file:save', content, filename),
  openFile: (filePath: string) => ipcRenderer.invoke('file:open', filePath),

  // Backup operations
  selectDirectory: () => ipcRenderer.invoke('dir:select'),
  createBackup: (targetDir: string) => ipcRenderer.invoke('backup:create', targetDir),

  // App info
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  getAppPath: () => ipcRenderer.invoke('app:path'),

  // Listen for events
  onDatabaseReady: (callback: (isReady: boolean) => void) => {
    ipcRenderer.on('db:ready', (_, isReady) => callback(isReady));
  },
  onError: (callback: (error: string) => void) => {
    ipcRenderer.on('error', (_, error) => callback(error));
  },
});

declare global {
  interface Window {
    api: typeof api;
  }
}

// Export for TypeScript
export const api = window.api;
