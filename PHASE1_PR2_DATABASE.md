# Phase 1, PR 2: SQLite + SQLCipher + Master-Passwort

## ✅ Status: FERTIG

### Was wurde implementiert:

#### 1. **Datenbank-Service** (`src/main/services/db.ts`)
- ✅ `DatabaseService` Klasse mit singleton pattern
- ✅ SQLite + SQLCipher Integration (better-sqlite3)
- ✅ Master-Passwort-Verschlüsselung
- ✅ Migrations-Runner (führt `.sql`-Dateien aus)
- ✅ `query()` – SELECT mit Parametern
- ✅ `queryOne()` – SELECT single row
- ✅ `execute()` – INSERT/UPDATE/DELETE
- ✅ `transaction()` – Transactional operations
- ✅ `backup()` – DB-Backup-Funktion
- ✅ `close()` – graceful shutdown

#### 2. **Initial Schema** (`migrations/1_initial.sql`)
- ✅ **2 Kern-Tabellen**:
  - `documents` – Zentrale Dokumentenverwaltung
  - `audit_log` – DSGVO-Compliance
  - `notifications` – Benachrichtigungen
- ✅ **Modul 1: Patientenakte**
  - `patients` – Patientenbasisdaten
  - `patient_documents` – Zuordnung
- ✅ **Modul 2: Posteingang**
  - `mailbox_items` – Inbox-Items
- ✅ **Modul 3: Verträge**
  - `contracts` – Verträge
  - `suppliers` – Lieferanten
- ✅ **Modul 4: Rechnungen**
  - `invoices` – Ein-/Ausgangsrechnungen
- ✅ **Modul 5: QM**
  - `qm_folders` – Ordnerstruktur
  - `qm_documents` – QM-Docs
  - `qm_document_versions` – Versionierung
- ✅ **FTS5 Volltextsuche** (Full-Text Search Index)
- ✅ **Trigger** für automatische FTS-Updates
- ✅ **Indizes** für Performance

#### 3. **IPC Handler in Electron** (`electron-main.ts` updated)
- ✅ `ipcMain.handle('db:query', ...)` – SELECT-Queries
- ✅ `ipcMain.handle('db:execute', ...)` – DML-Statements
- ✅ `ipcMain.handle('file:select', ...)` – File-Dialog
- ✅ `ipcMain.handle('dir:select', ...)` – Directory-Dialog
- ✅ `ipcMain.handle('backup:create', ...)` – DB-Backup
- ✅ `ipcMain.handle('app:version', ...)` – App-Info
- ✅ DB-Initialisierung beim App-Start
- ✅ Graceful shutdown bei app close

#### 4. **Type Definitions** (`src/types/api.ts`)
- ✅ `ApiContext` interface für IPC-API
- ✅ `FileDialogOptions` interface
- ✅ Global `window.api` type definition

#### 5. **Toast-System** (für Benutzer-Feedback)
- ✅ `toastStore.ts` – Svelte Store für Toasts
- ✅ `Toast.svelte` – Toast-Komponente
- ✅ Methoden: `show()`, `success()`, `error()`, `warning()`, `info()`
- ✅ Auto-dismiss nach Duration

#### 6. **Logger-Service** (für Debugging)
- ✅ `logger.ts` – Zentrales Logging
- ✅ Log-Levels: DEBUG, INFO, WARN, ERROR
- ✅ `logger.info()`, `logger.warn()`, `logger.error()`
- ✅ Console-Output in Dev-Mode

#### 7. **Login-Integration**
- ✅ Login.svelte hört auf `db:ready` Event
- ✅ Passwort-Validierung (MVP: "defaultPassword")
- ✅ Toast-Feedback für Benutzer
- ✅ Status-Indicator "Datenbank wird initialisiert"

#### 8. **App.svelte Updated**
- ✅ Toast-Komponente hinzugefügt
- ✅ Global Toast-System aktiv

### Features dieser Phase:

✅ **Datenbank läuft**: SQLite + SQLCipher verschlüsselt  
✅ **Schema komplett**: 13 Tabellen + Indizes + FTS5  
✅ **IPC-Kommunikation**: Renderer ↔ Main via contextBridge  
✅ **Migrations-System**: Automatisches Schema-Rollout  
✅ **Master-Passwort**: Datenbank mit Passwort verschlüsselt  
✅ **Toast-System**: User-Feedback Toasts  
✅ **Logger**: Zentrale Logging  
✅ **Type-Safe**: Alle IPC-APIs typisiert  

### Wie man es testet:

```bash
npm install
npm run dev

# Im Login-Screen:
# Passwort: defaultPassword
# Button: "Entsperren"
# → Sollte zum Dashboard gehen
```

### Database File:

- **Pfad**: `~/.pflegedienst/pflegedienst.db`
- **Verschlüsselung**: SQLCipher AES-256
- **Schema**: 13 Tabellen (13+ Indizes)
- **Größe**: ~1 MB (leer)

### SQL-Beispiele (im DevTools zur Laufzeit):

```typescript
// Klient-seitig (Renderer):
const patients = await window.api.queryDatabase('SELECT * FROM patients');
const result = await window.api.executeDatabase('INSERT INTO patients (id, first_name, last_name) VALUES (?, ?, ?)', ['uuid', 'Max', 'Mustermann']);

// Das wird automatisch über IPC an Main gesendet → db.query() ausgeführt → Ergebnis zurück
```

### Nächster Schritt (Phase 2, PR 1):

**Patientenakte-Modul (CRUD)**
- Patient-List-View
- Patient-Form (Erstellen/Bearbeiten)
- PatientStore für State-Management
- PatientService für CRUD-Operations
- Verknüpfung mit documents-Tabelle

**Geschätzter Aufwand**: 1-2 Tage

---

## Merge-Ready Checkliste

✅ Database initialisiert beim App-Start  
✅ Schema-Migrations funktionieren  
✅ IPC-Kommunikation typsicher  
✅ Login hört auf DB-Ready Event  
✅ Toast-System für Benutzer-Feedback  
✅ Graceful shutdown  
✅ Kein TypeScript-Fehler  

**Bereit zum Merge!** 🚀

---

## Wichtige Notizen

### MVP-Passwort
- **Passwort**: `defaultPassword`
- **Hashing**: Wird in Phase 1 PR 3 mit bcrypt implementiert
- **Für Produktion**: Muss durch echte Passwort-Eingabe + bcrypt ersetzt werden

### Datenbank-Performance
- WAL-Modus für bessere Concurrency
- 64MB Cache für schnellere Queries
- Foreign-Keys aktiviert
- Indizes auf häufig abgefragten Feldern

### Migrationen
- `.sql`-Dateien in `migrations/` Ordner
- Werden sortiert ausgeführt (numerische Präfix)
- Tracking in `migrations`-Tabelle
- Fehlerbehandlung mit Transaction-Rollback

---

**Status**: ✅ Phase 1, PR 2 – DATABASE & ENCRYPTION – FERTIG & MERGE-READY

**Nächste Phase**: Phase 2 – Patientenakte-Modul (CRUD) 🚀
