import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { release } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
process.env.DIST = join(__dirname, 'dist');
process.env.VITE_PUBLIC = app.isPackaged
  ? process.env.DIST
  : join(__dirname, 'dist');

if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let win;
const preload = join(__dirname, 'preload.js');
const indexHtml = join(process.env.DIST, 'index.html');

async function createWindow() {
  win = new BrowserWindow({
    title: 'PflegeDMS - Pflegedienst Management System',
    frame: false, // Eigenen Fensterrahmen verwenden
    icon: join(process.env.VITE_PUBLIC, 'favicon.png'),
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Fenster anzeigen, wenn Inhalt geladen ist
  win.once('ready-to-show', () => {
    win.show();
    if (!app.isPackaged && process.env.DEBUG) {
      win.webContents.openDevTools();
    }
  });

  // Inhalt laden
  if (app.isPackaged) {
    win.loadFile(indexHtml);
  } else {
    win.loadURL('http://localhost:5173');
  }

  // Sicherheit: Externe Links im Standard-Browser öffnen
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
}

// Anwendungsmenü erstellen
function createMenu() {
  const template = [
    {
      label: 'Datei',
      submenu: [
        {
          label: 'Beenden',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Bearbeiten',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { type: 'separator' },
        { role: 'selectAll' },
      ],
    },
    {
      label: 'Ansicht',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Fenster',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
      ],
    },
    {
      label: 'Hilfe',
      submenu: [
        {
          label: 'Über PflegeDMS',
          click: () => {
            win.webContents.send('show-about');
          },
        },
      ],
    },
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App Events
app.whenReady().then(() => {
  createWindow();
  createMenu();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('second-instance', () => {
  if (win) {
    if (win.isMinimized()) win.restore();
    win.focus();
  }
});

app.on('web-contents-created', (_, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    if (parsedUrl.origin !== 'http://localhost:5173' && parsedUrl.origin !== app.isPackaged ? '' : 'file://') {
      event.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// IPC Handlers für Fenster-Steuerung
ipcMain.on('minimize-window', () => {
  win?.minimize();
});

ipcMain.on('maximize-window', () => {
  if (win?.isMaximized()) {
    win.unmaximize();
    win.webContents.send('window-unmaximized');
  } else {
    win?.maximize();
    win.webContents.send('window-maximized');
  }
});

ipcMain.on('close-window', () => {
  win?.close();
});

// About-Dialog
ipcMain.on('show-about', () => {
  const aboutWindow = new BrowserWindow({
    width: 400,
    height: 300,
    resizable: false,
    title: 'Über PflegeDMS',
    parent: win,
    modal: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  
  aboutWindow.loadURL(`data:text/html;charset=utf-8,
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          h1 { color: #2c3e50; }
          .version { margin: 20px 0; }
          .icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="icon">🏥</div>
        <h1>PflegeDMS</h1>
        <p class="version">Version 1.0.0</p>
        <p>Pflegedienst Management System</p>
        <p>&copy; 2024 PflegeDMS</p>
      </body>
    </html>
  `);
});