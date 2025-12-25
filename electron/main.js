import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { initializeDatabase } from '../src/lib/database/schema.js';
import { migrateFromLocalStorage } from '../src/lib/services/migrationService.js';
import { DataService } from '../src/lib/services/dataService.js';
import { getConnection } from '../src/lib/database/connection.js';
import { checkPermission } from '../src/lib/services/rbacService.js';
import { logAuditAction } from '../src/lib/services/auditService.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Polyfill for localStorage in Electron main process
import { LocalStorage } from 'node-localstorage';
global.localStorage = new LocalStorage('./scratch');

// Initialize database connection
const db = getConnection();

// Initialize data service
db.dataService = DataService.getInstance();

// Initialize RBAC service
db.checkPermission = checkPermission;

// Initialize audit service
db.logAuditAction = logAuditAction;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let server;

// Database initialization
async function initializeAppDatabase() {
    try {
        console.log('Initializing database...');
        initializeDatabase();
        
        // Check if we need to migrate from localStorage
        if (typeof localStorage !== 'undefined') {
            const migrationCompleted = localStorage.getItem('pflegedms_migration_completed') === 'true';
            if (!migrationCompleted) {
                console.log('Running data migration...');
                migrateFromLocalStorage();
            }
        }
        
        // Create admin user if none exists
        await createDefaultAdminUser();
        
        console.log('Database initialization completed');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }
}

async function createDefaultAdminUser() {
    try {
        const users = db.dataService.getUsers();
        if (users.length === 0) {
            console.log('Creating default admin user...');
            
            const passwordHash = await bcrypt.hash('admin123', 10);
            
            const adminUser = {
                username: 'admin',
                email: 'admin@pflegedms.de',
                password_hash: passwordHash,
                first_name: 'Admin',
                last_name: 'User',
                is_active: 1
            };
            
            const createdUser = db.dataService.createUser(adminUser);
            
            // Assign admin role
            const adminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('admin');
            if (adminRole) {
                db.prepare('INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)')
                    .run(createdUser.id, adminRole.id);
            }
            
            console.log('Default admin user created: admin/admin123');
        }
    } catch (error) {
        console.error('Failed to create default admin user:', error);
    }
}

function startServer() {
  const buildPath = path.join(__dirname, '../build');
  const port = 8888;

  return new Promise((resolve) => {
    server = createServer(async (req, res) => {
      let filePath = path.join(buildPath, req.url === '/' ? '/index.html' : req.url);

      if (!existsSync(filePath)) {
        filePath = path.join(buildPath, '/index.html');
      }

      try {
        const ext = path.extname(filePath);
        const contentType = {
          '.html': 'text/html',
          '.js': 'application/javascript',
          '.css': 'text/css',
          '.png': 'image/png',
          '.json': 'application/json'
        }[ext] || 'application/octet-stream';

        const content = await readFile(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      } catch (error) {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(port, () => {
      console.log(`Local server running on http://localhost:${port}`);
      resolve(port);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../assets/icon.png')
  });

  const isDev = process.env.NODE_ENV === 'development';

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    const port = await startServer();
    mainWindow.loadURL(`http://localhost:${port}`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
    await initializeAppDatabase();
    createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
    if (server) {
        server.close();
    }
});

// IPC Handlers for database operations
function setupIPCHandlers() {
    const { ipcMain } = require('electron');

    // Patient operations
    ipcMain.handle('database:getPatients', (event, filter) => {
        return db.dataService.getPatients(filter);
    });

    ipcMain.handle('database:getPatientById', (event, id) => {
        return db.dataService.getPatientById(id);
    });

    ipcMain.handle('database:createPatient', (event, patient, userId) => {
        return db.dataService.createPatient(patient, userId);
    });

    ipcMain.handle('database:updatePatient', (event, id, patient, userId) => {
        return db.dataService.updatePatient(id, patient, userId);
    });

    ipcMain.handle('database:deletePatient', (event, id, userId) => {
        return db.dataService.deletePatient(id, userId);
    });

    // Staff operations
    ipcMain.handle('database:getStaff', (event, filter) => {
        return db.dataService.getStaff(filter);
    });

    ipcMain.handle('database:getStaffById', (event, id) => {
        return db.dataService.getStaffById(id);
    });

    ipcMain.handle('database:createStaff', (event, staff, userId) => {
        return db.dataService.createStaff(staff, userId);
    });

    ipcMain.handle('database:updateStaff', (event, id, staff, userId) => {
        return db.dataService.updateStaff(id, staff, userId);
    });

    ipcMain.handle('database:deleteStaff', (event, id, userId) => {
        return db.dataService.deleteStaff(id, userId);
    });

    // Appointment operations
    ipcMain.handle('database:getAppointments', (event, filter) => {
        return db.dataService.getAppointments(filter);
    });

    ipcMain.handle('database:getAppointmentById', (event, id) => {
        return db.dataService.getAppointmentById(id);
    });

    ipcMain.handle('database:createAppointment', (event, appointment, userId) => {
        return db.dataService.createAppointment(appointment, userId);
    });

    ipcMain.handle('database:updateAppointment', (event, id, appointment, userId) => {
        return db.dataService.updateAppointment(id, appointment, userId);
    });

    ipcMain.handle('database:deleteAppointment', (event, id, userId) => {
        return db.dataService.deleteAppointment(id, userId);
    });

    // Document operations
    ipcMain.handle('database:getDocuments', (event, filter) => {
        return db.dataService.getDocuments(filter);
    });

    ipcMain.handle('database:getDocumentById', (event, id) => {
        return db.dataService.getDocumentById(id);
    });

    ipcMain.handle('database:createDocument', (event, document, userId) => {
        return db.dataService.createDocument(document, userId);
    });

    ipcMain.handle('database:updateDocument', (event, id, document, userId) => {
        return db.dataService.updateDocument(id, document, userId);
    });

    ipcMain.handle('database:deleteDocument', (event, id, userId) => {
        return db.dataService.deleteDocument(id, userId);
    });

    // User operations
    ipcMain.handle('database:getUsers', (event, filter) => {
        return db.dataService.getUsers(filter);
    });

    ipcMain.handle('database:getUserById', (event, id) => {
        return db.dataService.getUserById(id);
    });

    ipcMain.handle('database:getUserByUsername', (event, username) => {
        return db.dataService.getUserByUsername(username);
    });

    ipcMain.handle('database:getUserByEmail', (event, email) => {
        return db.dataService.getUserByEmail(email);
    });

    ipcMain.handle('database:createUser', (event, user) => {
        return db.dataService.createUser(user);
    });

    ipcMain.handle('database:updateUser', (event, id, user, currentUserId) => {
        return db.dataService.updateUser(id, user, currentUserId);
    });

    ipcMain.handle('database:updateUserPassword', (event, id, passwordHash, currentUserId) => {
        return db.dataService.updateUserPassword(id, passwordHash, currentUserId);
    });

    ipcMain.handle('database:deleteUser', (event, id, currentUserId) => {
        return db.dataService.deleteUser(id, currentUserId);
    });

    // RBAC operations
    ipcMain.handle('database:checkPermission', (event, userId, permissionName) => {
        return db.checkPermission(userId, permissionName);
    });

    ipcMain.handle('database:getUserPermissions', (event, userId) => {
        const { getUserPermissions } = require('../src/lib/services/rbacService.js');
        return getUserPermissions(userId);
    });

    ipcMain.handle('database:getUserRoles', (event, userId) => {
        const { getUserRoles } = require('../src/lib/services/rbacService.js');
        return getUserRoles(userId);
    });

    ipcMain.handle('database:hasRole', (event, userId, roleName) => {
        const { hasRole } = require('../src/lib/services/rbacService.js');
        return hasRole(userId, roleName);
    });

    // Audit operations
    ipcMain.handle('database:getAuditLogs', (event, filter) => {
        const { getAuditLogs } = require('../src/lib/services/auditService.js');
        return getAuditLogs(filter);
    });

    ipcMain.handle('database:getAuditLogCount', (event, filter) => {
        const { getAuditLogCount } = require('../src/lib/services/auditService.js');
        return getAuditLogCount(filter);
    });

    // Authentication operations
    ipcMain.handle('database:login', async (event, username, password) => {
        try {
            const user = db.dataService.getUserByUsername(username);
            if (!user) {
                return { success: false, error: 'Invalid username or password' };
            }

            const passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (!passwordMatch) {
                return { success: false, error: 'Invalid username or password' };
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user.id, username: user.username, email: user.email },
                'pflegedms-secret-key',
                { expiresIn: '8h' }
            );

            // Audit log
            db.logAuditAction(user.id, 'login', null, null, null, { success: true });

            return { success: true, token, user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            } };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: 'Authentication failed' };
        }
    });

    ipcMain.handle('database:verifyToken', async (event, token) => {
        try {
            const decoded = jwt.verify(token, 'pflegedms-secret-key');
            const user = db.dataService.getUserById(decoded.userId);

            if (!user) {
                return { valid: false, error: 'User not found' };
            }

            return { valid: true, user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            } };
        } catch (error) {
            console.error('Token verification error:', error);
            return { valid: false, error: 'Invalid token' };
        }
    });
}

// Set up IPC handlers after database initialization
app.whenReady().then(() => {
    setupIPCHandlers();
});
