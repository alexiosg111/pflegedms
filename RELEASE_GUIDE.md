# Release Guide für PflegeDMS

## Überblick

Dieses Projekt ist so konfiguriert, dass automatisch Desktop-Installer für Windows (.exe), macOS (.dmg) und Linux (.AppImage/.deb) erstellt werden, wenn ein neuer Release-Tag erstellt wird.

## Wie funktioniert es?

1. **GitHub Actions Workflow**: Die Datei `.github/workflows/build-release.yml` enthält die Automatisierung
2. **Electron Builder**: Konfiguriert in `package.json` unter dem `"build"` Schlüssel
3. **Automatische Veröffentlichung**: Wenn ein Tag gepusht wird, werden die Installer automatisch gebaut und als GitHub Release veröffentlicht

## Einen Release erstellen

### Schritt 1: Version erhöhen

Bearbeiten Sie `package.json` und erhöhen Sie die `version`:

```json
{
  "version": "1.0.0"  // ← Diese Zahl erhöhen
}
```

### Schritt 2: Änderungen committen

```bash
git add package.json
git commit -m "Bump version to 1.0.0"
git push
```

### Schritt 3: Tag erstellen und pushen

```bash
# Tag erstellen
git tag v1.0.0

# Tag zu GitHub pushen
git push origin v1.0.0
```

### Schritt 4: Automatischer Build

Sobald der Tag gepusht wurde:

1. GitHub Actions startet automatisch
2. Der Workflow baut die App für alle Plattformen:
   - Windows: `PflegeDMS-Setup-1.0.0.exe` (Installer) und `PflegeDMS-1.0.0.exe` (Portable)
   - macOS: `PflegeDMS-1.0.0.dmg` (Intel) und `PflegeDMS-1.0.0-arm64.dmg` (Apple Silicon)
   - Linux: `PflegeDMS-1.0.0.AppImage` und `pflegedms_1.0.0_amd64.deb`
3. Ein neuer GitHub Release wird automatisch erstellt
4. Alle Installer werden dem Release hinzugefügt

### Schritt 5: Release prüfen

1. Gehen Sie zu: https://github.com/alexiosg111/pflegedms/releases
2. Der neue Release sollte sichtbar sein mit allen Installern zum Download

## Was Benutzer sehen

Benutzer können auf die [Releases-Seite](https://github.com/alexiosg111/pflegedms/releases) gehen und:

- **Windows-Benutzer**: Die `.exe` Datei herunterladen und installieren
- **macOS-Benutzer**: Die `.dmg` Datei herunterladen und installieren
- **Linux-Benutzer**: Die `.AppImage` oder `.deb` Datei herunterladen

## Workflow-Details

Der Workflow (`.github/workflows/build-release.yml`):

- **Trigger**: Läuft bei jedem `v*` Tag (z.B. `v1.0.0`, `v2.1.0`)
- **Plattformen**: Baut auf Windows, macOS und Linux
- **Artifacts**: Speichert alle Installer als Build-Artifacts
- **Release**: Erstellt automatisch einen GitHub Release mit allen Dateien

## Lokales Testen

Wenn Sie die Installer lokal bauen möchten:

```bash
# Alle Plattformen (nur auf macOS möglich)
npm run electron:build

# Spezifische Plattformen
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

Die fertigen Installer finden Sie im `release/` Ordner.

## Wichtige Hinweise

1. **Code Signing**: Aktuell sind die Apps nicht code-signed. Für Production sollten Sie Code-Signing-Zertifikate hinzufügen
2. **Icon**: Ersetzen Sie `assets/icon.png` mit einem echten Icon (aktuell nur Platzhalter)
3. **Auto-Update**: Für automatische Updates können Sie electron-updater integrieren
4. **Notarization**: macOS Apps sollten notarisiert werden für moderne macOS Versionen

## Troubleshooting

### Build schlägt fehl

1. Prüfen Sie die GitHub Actions Logs unter "Actions" Tab
2. Stellen Sie sicher, dass alle Dependencies korrekt sind
3. Testen Sie lokal mit `npm run electron:build`

### Release wird nicht erstellt

1. Prüfen Sie, dass der Tag mit `v` beginnt (z.B. `v1.0.0`)
2. Stellen Sie sicher, dass GitHub Actions in den Repository-Einstellungen aktiviert ist
3. Prüfen Sie, dass `GITHUB_TOKEN` Permissions korrekt sind

### Installer starten nicht

1. Windows: Benutzer müssen eventuell SmartScreen überspringen (nicht signiert)
2. macOS: Benutzer müssen die App über "Sicherheit & Datenschutz" freigeben
3. Linux: AppImage muss ausführbar gemacht werden (`chmod +x`)
