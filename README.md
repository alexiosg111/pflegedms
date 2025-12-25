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

### Grundfunktionen
- 📋 **Patientenverwaltung** - Verwalten Sie alle Patienteninformationen zentral
- 📅 **Terminplanung** - Planen und organisieren Sie Termine effizient
- 📄 **Erweiterte Dokumentenverwaltung** - Professionelles Dokumenten-Management-System (neu in v1.4.0)
- 👥 **Mitarbeiterverwaltung** - Organisieren Sie Ihr Pflegeteam

### Erweiterte Dokumentenverwaltung (v1.4.0)

#### 📁 Dokumentarten & Kategorisierung
- 10 vordefinierte Dokumentkategorien (Pflegeplan, Ärztlicher Bericht, Vertrag, Laborergebnis, etc.)
- Flexible Metadaten für dokumentspezifische Informationen
- Tag-System für individuelle Kategorisierung
- Status-Management (Entwurf, Aktiv, Archiviert, Gelöscht)

#### 🔄 Versionskontrolle
- Automatische Versionierung bei jeder Änderung
- Vollständige Versionshistorie mit Änderungsprotokoll
- Wiederherstellung früherer Versionen mit einem Klick
- Vergleich zwischen Versionen

#### 🔍 Suche & Filter
- Volltextsuche über Titel, Inhalt, Tags und Metadaten
- Erweiterte Filteroptionen nach Kategorie, Status und Tags
- OCR-Text-Suche (Vorbereitung für zukünftige OCR-Integration)
- Echtzeit-Suchergebnisse

#### 📋 Vorlagen (Templates)
- Vordefinierte Templates für häufige Dokumenttypen
- Individuelle Anpassung von Templates
- Schnelle Dokumenterstellung aus Vorlagen
- 3 Standard-Templates: Pflegeplan, Medikationsplan, Pflegedokumentation

#### ✅ Freigabe-Workflow
- Digitale Freigabeprozesse für Dokumente
- Freigabestatus: Ausstehend, Freigegeben, Abgelehnt
- Kommentarfunktion für Freigaben und Ablehnungen
- Vollständiger Freigabe-Verlauf

#### 📊 Audit-Log & Nachverfolgbarkeit
- Vollständiges Protokoll aller Dokumentaktionen
- Erfassung von Benutzer, Zeitpunkt und Aktion
- Nachverfolgung von Erstellung, Bearbeitung, Löschung und Freigaben
- Device-Informationen für Compliance

#### 🤖 Intelligente Funktionen
- Automatische Dokumentklassifikation basierend auf Inhalt
- Metadaten-Extraktion (Datum, Diagnose, Arzt)
- Vorbereitung für OCR-Integration
- Pattern-basierte Erkennung von Dokumenttypen

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
