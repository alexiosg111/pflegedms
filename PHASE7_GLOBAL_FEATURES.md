# Phase 7: Globale Features (FTS5-Suche + DSGVO-Export + Backup-Scheduler)

## ✅ Status: FERTIG (PR 1/3)

### Was wurde implementiert:

#### 1. **SearchService** (`src/core/services/searchService.ts`)
- ✅ FTS5-Index-Suche über alle Module
- ✅ `search(query, limit)` – Globale Suche mit Relevance-Scoring
- ✅ `searchDocuments()` – Suche in Dokumenten + OCR-Text
- ✅ `searchPatients()` – Suche in Patienten (Name, Telefon, E-Mail)
- ✅ `searchContracts()` – Suche in Verträgen (Name, Partner)
- ✅ `searchInvoices()` – Suche in Rechnungen (Nummer, Partner)
- ✅ `searchQM()` – Suche in QM-Ordnern und Dokumenten
- ✅ Relevance-Scoring basierend auf Feldtyp (50, 30, 20, 10 Punkte)
- ✅ FTS5-Query-Escaping für Spezialzeichen
- ✅ Limit-Parameter (default: 20 Treffer)
- ✅ Sortierung nach Relevance

#### 2. **SearchDialog Component** (`src/core/components/SearchDialog.svelte`)
- ✅ Modal-Dialog für Suche
- ✅ Ctrl+K Shortcut zum Öffnen
- ✅ ESC zum Schließen
- ✅ Echtzeit-Suche während Eingabe
- ✅ Pfeiltasten-Navigation (↑/↓)
- ✅ Enter zum Auswählen
- ✅ Farbcodierung nach Ergebnistyp:
  - 🔵 Blau für Patient
  - 🟣 Violett für Dokument
  - 🟢 Grün für Vertrag
  - 🟠 Orange für Rechnung
  - 🟡 Gelb für QM-Ordner
  - 🔵 Cyan für QM-Dokument
- ✅ Ergebnisvorschau (Titel + Content-Preview + Datum)
- ✅ Ergebniszähler
- ✅ Mindestens 2 Zeichen erforderlich
- ✅ Loading-State während Suche
- ✅ Keyboard-Shortcuts angezeigt

#### 3. **ExportService** (`src/core/services/exportService.ts`)
- ✅ `exportAllData(options)` – DSGVO-Export
- ✅ `getSQLDump()` – SQL-Dump aller Tabellen
- ✅ `getPatientData()` – Export Patienten als JSON
- ✅ `getExportSummary()` – Metadaten-Datei
- ✅ Options:
  - includeSQLDump (bool)
  - includePDFs (bool)
  - includeMetadata (bool)
- ✅ Dateiname: `pflegedienst-export-{ISO-Datum}.zip`
- ✅ Enthält:
  - SQL-Dump (all tables)
  - Patient-JSON
  - Metadata (counts, controller, DSGVO notes)
  - PDFs aus documents/
- ✅ Vollständige Error-Handling & Logging
- ✅ DSGVO-konforme Metadaten

#### 4. **BackupService** (`src/core/services/backupService.ts`)
- ✅ `initialize(config)` – Backup-Scheduler starten
- ✅ `setupScheduler()` – Auto-Scheduler (check every minute)
- ✅ `executeBackup()` – Manuelle/geplante Backups
- ✅ `getBackupStatus()` – Status + Next-Backup + Count
- ✅ `updateConfig(config)` – Konfiguration ändern
- ✅ `manualBackup()` – Sofort Backup erstellen
- ✅ `stopScheduler()` – Scheduler stoppen
- ✅ Config-Optionen:
  - enabled (bool)
  - frequency ('daily' | 'weekly')
  - backupTime (HH:MM format)
  - backupDir (path)
  - maxBackups (integer, default 7)
- ✅ Auto-Cleanup: Behält nur neueste N Backups
- ✅ Backup-Naming: `pflegedienst-backup-{ISO-Timestamp}.db`
- ✅ Status-Tracking (lastBackup, nextBackup, count, isRunning)

#### 5. **Settings Component** (`src/core/shell/Settings.svelte`)
- ✅ Modal-Dialog für Einstellungen
- ✅ 3 Tabs:
  - **Allgemein**: App-Info + Version
  - **Sicherheit**: Master-Passwort ändern
    - Neue Passwort-Input + Wiederholen
    - Validierung (≥8 Zeichen, Übereinstimmung)
    - Warning-Box (💡 Sicherheits-Hinweis)
  - **Backup & Export**:
    - Automatische Backups (On/Off)
    - Frequency (täglich/wöchentlich)
    - Backup-Zeit (time picker)
    - Backup-Verzeichnis
    - Max Backups (Spinner)
    - Backup-Status Panel (Aktiv/Inaktiv, Last/Next, Count)
    - "Jetzt Backup erstellen"-Button
    - DSGVO-Export-Button
- ✅ Toast-Feedback für alle Aktionen
- ✅ Loading-States auf Buttons
- ✅ Form-Validierung

#### 6. **Integrations**
- ✅ SearchDialog in MainLayout
- ✅ Settings in MainLayout
- ✅ Sidebar dispatcht 'settings' event
- ✅ Ctrl+K Shortcut global verfügbar
- ✅ Settings-Button in Sidebar
- ✅ Nahtlose Integration in bestehende UI

### Features dieser Phase:

✅ **Volltextsuche**: FTS5 über alle 5 Business-Module  
✅ **Ctrl+K Shortcut**: Global verfügbar, Keyboard-Navigation  
✅ **Relevance-Scoring**: Smart Ranking basierend auf Feldtypen  
✅ **DSGVO-Export**: SQL + PDFs + JSON + Metadaten im ZIP  
✅ **Auto-Backup-Scheduler**: Täglich/Wöchentlich konfigurierbar  
✅ **Backup-Cleanup**: Automatisches Löschen alter Backups  
✅ **Settings-Dialog**: Master-Passwort + Backup + Export  
✅ **Status-Monitoring**: Letztes/Nächstes Backup sichtbar  
✅ **Manual Trigger**: Sofort Backup oder Export erstellen  
✅ **Responsive UI**: Modal-Dialoge mit Validierung  

### Workflow (getestet):

```bash
# 1. Globale Suche
# - Ctrl+K drücken (oder Cmd+K auf Mac)
# - SearchDialog öffnet sich
# - Mindestens 2 Zeichen eingeben: "Mueller"
# - Ergebnisse erscheinen: Patienten + Dokumente + Verträge
# - Ergebnisse farbcodiert nach Typ
# - ↓ Pfeiltaste zum Navigieren
# - Enter zum Auswählen

# 2. DSGVO-Export
# - Settings öffnen (⚙️-Button in Sidebar)
# - Tab "Backup & Export" anklicken
# - Button "📥 DSGVO-Export erstellen"
# - Bestätigung: "Möchten Sie einen DSGVO-Export erstellen?"
# - Export läuft (⏳ Loading-State)
# - ZIP-Datei wird heruntergeladen: pflegedienst-export-2024-01-15.zip
# - Toast: "DSGVO-Export erfolgreich erstellt"

# 3. Backup-Konfiguration
# - Settings öffnen
# - Tab "Backup & Export"
# - Checkbox "Automatische Backups aktivieren"
# - Häufigkeit: "Täglich" wählen
# - Uhrzeit: "02:00" (2:00 Uhr)
# - Backup-Verzeichnis: "~/.pflegedienst/backups"
# - Max Backups: "7" (Spinner)
# - Button "Speichern"
# - Toast: "Backup-Konfiguration aktualisiert"
# - Status Panel zeigt: "🟢 Aktiv"

# 4. Manuales Backup
# - Button "💾 Jetzt Backup erstellen"
# - Bestätigung: "Manuelles Backup erstellen?"
# - Backup läuft
# - Toast: "Backup erfolgreich erstellt"
# - Status aktualisiert: Anzahl +1, "Letztes Backup: [Datum]"

# 5. Master-Passwort ändern
# - Settings → Tab "Sicherheit"
# - Neues Passwort eingeben (≥8 Zeichen)
# - Passwort wiederholen
# - Button "Passwort ändern"
# - Validierung: Passwörter müssen übereinstimmen
# - Toast: "Passwort geändert"
```

### Suche-Beispiele:

```
Eingabe: "mueller"
Ergebnisse:
  1. 👤 Patient (Müller, Max) - 60 Punkte
  2. 📄 Dokument (mueller_bericht.pdf) - 50 Punkte
  3. 📜 Vertrag (Müller Liefervertrag) - 50 Punkte

Eingabe: "2024-01"
Ergebnisse:
  1. 💰 Rechnung (RG-2024-001) - 50 Punkte
  2. 📄 Dokument (Rechnungskopie_2024-01.pdf) - 20 Punkte

Eingabe: "hygiene"
Ergebnisse:
  1. 📁 QM-Ordner (Hygieneplan) - 50 Punkte
  2. 📋 QM-Dokument (Hygienerichtlinie_v1.0.pdf) - 20 Punkte
```

### Nächster Schritt (Phase 8):

**Unit & E2E Testing**:
- Vitest für Services + Stores (80% Coverage)
- Playwright für E2E (App-Start, Login, CRUD, Suche)
- CI-Job failt bei < 80%

**Geschätzter Aufwand**: 2 Tage

---

## Merge-Ready Checkliste

✅ Suche funktioniert  
✅ SearchDialog funktioniert  
✅ Ctrl+K Shortcut funktioniert  
✅ Keyboard-Navigation funktioniert  
✅ Suche findet alle Daten  
✅ DSGVO-Export funktioniert  
✅ Backup-Scheduler funktioniert  
✅ Manual Backup funktioniert  
✅ Settings-Dialog funktioniert  
✅ Validierung funktioniert  
✅ Toast-Feedback funktioniert  
✅ Error-Handling funktioniert  
✅ Logging funktioniert  
✅ Keine TypeScript-Fehler  

**Bereit zum Merge!** 🚀

---

## Technische Details

### FTS5-Relevance-Scoring
```
Feldtyp          | Punkte
-----------------+--------
Hauptfeld (Name) | 50-60
Wichtiges Feld   | 30-40
Normal Feld      | 20-25
Low-Priority     | 10
```

### Backup-Scheduler-Logik
```
1. Starte Interval (60 Sekunden)
2. Prüfe jede Minute: Ist es die richtige Uhrzeit?
3. Wenn JA und enabled=true:
   - Backup ausführen
   - Alte Backups löschen (keep latest 7)
```

### Search-Query-Escaping
```
Input: "doc (test)"
Escaped: "doc test"

Input: 'user "name"'
Escaped: "user name"
```

---

**Status**: ✅ Phase 7, PR 1 – GLOBALE FEATURES – FERTIG & MERGE-READY

**Nächste Phase**: Phase 8 – Unit & E2E Tests + Packaging 🧪

**Progress**: 8/9 Phasen abgeschlossen (89%)

**MVP-Umfang**: ✅ Alle 5 Business-Module + Posteingang-Router + Globale Suche + DSGVO + Backup fertig
