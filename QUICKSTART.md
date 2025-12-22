# Quick Start Guide

## 🎯 Für Benutzer - App herunterladen

1. Gehen Sie zur [Releases-Seite](https://github.com/alexiosg111/pflegedms/releases)
2. Laden Sie die passende Version für Ihr Betriebssystem herunter:
   - **Windows**: `PflegeDMS-Setup-x.x.x.exe`
   - **macOS**: `PflegeDMS-x.x.x.dmg` oder `PflegeDMS-x.x.x-arm64.dmg` (Apple Silicon)
   - **Linux**: `PflegeDMS-x.x.x.AppImage` oder `pflegedms_x.x.x_amd64.deb`
3. Installieren und starten Sie die App

> **Hinweis**: Aktuell sind noch keine Releases verfügbar. Der erste Release wird erstellt, sobald ein Tag gepusht wird (siehe unten).

## 👨‍💻 Für Entwickler - Erste Schritte

### 1. Repository klonen

```bash
git clone https://github.com/alexiosg111/pflegedms.git
cd pflegedms
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. Entwicklung starten

**Option A: Web-Entwicklung**
```bash
npm run dev
```
Öffnen Sie dann http://localhost:5173 im Browser.

**Option B: Electron-Entwicklung**
```bash
npm run electron:dev
```
Die Desktop-App öffnet sich automatisch mit Live-Reload.

### 4. Build erstellen

**Lokaler Build:**
```bash
# Web-App bauen
npm run build

# Desktop-Apps bauen
npm run electron:build        # Alle Plattformen
npm run electron:build:win    # Nur Windows
npm run electron:build:mac    # Nur macOS
npm run electron:build:linux  # Nur Linux
```

Die fertigen Installer finden Sie im `release/` Ordner.

## 🚀 Ersten Release erstellen

### Als Maintainer/Owner:

1. **Version erhöhen** in `package.json`:
   ```json
   {
     "version": "1.0.0"
   }
   ```

2. **Committen**:
   ```bash
   git add package.json
   git commit -m "Release version 1.0.0"
   git push
   ```

3. **Tag erstellen und pushen**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. **Warten**: GitHub Actions baut jetzt automatisch alle Installer (~10-15 Minuten)

5. **Prüfen**: Gehen Sie zu [Releases](https://github.com/alexiosg111/pflegedms/releases) - Der neue Release ist verfügbar!

## 📚 Weitere Dokumentation

- **[README.md](README.md)** - Vollständige Projektdokumentation
- **[RELEASE_GUIDE.md](RELEASE_GUIDE.md)** - Detaillierte Release-Anleitung
- **[SETUP_SUMMARY.md](SETUP_SUMMARY.md)** - Technische Setup-Übersicht
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Beitragsleitfaden

## 🛠️ Troubleshooting

### "npm install" schlägt fehl
- Stellen Sie sicher, dass Node.js 18+ installiert ist: `node --version`
- Löschen Sie `node_modules` und versuchen Sie es erneut: `rm -rf node_modules && npm install`

### Electron startet nicht
- Stellen Sie sicher, dass der Vite-Server läuft (Port 5173)
- Prüfen Sie die Konsole auf Fehlermeldungen
- Versuchen Sie, beide Prozesse separat zu starten:
  ```bash
  # Terminal 1
  npm run dev
  
  # Terminal 2 (warten bis Port 5173 bereit ist)
  npx electron .
  ```

### Build schlägt fehl
- Stellen Sie sicher, dass die Web-App erfolgreich gebaut wurde: `npm run build`
- Prüfen Sie, dass der `build/` Ordner existiert
- Für macOS: Code-Signing kann Fehler verursachen, wenn nicht konfiguriert (wird automatisch übersprungen)

## 💡 Tipps

- **Hot Reload**: Im Entwicklungsmodus (`npm run electron:dev`) werden Änderungen automatisch übernommen
- **DevTools**: Die Electron DevTools sind im Entwicklungsmodus automatisch geöffnet
- **Debugging**: Verwenden Sie `console.log()` in Svelte-Komponenten - Logs erscheinen in den DevTools
- **Icons**: Ersetzen Sie `assets/icon.png` mit einem echten App-Icon für bessere Qualität

## 🎉 Bereit!

Sie sind jetzt bereit, mit der Entwicklung zu beginnen oder die App zu verwenden!
