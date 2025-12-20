import { contextBridge, ipcRenderer } from 'electron';
import type { ApiContext, FileDialogOptions } from './src/types/api';

const api: ApiContext = {
  queryDatabase: (sql, params) =>
    ipcRenderer.invoke('db:query', sql, params) as Promise<Record<string, unknown>[]>,
  executeDatabase: (sql, params) =>
    ipcRenderer.invoke('db:execute', sql, params) as Promise<{
      changes: number;
      lastInsertRowid: number;
    }>,

  selectFile: (options?: FileDialogOptions) =>
    ipcRenderer.invoke('file:select', options) as Promise<string | null>,
  saveFile: (content, filename) =>
    ipcRenderer.invoke('file:save', content, filename) as Promise<boolean>,
  openFile: (filePath) => ipcRenderer.invoke('file:open', filePath) as Promise<boolean>,

  selectDirectory: () => ipcRenderer.invoke('dir:select') as Promise<string | null>,
  createBackup: (targetDir) => ipcRenderer.invoke('backup:create', targetDir) as Promise<boolean>,

  getAppVersion: () => ipcRenderer.invoke('app:version') as Promise<string>,
  getAppPath: () => ipcRenderer.invoke('app:path') as Promise<string>,

  onDatabaseReady: (callback) => {
    ipcRenderer.on('db:ready', (_event, isReady) => callback(Boolean(isReady)));
  },
  onError: (callback) => {
    ipcRenderer.on('error', (_event, error) => callback(String(error)));
  },
};

contextBridge.exposeInMainWorld('api', api);
