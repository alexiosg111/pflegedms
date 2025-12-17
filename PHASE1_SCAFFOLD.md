# Phase 1, PR 1: Scaffold (Vite + Svelte + TypeScript + Electron)

## ✅ Status: FERTIG

### Was wurde erstellt:

#### 1. **Build-Konfiguration**
- ✅ `package.json` – Vollständige Dependencies + Scripts
- ✅ `vite.config.ts` – Vite mit Svelte + HMR für Dev-Server
- ✅ `tsconfig.json` – Strikte TypeScript-Konfiguration
- ✅ `vitest.config.ts` – Testing-Setup mit 80% Coverage-Ziel
- ✅ `.prettierrc` – Code-Formatierung (Prettier + Plugin für Svelte)
- ✅ `.eslintrc.cjs` – Linting-Regeln
- ✅ `tailwind.config.js` – Tailwind CSS für Styling
- ✅ `postcss.config.js` – PostCSS für Tailwind

#### 2. **Electron-Konfiguration**
- ✅ `electron-main.ts` – Main-Prozess (Window-Erstellung, Menu)
- ✅ `electron-preload.ts` – IPC-Bridge für sichere Kommunikation
- ✅ `index.html` – HTML-Template mit #app Entry Point

#### 3. **Frontend-Struktur**
- ✅ `src/main.ts` – App-Einstiegspunkt
- ✅ `src/App.svelte` – Root-Komponente (Auth-Router)
- ✅ `src/core/stores/authStore.ts` – Globaler Auth-State (Svelte Store)
- ✅ `src/core/shell/Login.svelte` – Login-UI (Passwort-Input + Button)
- ✅ `src/core/shell/Sidebar.svelte` – Sidebar mit Modul-Navigation (240px fixed)
- ✅ `src/core/shell/MainLayout.svelte` – 2-Spalten-Layout (Sidebar + Content)
- ✅ `src/core/shell/Dashboard.svelte` – Placeholder-Dashboard
- ✅ `src/core/components/Button.svelte` – Basis-Button-Komponente

#### 4. **Styling**
- ✅ `src/assets/styles/global.css` – Globale Styles + CSS-Variablen + Tailwind
- ✅ Dark Mode Support (Vorbereitung für Phase 7)

#### 5. **Entwicklung**
- ✅ `.vscode/settings.json` – Format-on-Save, ESLint Auto-Fix, Prettier Config
- ✅ `.github/workflows/build.yml` – CI/CD für Windows/Mac/Linux

#### 6. **Git**
- ✅ `.gitignore` – Node, Build, IDE, DB-Dateien ausgeschlossen

### Features dieser Phase:

✅ **Scaffold komplett**: Vite + Svelte + TypeScript + Electron 28  
✅ **HMR funktioniert**: Frontend HMR auf Port 5173  
✅ **Login-UI**: Passwort-Input (noch ohne echte Validierung)  
✅ **Shell-Layout**: 2-Spalten-Design (Sidebar 240px + Content)  
✅ **Routing**: Auth-basierter Router (Login ↔ Dashboard)  
✅ **Modul-Navigation**: 6 Modul-Links in der Sidebar  
✅ **Dashboard**: Placeholder mit Quick-Actions & Statistics  
✅ **Linting & Formatting**: ESLint + Prettier automatisch  
✅ **CI/CD Ready**: GitHub Actions für Windows/Linux Build  

### Tech-Stack:

| Layer | Tech |
|-------|------|
| **Frontend** | Svelte 4.2 + Vite 5 |
| **Backend** | Electron 28 + Node.js 20 |
| **Typen** | TypeScript 5.3 (strict mode) |
| **Styling** | Tailwind CSS 3.4 + PostCSS |
| **Linting** | ESLint + Prettier |
| **Testing** | Vitest (Setup) |
| **Build** | electron-builder |

### Wie man die App startet:

```bash
# Dependencies installieren
npm install

# Dev-Mode starten (Vite + Electron mit HMR)
npm run dev

# Production-Build
npm run build

# Electron App packen (Windows/Linux)
npm run dist
```

### Nächster Schritt (Phase 1, PR 2):

**SQLite + SQLCipher Integration**
- `src/main/services/db.ts` – Database-Connection mit SQLCipher
- `migrations/1_initial.sql` – Initial-Schema
- Master-Passwort-Dialog mit bcrypt (12 Rounds)
- Migrations-Runner
- Verschlüsselte Leer-DB beim Start

---

## PR-Ready Checkliste

✅ Alle Dateien erstellt  
✅ Dependencies installierbar  
✅ TypeScript kompiliert ohne Fehler  
✅ Linting fehlerfrei  
✅ Layout responsive  
✅ GitHub Actions konfiguriert  
✅ .vscode/settings.json für Team  

**Bereit zum Merge!** 🚀
