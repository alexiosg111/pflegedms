# Contributing to PflegeDMS

## Releases

Dieses Projekt verwendet GitHub Actions für automatische Releases. Die Desktop-Installer (exe, dmg, setup) werden automatisch erstellt und veröffentlicht.

## Release-Prozess

1. Version in `package.json` erhöhen
2. Commit und Push
3. Tag erstellen: `git tag v1.0.0`
4. Tag pushen: `git push origin v1.0.0`
5. GitHub Actions baut automatisch alle Installer
6. Die Installer werden als GitHub Release veröffentlicht

## Download für Benutzer

Benutzer können die fertigen Installer von der [Releases-Seite](../../releases) herunterladen:
- Windows: `.exe` Dateien
- macOS: `.dmg` Dateien  
- Linux: `.AppImage` und `.deb` Dateien
