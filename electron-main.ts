import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { db } from './src/main/services/db';

let mainWindow: BrowserWindow | null = null;
let dbInitialized = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  const isDevelopment = process.env.NODE_ENV === 'development' || isDev;

  if (isDevelopment) {
    // Load from Vite dev server
    const devServerUrl = 'http://localhost:5173';
    mainWindow.loadURL(devServerUrl);
    mainWindow.webContents.openDevTools();
  } else {
    // Load from built files
    const indexPath = path.join(__dirname, '../renderer/index.html');
    mainWindow.loadFile(indexPath);
  }

  // Create menu
  createMenu();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // TODO: Show about dialog
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// ============================================================================
// IPC HANDLERS
// ============================================================================

// Database operations
ipcMain.handle('db:query', async (_event, sql: string, params?: unknown[]) => {
  try {
    if (!dbInitialized) {
      throw new Error('Database not initialized');
    }
    return db.query(sql, params);
  } catch (err) {
    console.error('db:query error:', err);
    mainWindow?.webContents.send('error', (err as Error).message);
    throw err;
  }
});

ipcMain.handle('db:execute', async (_event, sql: string, params?: unknown[]) => {
  try {
    if (!dbInitialized) {
      throw new Error('Database not initialized');
    }
    return db.execute(sql, params);
  } catch (err) {
    console.error('db:execute error:', err);
    mainWindow?.webContents.send('error', (err as Error).message);
    throw err;
  }
});

// File dialog
ipcMain.handle('file:select', async (_event, options) => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: options?.title || 'Datei auswählen',
    defaultPath: options?.defaultPath,
    filters: options?.filters || [
      { name: 'Alle Dateien', extensions: ['*'] },
      { name: 'PDF', extensions: ['pdf'] },
      { name: 'Bilder', extensions: ['jpg', 'jpeg', 'png', 'tiff'] },
    ],
    properties: ['openFile', ...(options?.properties || [])],
  });

  return result.canceled ? null : result.filePaths[0];
});

// Directory dialog
ipcMain.handle('dir:select', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    title: 'Ordner auswählen',
    properties: ['openDirectory'],
  });

  return result.canceled ? null : result.filePaths[0];
});

// Backup
ipcMain.handle('backup:create', async (_event, targetDir: string) => {
  try {
    return db.backup(path.join(targetDir, `backup-${Date.now()}.db`));
  } catch (err) {
    console.error('backup:create error:', err);
    mainWindow?.webContents.send('error', (err as Error).message);
    return false;
  }
});

// App info
ipcMain.handle('app:version', async () => {
  return app.getVersion();
});

ipcMain.handle('app:path', async () => {
  return app.getAppPath();
});

// ============================================================================
// LIFECYCLE EVENTS
// ============================================================================

app.on('ready', async () => {
  // Initialize database with default master password
  // TODO: In production, get password from Login dialog
  try {
    await db.initialize('defaultPassword');
    dbInitialized = true;

    if (mainWindow) {
      mainWindow.webContents.send('db:ready', true);
    }
  } catch (err) {
    console.error('Database initialization failed:', err);
    if (mainWindow) {
      mainWindow.webContents.send('error', 'Database initialization failed');
    }
  }

  createWindow();
});

app.on('window-all-closed', () => {
  db.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Handle app termination gracefully
process.on('SIGTERM', () => {
  db.close();
  app.quit();
});
