# PflegeDMS - Desktop Application

PflegeDMS ist eine Desktop-Anwendung für das Management von Pflegediensten, basierend auf SvelteKit und Electron.

## Entwicklung

### Voraussetzungen

- Node.js (v18 oder höher)
- npm

### Installation

```bash
npm install
```

### Development Mode (Electron)

Für die Entwicklung mit Electron und automatischem Reload:

```bash
npm run electron:dev
```

Dies startet:
1. Den Vite Dev-Server auf http://localhost:5173
2. Die Electron-App, die auf diesen Server zugreift

### Web Development Mode (nur SvelteKit)

Für reine Web-Entwicklung ohne Electron:

```bash
npm run dev
```

## Build und Packaging

### Für Windows (.exe Installer)

```bash
npm run electron:build:win
```

Erstellt: `dist/PflegeDMS Setup 1.0.0.exe`

### Für macOS (.dmg Installer)

```bash
npm run electron:build:mac
```

Erstellt: `dist/PflegeDMS-1.0.0.dmg`

### Für Linux (AppImage)

```bash
npm run electron:build:linux
```

Erstellt: `dist/PflegeDMS-1.0.0.AppImage`

### Für alle Plattformen

```bash
npm run electron:build
```

## Projektstruktur

```
src/
├── routes/          # SvelteKit Routes (Startseite, Login, etc.)
├── app.html         # HTML Template
├── app.d.ts         # TypeScript Deklarationen
└── routes/
    ├── +layout.svelte
    ├── +page.svelte
    ├── login/+page.svelte
    └── styles.css

electron-main.js     # Electron Main Process
static/              # Statische Assets
```

## Technologien

- **Frontend**: SvelteKit, Svelte, TypeScript
- **Desktop**: Electron.js
- **Build**: Vite, electron-builder

## Anpassungen

### Fenstergröße

In `electron-main.js` anpassen:
```javascript
width: 1200,    // Breite in Pixel
height: 800,    // Höhe in Pixel
```

### Anwendungsname/Version

In `package.json` anpassen:
```json
{
  "name": "pflegedms",
  "version": "1.0.0",
  "productName": "PflegeDMS"
}
```

### Menu

Das Anwendungsmenü kann in `electron-main.js` in der `setupMenu()` Funktion angepasst werden.