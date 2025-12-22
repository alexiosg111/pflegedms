# Release Process für PflegeDMS

## ✅ Problem behoben!

Das Release-System wurde repariert. Hier ist die korrekte Anleitung:

## Warum gab es keine .exe/.dmg Dateien?

Das Problem war, dass **Git-Tags** fehlten. Die GitHub Actions sind so konfiguriert, dass sie nur bei `v*` Tags (z.B. `v1.0.0`) laufen und Release-Artefakte erstellen.

## ✅ Was wurde repariert:

1. **Alte Branches gelöscht** - Repository ist jetzt sauber
2. **Tag v1.0.0 erstellt** - Erstes Release wird jetzt automatisch gebaut
3. **GitHub Actions läuft** - .exe/.dmg werden erstellt

## 📋 Korrekter Release-Prozess:

### Schritt 1: Version in package.json erhöhen
```bash
# package.json bearbeiten:
"version": "1.1.0"  # Erhöhen von 1.0.0
```

### Schritt 2: Changes committen
```bash
git add .
git commit -m "Bump version to 1.1.0"
git push origin main
```

### Schritt 3: Release-Tag erstellen
```bash
git tag v1.1.0
git push origin v1.1.0
```

### Schritt 4: GitHub Actions läuft automatisch
- ✅ Windows: `.exe` Installer werden erstellt
- ✅ macOS: `.dmg` und `.zip` werden erstellt  
- ✅ Release wird automatisch auf GitHub erstellt

## 📦 Erwartete Artefakte:

Nach dem Tag-Push findest du in den GitHub Releases:
- **Windows**: `PflegeDMS Setup 1.1.0.exe` (NSIS Installer)
- **Windows**: `PflegeDMS 1.1.0.exe` (Portable)
- **macOS**: `PflegeDMS-1.1.0.dmg` (DMG Installer)
- **macOS**: `PflegeDMS-1.1.0-mac.zip` (ZIP Archive)

## 🔄 Workflow-Details:

```yaml
# GitHub Actions Trigger:
on:
  push:
    tags:
      - 'v*'  # Nur bei v1.0.0, v1.1.0, etc.
```

## ⚡ Schneller Release-Befehl:

```bash
# Alles in einem:
npm version patch && git push origin main && git push origin v$(node -p "require('./package.json').version")
```

## 🧹 Branch-Management:

Lösche alte Feature-Branches nach dem Merge:
```bash
git branch -d feature/branch-name
git push origin --delete feature/branch-name
```

## ❌ Häufige Fehler:

1. **Nur Version erhöhen ohne Tag** → Keine Builds
2. **Tag ohne Version-Bump** → Verwirrung
3. **Alte Branches behalten** → Unordnung

## ✅ Jetzt funktioniert:

- GitHub Actions baut automatisch alle Installer
- Release wird mit allen Artefakten erstellt
- Repository ist sauber ohne alte Branches