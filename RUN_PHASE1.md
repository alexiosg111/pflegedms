# Quick Start: Phase 1, PR 1 – Scaffold

## Installation & Starten in 3 Schritten

### 1. Dependencies installieren
```bash
npm install
```

**Ergebnis**: ~450 MB in `node_modules/`

### 2. Dev-Server starten
```bash
npm run dev
```

**Was passiert**:
- Vite dev server startet auf `http://localhost:5173`
- Electron öffnet mit Dev-Tools
- HMR aktiviert (Änderungen live laden)

### 3. Testen

**Login-Screen sollte sichtbar sein:**
- 🏥 Pflegedienst Workspace Titel
- Passwort-Input (jedes Passwort geht für MVP)
- "Entsperren" Button

**Nach Login:**
- 2-Spalten-Layout sichtbar
- Sidebar mit 6 Modulen (Patientenakte, Posteingang, etc.)
- Dashboard mit Placeholder-Kacheln

---

## Troubleshooting

### Problem: "Port 5173 already in use"
```bash
# Beende den Process auf Port 5173
# Windows: taskkill /F /IM node.exe
# Mac/Linux: lsof -ti:5173 | xargs kill -9

# Oder nutze einen anderen Port
PORT=5174 npm run dev
```

### Problem: "Module not found" Error
```bash
# Cache löschen und neu installieren
rm -rf node_modules dist
npm install
```

### Problem: TypeScript Fehler
```bash
# Type-Check durchführen
npm run type-check

# ESLint Check
npm run lint
```

### Problem: Prettier formatiert nicht
- Starte VS Code neu
- Check: `.prettierrc` existiert
- Check: `esbenp.prettier-vscode` Extension installiert

---

## Dateistruktur verstehen

```
src/
├── main.ts                          # App-Einstiegspunkt
├── App.svelte                       # Root (Auth-Router)
└── core/
    ├── stores/
    │   └── authStore.ts            # Login-State
    ├── shell/
    │   ├── Login.svelte            # Passwort-Dialog
    │   ├── MainLayout.svelte       # 2-Spalten-Layout
    │   ├── Sidebar.svelte          # Navigation
    │   └── Dashboard.svelte        # Placeholder
    └── components/
        └── Button.svelte           # Basis-Button
```

---

## Nächste Schritte (Phase 1, PR 2)

PR 2 wird implementieren:
- ✅ SQLite + SQLCipher Integration
- ✅ Master-Passwort-Dialog
- ✅ Datenbankverbindung
- ✅ Migrations-System

**Geschätzter Aufwand**: 1 Tag

---

## Merging zu Main

Diese PR ist **merge-ready** wenn:

```bash
# 1. Type-Check: keine Fehler
npm run type-check

# 2. Linting: keine Fehler
npm run lint

# 3. App startet
npm run dev

# 4. Können loginnen (jedes PW geht)
# 5. Layout ist sichtbar
# 6. Alle 6 Module in Sidebar vorhanden
```

✅ **Bereit zu mergen!**

---

## Git Commands

```bash
# Commit & Push
git add .
git commit -m "feat(scaffold): vite + svelte + electron setup with login and shell"
git push origin modular-desktop-pflegedienst-shell

# Nach dem Merge:
git tag v1.0.0-scaffold
git push origin v1.0.0-scaffold
```

---

## Wichtige Dateien zum Überprüfen

- ✅ `package.json` – Dependencies richtig?
- ✅ `vite.config.ts` – HMR konfiguriert?
- ✅ `.vscode/settings.json` – Format-on-Save aktiv?
- ✅ `src/App.svelte` – Auth-Router funktioniert?
- ✅ `src/core/shell/Sidebar.svelte` – 6 Module vorhanden?
- ✅ `.github/workflows/build.yml` – CI/CD konfiguriert?

---

**Status**: ✅ Phase 1, PR 1 – FERTIG & MERGE-READY

**Nächst**: Phase 1, PR 2 – SQLite + Passwort 🚀
