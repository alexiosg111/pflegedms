# Technische Spezifikationen – Modulare Pflegedienst-Anwendung

---

## 1. Tech-Stack-Details

### Frontend
```
Framework:     Svelte 4 oder SolidJS 1.8+
Build Tool:    Vite 5+
Language:      TypeScript 5.3+
State Mgmt:    Svelte Stores (oder Pinia für SolidJS)
UI Components: Custom (basierend auf Tailwind CSS oder Bulma)
Icons:         Feather Icons oder Font Awesome
```

### Backend / Desktop
```
Runtime:       Electron 27+
Language:      TypeScript 5.3+
Node.js:       18 LTS oder 20 LTS
IPC:           Electron IPC (Main ↔ Renderer)
```

### Datenbank
```
Engine:        SQLite 3.44+
Encryption:    SQLCipher 4.5+
Driver:        better-sqlite3 (synchron) oder sql.js (für WASM)
Migrations:    Custom system oder db-migrate
```

### OCR & Dateien
```
OCR:           Tesseract.js 5+
PDF-Handling:  pdf-lib oder pdfjs
Dateiformat:   PDF, JPEG, PNG, TIFF
```

### Testing
```
Unit:          Vitest + @testing-library/svelte
E2E:           Playwright oder Cypress
CI/CD:         GitHub Actions
```

---

## 2. Dependencies (package.json)

```json
{
  "name": "pflegedienst-workspace",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/main.js",
  "preload": "dist/preload.js",
  
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "electron": "electron .",
    "start": "npm run build && npm run electron",
    "type-check": "tsc --noEmit",
    "lint": "eslint src --ext .ts,.svelte",
    "format": "prettier --write src",
    "test": "vitest",
    "test:e2e": "playwright test"
  },
  
  "dependencies": {
    "electron-squirrel-startup": "^1.1.12",
    "sqlite3": "^5.1.6",
    "sql.js": "^1.8.0",
    "better-sqlite3": "^9.2.0",
    "sqlcipher": "^5.4.0",
    "tesseract.js": "^5.0.0",
    "pdf-lib": "^1.17.1",
    "pdfjs-dist": "^3.11.174",
    "uuid": "^9.0.1",
    "bcryptjs": "^2.4.3",
    "date-fns": "^2.30.0",
    "lodash-es": "^4.17.21"
  },
  
  "devDependencies": {
    "electron": "^27.0.0",
    "vite": "^5.0.0",
    "svelte": "^4.2.0",
    "typescript": "^5.3.0",
    "@types/node": "^20.10.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "@testing-library/svelte": "^2.4.0",
    "@testing-library/user-event": "^14.5.1",
    "vitest": "^0.34.0",
    "playwright": "^1.40.0"
  }
}
```

---

## 3. Ordnerstruktur zur Erstellung

```bash
# Hauptordner
mkdir -p pflegedienst-workspace/{src,public,tests,docs,scripts}

# Core-Ordner
mkdir -p src/core/{shell,components/{Layout,Forms,Common,Tables},database,auth,services,stores,utils}

# Module
mkdir -p src/modules/{patientenakte,posteingang,vertragsmanagement,rechnungsmanagement,qualitaetsmanagement}/{services,types}

# Tests
mkdir -p tests/{unit/{core,modules},e2e}

# Assets
mkdir -p src/assets/{icons,images,styles}
```

---

## 4. Electron-Konfiguration

### `electron-main.ts`
```typescript
import { app, BrowserWindow } from 'electron';
import path from 'path';

let mainWindow: BrowserWindow;

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
      enableRemoteModule: false
    }
  });

  const isDev = process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    mainWindow.loadURL(isDev);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
```

### `electron-preload.ts`
```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Datenbank-Operationen
  openDatabase: (password: string) => ipcRenderer.invoke('open-database', password),
  queryDatabase: (sql: string, params?: any[]) => ipcRenderer.invoke('query-database', sql, params),
  
  // Datei-Operationen
  selectFile: () => ipcRenderer.invoke('select-file'),
  saveFile: (content: string, filename: string) => ipcRenderer.invoke('save-file', content, filename),
  
  // App-Info
  appVersion: () => ipcRenderer.invoke('app-version')
});
```

---

## 5. Datenbank-Initialisierung

### `src/core/database/connection.ts`
```typescript
import Database from 'better-sqlite3';
import path from 'path';

class DatabaseConnection {
  private db: Database.Database | null = null;

  async initialize(masterPassword: string): Promise<void> {
    const dbPath = path.join(process.env.APPDATA || '.', 'pflegedienst.db');
    
    this.db = new Database(dbPath);
    
    // SQLCipher-Verschlüsselung aktivieren
    this.db.pragma(`key = '${masterPassword}'`);
    
    // Test der Verbindung
    this.db.pragma('quick_check');
    
    // Schema initialisieren
    this.initializeSchema();
  }

  private initializeSchema(): void {
    if (!this.db) throw new Error('Database not initialized');
    
    // Lese schema.sql und führe es aus
    const schema = require('./schema.sql');
    this.db.exec(schema);
  }

  query(sql: string, params?: any[]): any[] {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    return params ? stmt.all(...params) : stmt.all();
  }

  run(sql: string, params?: any[]): any {
    if (!this.db) throw new Error('Database not initialized');
    const stmt = this.db.prepare(sql);
    return params ? stmt.run(...params) : stmt.run();
  }

  transaction<T>(fn: () => T): T {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(fn);
    return transaction();
  }

  close(): void {
    this.db?.close();
    this.db = null;
  }
}

export const dbConnection = new DatabaseConnection();
```

---

## 6. SQLite-Schema (Kern)

### `src/core/database/schema.sql`

```sql
-- Kern-Tabellen
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  document_type TEXT,
  status TEXT DEFAULT 'active',
  ocr_text TEXT,
  is_ocr_processed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- Indizes
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Volltextsuche
CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  filename,
  ocr_text,
  content=documents,
  content_rowid=id
);

-- [... weitere Tabellen für Module folgen ...]
```

---

## 7. Svelte-Komponenten-Struktur

### Basis-Komponente: `src/core/components/Common/Button.svelte`

```svelte
<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'danger' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let disabled: boolean = false;
  export let loading: boolean = false;

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-900',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
</script>

<button
  class="rounded font-medium transition {variantClasses[variant]} {sizeClasses[size]}"
  {disabled}
  on:click
>
  {#if loading}
    <span class="spinner mr-2" />
  {/if}
  <slot />
</button>

<style>
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
```

---

## 8. Service-Struktur

### Beispiel: `src/core/services/globalSearch.service.ts`

```typescript
import { dbConnection } from '../database/connection';

export interface SearchResult {
  type: 'patient' | 'document' | 'contract' | 'invoice' | 'qm-doc';
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
}

export class GlobalSearchService {
  async search(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const results: SearchResult[] = [];

    // Volltextsuche in Dokumenten
    const documents = dbConnection.query(
      `SELECT id, filename, ocr_text FROM documents_fts WHERE documents_fts MATCH ?`,
      [`"${query}*"`]
    );

    // Patienten suchen
    const patients = dbConnection.query(
      `SELECT id, first_name, last_name FROM patients 
       WHERE first_name LIKE ? OR last_name LIKE ?`,
      [`%${query}%`, `%${query}%`]
    );

    // ... weitere Such-Kategorien ...

    return results;
  }
}

export const globalSearchService = new GlobalSearchService();
```

---

## 9. Svelte-Store-Pattern

### `src/core/stores/authStore.ts`

```typescript
import { writable } from 'svelte/store';

export interface AuthState {
  isAuthenticated: boolean;
  username?: string;
  loginTime?: Date;
  sessionExpiry?: Date;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthState>({
    isAuthenticated: false
  });

  return {
    subscribe,
    
    login: (username: string) => {
      set({
        isAuthenticated: true,
        username,
        loginTime: new Date(),
        sessionExpiry: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 Stunden
      });
    },

    logout: () => {
      set({
        isAuthenticated: false
      });
    }
  };
}

export const authStore = createAuthStore();
```

---

## 10. TypeScript-Interfaces für Datenmodelle

### `src/modules/patientenakte/types/patient.types.ts`

```typescript
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  insuranceCompany?: string;
  insuranceNumber?: string;
  primaryDoctor?: string;
  status: 'active' | 'inactive' | 'archived';
  dateRegistered: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientDocument {
  id: string;
  patientId: string;
  documentId: string;
  category: string;
  notes?: string;
  createdAt: Date;
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phone?: string;
  email?: string;
  address?: string;
  insuranceCompany?: string;
}
```

---

## 11. Module-Einstiegspunkt

### `src/modules/patientenakte/index.ts`

```typescript
import PatientList from './PatientList.svelte';
import PatientDetail from './PatientDetail.svelte';
import PatientForm from './PatientForm.svelte';

export const PatiententakteModule = {
  name: 'Patientenakte',
  icon: '👤',
  defaultRoute: '/patientenakte',
  components: {
    List: PatientList,
    Detail: PatientDetail,
    Form: PatientForm
  },
  routes: [
    { path: '/patientenakte', component: PatientList },
    { path: '/patientenakte/:id', component: PatientDetail },
    { path: '/patientenakte/new', component: PatientForm }
  ]
};
```

---

## 12. Vite-Konfiguration

### `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import svelte from 'vite-plugin-svelte';
import path from 'path';

export default defineConfig({
  plugins: [svelte()],
  
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@core': path.resolve(__dirname, './src/core'),
      '@modules': path.resolve(__dirname, './src/modules')
    }
  },

  server: {
    middlewareMode: false,
    hmr: {
      host: 'localhost',
      port: 5173
    }
  }
});
```

---

## 13. TypeScript-Konfiguration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"],
      "@core/*": ["./src/core/*"],
      "@modules/*": ["./src/modules/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 14. Umgebungsvariablen

### `.env.example`

```bash
# Database
DATABASE_PATH=~/.pflegedienst/data.db

# App
APP_NAME=Pflegedienst Workspace
APP_VERSION=0.1.0
VITE_DEV_SERVER_URL=http://localhost:5173

# Security
ENABLE_ENCRYPTION=true
SESSION_TIMEOUT_MINUTES=480

# OCR
OCR_LANGUAGE=deu
OCR_ENABLE_CACHE=true

# Logging
LOG_LEVEL=info
LOG_FILE=~/.pflegedienst/app.log
```

---

## 15. Git-Versionierung

### `.gitignore`

```
node_modules/
dist/
.DS_Store
*.log
*.db
*.db-shm
*.db-wal
.env
.env.local
.vscode/
.idea/
*.swp
*.swo
coverage/
```

---

## 16. Performance-Anforderungen

| Metrik | Ziel |
|--------|------|
| **App-Start** | < 2 Sekunden |
| **Globale Suche** | < 200ms (für 1 Million Dokumente) |
| **Patienten-Listen-Load** | < 500ms |
| **Dokumenten-OCR** | < 5 Sekunden pro Seite |
| **Datenbank-Abfrage** | < 100ms |
| **UI-Response** | < 100ms (60 FPS) |

---

## 17. Security-Standards

- ✅ **Passwort-Hashing**: bcrypt mit Salt (10+ Rounds)
- ✅ **Datenbank-Verschlüsselung**: SQLCipher mit AES-256
- ✅ **Dateihandling**: Keine unsicheren File-Operationen
- ✅ **IPC-Sicherheit**: Keine direkten Node.js-Exposures
- ✅ **HTTPS**: Nicht applicable (local-only), aber Ready für zukünftige Updates

---

## 18. Testing-Strategie

### Unit-Tests (Vitest)
```typescript
// src/core/services/__tests__/globalSearch.service.test.ts
import { describe, it, expect } from 'vitest';
import { globalSearchService } from '../globalSearch.service';

describe('GlobalSearchService', () => {
  it('should find patients by name', async () => {
    const results = await globalSearchService.search('Max');
    expect(results).toContainEqual(
      expect.objectContaining({ type: 'patient' })
    );
  });
});
```

### E2E-Tests (Playwright)
```typescript
// tests/e2e/workflow.test.ts
import { test, expect } from '@playwright/test';

test('should process invoice from mailbox to invoices', async ({ page }) => {
  // Navigate to mailbox
  await page.goto('app://localhost/posteingang');
  
  // Click on invoice
  await page.click('[data-testid="mailbox-item-0"]');
  
  // Assign to invoice module
  await page.selectOption('[data-testid="target-module"]', 'rechnungsmanagement');
  await page.click('[data-testid="save-btn"]');
  
  // Verify invoice is in invoices module
  await page.goto('app://localhost/rechnungsmanagement');
  expect(await page.locator('[data-testid="invoice-count"]')).toContainText('1');
});
```

---

## 19. Deployment & Distribution

### Electron-Builder-Konfiguration

```json
{
  "build": {
    "appId": "de.pflegedienst.workspace",
    "productName": "Pflegedienst Workspace",
    "files": [
      "dist/**/*",
      "node_modules/**/*"
    ],
    "directories": {
      "buildResources": "assets"
    },
    "win": {
      "target": [
        "nsis",
        "portable"
      ]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

Diese technischen Spezifikationen bilden die Grundlage für eine **produktionsreife, sichere und performante** Anwendung. Sie können direkt als Basis für die Implementierung verwendet werden.
