# Modulare Desktop-Anwendung für Pflegedienste – Projektstruktur

## Übersicht

Diese Anwendung folgt einer **modularen Architektur** mit einer gemeinsamen **Kern-Shell** und unabhängigen Modulen. Jedes Modul ist weitgehend selbstständig, teilt aber die gleiche Datenbank (SQLite + SQLCipher) und die gemeinsamen UI-Komponenten der Shell.

---

## Hauptordnerstruktur

```
pflegedienst-workspace/
├── .git/
├── .gitignore
├── .env.example
├── package.json
├── yarn.lock (oder package-lock.json)
├── tsconfig.json
├── svelte.config.js (oder solid.config.js, je nach UI-Framework)
├── vite.config.ts
├── electron-main.ts
├── electron-preload.ts
│
├── src/
│   ├── core/
│   │   ├── shell/
│   │   │   ├── App.svelte                    # Haupteinstiegspunkt der Anwendung
│   │   │   ├── MainLayout.svelte             # Layout mit Sidebar & Content Area
│   │   │   ├── Sidebar.svelte                # Modulnavigation
│   │   │   ├── GlobalSearch.svelte           # Globale Suchfunktion
│   │   │   ├── Dashboard.svelte              # Dashboard mit Benachrichtigungen
│   │   │   └── NotificationCenter.svelte     # Benachrichtigungsverwaltung
│   │   │
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   └── SidebarItem.svelte
│   │   │   │
│   │   │   ├── Forms/
│   │   │   │   ├── BaseForm.svelte           # Basis-Formular-Komponente
│   │   │   │   ├── TextField.svelte
│   │   │   │   ├── SelectField.svelte
│   │   │   │   ├── DateField.svelte
│   │   │   │   └── FileUpload.svelte
│   │   │   │
│   │   │   ├── Common/
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Badge.svelte
│   │   │   │   ├── Spinner.svelte
│   │   │   │   └── ErrorBoundary.svelte
│   │   │   │
│   │   │   └── Tables/
│   │   │       ├── DataTable.svelte          # Wiederverwendbare Tabellen-Komponente
│   │   │       └── Pagination.svelte
│   │   │
│   │   ├── database/
│   │   │   ├── connection.ts                 # SQLite + SQLCipher Verbindung
│   │   │   ├── migrations.ts                 # Schema-Migrationssystem
│   │   │   ├── schema.sql                    # Haupt-Datenbankschema (siehe separate Datei)
│   │   │   └── seeders/
│   │   │       └── initial-seed.ts           # Initial-Daten für Tests
│   │   │
│   │   ├── auth/
│   │   │   ├── MasterPasswordAuth.svelte     # Login-Komponente mit Master-Passwort
│   │   │   ├── authStore.ts                  # Auth-State-Management
│   │   │   ├── cryptography.ts               # Passwort-Hashing (bcrypt o.ä.)
│   │   │   └── sessionManager.ts             # Session-Verwaltung
│   │   │
│   │   ├── services/
│   │   │   ├── globalSearch.service.ts       # Service für Volltextsuche über alle Module
│   │   │   ├── notification.service.ts       # Benachrichtigungs-Engine
│   │   │   ├── audit.service.ts              # Audit-Logging
│   │   │   └── export.service.ts             # DSGVO-Export Funktionen
│   │   │
│   │   ├── stores/
│   │   │   ├── authStore.ts                  # Globaler Auth-State (Svelte Store)
│   │   │   ├── notificationStore.ts          # Globaler Notification-State
│   │   │   └── settingsStore.ts              # Globale App-Einstellungen
│   │   │
│   │   ├── utils/
│   │   │   ├── dateUtils.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   ├── logger.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── main.ts                           # Einstiegspunkt für die App
│   │
│   ├── modules/
│   │   │
│   │   ├── patientenakte/
│   │   │   ├── PatientList.svelte            # Übersicht aller Patienten
│   │   │   ├── PatientDetail.svelte          # Detailansicht eines Patienten
│   │   │   ├── PatientForm.svelte            # Formular zum Anlegen/Bearbeiten
│   │   │   ├── DocumentList.svelte           # Dokumente eines Patienten
│   │   │   ├── DocumentUpload.svelte         # Dokument-Upload
│   │   │   ├── DocumentViewer.svelte         # Dokument-Ansicht mit OCR-Text
│   │   │   ├── index.ts                      # Module-Einstiegspunkt
│   │   │   ├── store.ts                      # Modul-spezifischer State (Patienten-Daten)
│   │   │   ├── services/
│   │   │   │   ├── patient.service.ts        # CRUD-Operationen für Patienten
│   │   │   │   ├── document.service.ts       # CRUD-Operationen für Dokumente
│   │   │   │   └── ocr.service.ts            # OCR mit Tesseract.js
│   │   │   └── types/
│   │   │       └── patient.types.ts          # TypeScript-Interfaces
│   │   │
│   │   ├── posteingang/
│   │   │   ├── MailboxView.svelte            # Digitaler Posteingang (Kachelsystem)
│   │   │   ├── MailDetail.svelte             # Detailansicht eines Dokuments
│   │   │   ├── MailAssignmentForm.svelte     # Formular zum Zuordnen (Workflow)
│   │   │   ├── QuickScan.svelte              # Schnellscan-Interface
│   │   │   ├── index.ts
│   │   │   ├── store.ts
│   │   │   ├── services/
│   │   │   │   └── mailbox.service.ts        # Posteingang-Verwaltung
│   │   │   └── types/
│   │   │       └── mailbox.types.ts
│   │   │
│   │   ├── vertragsmanagement/
│   │   │   ├── ContractList.svelte           # Übersicht aller Verträge
│   │   │   ├── ContractDetail.svelte         # Detailansicht eines Vertrags
│   │   │   ├── ContractForm.svelte           # Formular zum Anlegen/Bearbeiten
│   │   │   ├── ContractReminderWidget.svelte # Widget für Erinnerungen
│   │   │   ├── index.ts
│   │   │   ├── store.ts
│   │   │   ├── services/
│   │   │   │   └── contract.service.ts       # CRUD & Erinnerungslogik
│   │   │   └── types/
│   │   │       └── contract.types.ts
│   │   │
│   │   ├── rechnungsmanagement/
│   │   │   ├── InvoiceList.svelte            # Übersicht aller Rechnungen
│   │   │   ├── InvoiceDetail.svelte          # Detailansicht einer Rechnung
│   │   │   ├── InvoiceForm.svelte            # Formular zum Anlegen/Bearbeiten
│   │   │   ├── InvoiceStatusBoard.svelte     # Kanban-Board (Offen/Bezahlt/Überfällig)
│   │   │   ├── index.ts
│   │   │   ├── store.ts
│   │   │   ├── services/
│   │   │   │   └── invoice.service.ts        # CRUD & Status-Verwaltung
│   │   │   └── types/
│   │   │       └── invoice.types.ts
│   │   │
│   │   └── qualitaetsmanagement/
│   │       ├── QMDocumentList.svelte         # Übersicht aller QM-Dokumente
│   │       ├── QMDocumentDetail.svelte       # Detailansicht
│   │       ├── QMDocumentForm.svelte         # Formular zum Anlegen/Bearbeiten
│   │       ├── QMFolderView.svelte           # Ordner-Navigation (Hygieneplan, etc.)
│   │       ├── VersionHistory.svelte         # Versionsverwaltung
│   │       ├── index.ts
│   │       ├── store.ts
│   │       ├── services/
│   │       │   └── qm-document.service.ts    # CRUD & Versionsverwaltung
│   │       └── types/
│   │           └── qm-document.types.ts
│   │
│   └── assets/
│       ├── icons/
│       ├── images/
│       └── styles/
│           ├── global.css
│           ├── variables.css
│           └── theme.css
│
├── public/
│   └── index.html
│
├── tests/
│   ├── unit/
│   │   ├── core/
│   │   │   └── database/
│   │   │       └── connection.test.ts
│   │   └── modules/
│   │       └── patientenakte/
│   │           └── patient.service.test.ts
│   │
│   └── e2e/
│       └── workflows.test.ts
│
├── scripts/
│   ├── build.sh
│   ├── dev.sh
│   └── generate-migration.sh
│
└── docs/
    ├── ARCHITECTURE.md
    ├── MODULES.md
    ├── DATABASE.md
    ├── DEVELOPMENT.md
    └── API.md
```

---

## Erklärung der Struktur

### `/src/core`
- **Enthält** alle gemeinsamen, Modul-übergreifenden Komponenten und Services
- **Datenbank-Layer**: Zentrale SQLite-Verbindung mit SQLCipher-Verschlüsselung
- **Auth-Layer**: Master-Passwort-Authentifizierung
- **Services**: Globale Suche, Benachrichtigungen, Audit-Logging, DSGVO-Export
- **Stores**: Zentrale State-Verwaltung (Auth, Notifications, Settings)

### `/src/modules`
- **Jedes Modul ist isoliert** und hat seine eigene:
  - **Komponenten**: UI-Views für das Modul
  - **State (Store)**: Modul-spezifischer Zustand
  - **Services**: CRUD-Operationen und Business-Logik
  - **Types**: TypeScript-Interfaces für Typ-Sicherheit
- **Module kommunizieren** nur über die zentrale Datenbank (nicht direkt miteinander)

### `/public` und `/src/assets`
- HTML-Template und statische Assets (Icons, Bilder, Styles)

### `/tests` und `/scripts`
- Unit- und E2E-Tests
- Build- und Development-Scripts

---

## Modularitätsprinzipien

1. **Unabhängigkeit**: Jedes Modul funktioniert nahezu unabhängig. Module teilen nur die Datenbank.
2. **Lazy Loading**: Module werden nur geladen, wenn der Benutzer sie öffnet.
3. **Gemeinsame Komponenten**: Alle Module verwenden die gleichen UI-Komponenten aus `/src/core/components`.
4. **Typsicherheit**: Jedes Modul hat seine eigenen TypeScript-Types für Datenstrukturen.
5. **Service-Layer**: Business-Logik ist in Services gekapselt, nicht in Komponenten.

---

## Technologie-Stack

- **Frontend**: Svelte (oder SolidJS) + Vite
- **Backend**: Node.js + Electron
- **Datenbank**: SQLite 3 + SQLCipher (für Verschlüsselung)
- **OCR**: Tesseract.js (läuft lokal im Renderer-Prozess)
- **State Management**: Svelte Stores (oder Pinia für SolidJS)
- **Typen**: TypeScript
- **Testing**: Vitest (Unit) + Playwright/Cypress (E2E)

---

## Next Steps

1. **Initialisiere die Projektstruktur** mit allen Ordnern
2. **Definiere das Datenbankschema** (siehe `DATABASE.md`)
3. **Erstelle die Basis-Komponenten** für die Shell
4. **Implementiere jedes Modul** schrittweise
