# PflegeDMS - Pflegedienst Management System

Ein Desktop-Management-System für Pflegedienste, entwickelt mit SvelteKit und Electron.

## 📥 Download

Die neuesten Versionen können Sie direkt von der [Releases-Seite](https://github.com/alexiosg111/pflegedms/releases) herunterladen:

### Windows
- **Setup-Installer**: `PflegeDMS-Setup-x.x.x.exe` - Vollständiger Installer mit Startmenü-Verknüpfungen
- **Portable Version**: `PflegeDMS-x.x.x.exe` - Keine Installation erforderlich

### macOS
- **Intel Macs**: `PflegeDMS-x.x.x.dmg` 
- **Apple Silicon (M1/M2/M3)**: `PflegeDMS-x.x.x-arm64.dmg`

### Linux
- **AppImage**: `PflegeDMS-x.x.x.AppImage` - Universell, keine Installation
- **Debian/Ubuntu**: `pflegedms_x.x.x_amd64.deb` - Für .deb-basierte Systeme

## ✨ Installation

### Windows
1. Laden Sie `PflegeDMS-Setup-x.x.x.exe` herunter
2. Führen Sie die Datei aus
3. Folgen Sie dem Installationsassistenten
4. Starten Sie PflegeDMS über das Startmenü

### macOS
1. Laden Sie die passende `.dmg` Datei herunter
2. Öffnen Sie die `.dmg` Datei
3. Ziehen Sie PflegeDMS in den Programme-Ordner
4. Bei erstem Start: Rechtsklick → "Öffnen" (wegen Gatekeeper)

### Linux
**AppImage:**
```bash
chmod +x PflegeDMS-x.x.x.AppImage
./PflegeDMS-x.x.x.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i pflegedms_x.x.x_amd64.deb
```

## 🚀 Features

- 📋 Patientenverwaltung
- 📅 Terminplanung
- 📄 Dokumentation
- 👥 Mitarbeiterverwaltung

## 🛠️ Entwicklung

### Voraussetzungen

- Node.js 18+ 
- npm oder yarn

### Installation

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten (Web)
npm run dev

# Electron im Entwicklungsmodus starten
npm run electron:dev
```

### Build

```bash
# Web-App bauen
npm run build

# Desktop-Apps bauen
npm run electron:build

# Spezifische Plattformen
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

Die fertigen Installer finden Sie im `release/` Ordner.

## 📦 Release erstellen

Releases werden automatisch über GitHub Actions erstellt, wenn ein neuer Tag gepusht wird:

```bash
# Version in package.json erhöhen, dann:
git tag v1.0.0
git push origin v1.0.0
```

Die GitHub Action baut automatisch die Apps für Windows, macOS und Linux und erstellt ein Release mit allen Installern.

## 🏗️ Projekt-Struktur

```
pflegedms/
├── electron/           # Electron main & preload scripts
├── src/               # SvelteKit source code
│   ├── routes/        # App routes
│   └── app.html       # HTML template
├── static/            # Static assets
├── assets/            # Build assets (icons, etc.)
├── build/             # Built web app (generated)
├── release/           # Built desktop apps (generated)
└── .github/
    └── workflows/     # GitHub Actions workflows
```

## 🔧 Technologie-Stack

- **Frontend**: SvelteKit
- **Desktop**: Electron
- **Build**: Vite
- **Packaging**: electron-builder
- **CI/CD**: GitHub Actions

## 📝 Lizenz

MIT

## 👥 Team

PflegeDMS Team
