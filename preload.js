import { contextBridge, ipcRenderer } from 'electron';

// Kontext-Bridge für Sicherheit
contextBridge.exposeInMainWorld('electronAPI', {
  // IPC-Kommunikation
  on: (channel, listener) => {
    const validChannels = ['show-about', 'window-maximized', 'window-unmaximized'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.on(channel, listener);
    }
  },
  
  send: (channel, data) => {
    const validChannels = ['minimize-window', 'maximize-window', 'close-window'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // Platform-Information
  platform: process.platform,
  
  // Is production
  isPackaged: process.env.NODE_ENV === 'production',
});

// Version-Informationen anzeigen
contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
});

// Console.log für Debugging in Produktion erlauben (optional)
console.log('Electron preload script loaded');