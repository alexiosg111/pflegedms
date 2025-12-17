# 🚀 Quick Start Guide – Pflegedienst Workspace

Diese Datei dient als schnelle Orientierung. Für Details siehe die ausführliche Dokumentation.

---

## 📋 4 Deliverables (Alle vorhanden!)

### 1️⃣ **Erweiterte Projektstruktur**
📄 **Datei**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

- Detaillierte Ordnerordnung mit über 60 Komponenten
- Aufteilung in `/src/core` (Kern) und `/src/modules` (5 Module)
- Jedes Modul hat eigene Services, Types, Store, Komponenten

**Schnellübersicht:**
```
src/
├── core/              # Shell, DB, Auth, Services, Stores
└── modules/           # patientenakte, posteingang, verträge, rechnungen, qm
```

---

### 2️⃣ **Modulares Datenbank-Schema**
📄 **Datei**: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)

- **13 Haupttabellen** (Kern + Module)
- **Zentrale `documents`-Tabelle** für alle Module
- **Audit-Log** für DSGVO-Konformität
- **Volltextsuche** mit FTS5 über alle Dokumente

**Tabellenübersicht:**
```
Kern:        documents, audit_log, notifications
Modul 1:     patients, patient_documents
Modul 2:     mailbox_items
Modul 3:     contracts, suppliers
Modul 4:     invoices
Modul 5:     qm_documents, qm_folders, qm_document_versions
```

**Indizierung**: 20+ Indizes für Performance
**Verschlüsselung**: SQLCipher AES-256

---

### 3️⃣ **Pseudocode für Cross-Module-Workflow**
📄 **Datei**: [WORKFLOW_PSEUDOCODE.md](./WORKFLOW_PSEUDOCODE.md)

**Szenario**: Verarbeitung einer Eingangsrechnung vom Sanitätshaus

```
Schritt 1: Posteingang öffnen
     ↓
Schritt 2: Rechnung scannen (OCR im Hintergrund)
     ↓
Schritt 3: Item klicken → Modal öffnet sich
     ↓
Schritt 4: Modul auswählen ("Rechnungsmanagement")
     ↓
Schritt 5: Typ auswählen ("Eingangsrechnung")
     ↓
Schritt 6: Lieferant auswählen ("Sanitätshaus Schmidt")
     ↓
Schritt 7: Speichern → Transaction starten
     ├─ invoices-Tabelle: neue Rechnung
     ├─ documents: entity_type="invoice"
     ├─ mailbox_items: status="completed"
     ├─ audit_log: Alle Änderungen
     └─ notifications: ggf. Erinnerungen
     ↓
Schritt 8: Rechnungsmanagement-Modul → neue Rechnung sichtbar
```

**9 detaillierte Pseudocode-Funktionen** mit:
- Error Handling
- Transaktionsmanagement
- Audit-Logging
- Benachrichtigungen

---

### 4️⃣ **UI-Mockup-Beschreibung für Kern-Shell**
📄 **Datei**: [UI_MOCKUP_DESCRIPTION.md](./UI_MOCKUP_DESCRIPTION.md)

**Layout** (2-Spalten):
```
┌─ Header (Breadcrumb | Notifications | User) ─┐
├─ Sidebar ─┬─ Content Area ────────────────────┤
│ 🔍Search │ Dashboard / Module / Details      │
│ 📊Dash   │                                   │
│ 👤Modul  │                                   │
│ 📮Modul  │                                   │
│ 📜Modul  │                                   │
│ 💰Modul  │                                   │
│ ✅Modul  │                                   │
└──────────┴───────────────────────────────────┘
```

**10 Komponenten detailliert beschrieben:**
1. Seitenleiste mit Navigation
2. Globale Suche (Ctrl+K)
3. Header mit Benachrichtigungen
4. Dashboard mit Kacheln
5. Patienten-Liste
6. Patient-Detailansicht
7. Posteingang (Kanban)
8. Rechnungsmanagement (Status-Board)
9. Vertragsmanagement (Kalender-View)
10. Qualitätsmanagement (Ordnersystem)

**Design:**
- Farben: Blau (Primär), Grün (OK), Orange (Warnung), Rot (Fehler)
- Icons: Feather Icons / Font Awesome
- Responsive: 1024px - 1920px+

---

## 🏗️ Technische Details

### Tech-Stack
```
Electron 27+            → Desktop-App (Windows/Mac/Linux)
Svelte 4 + Vite 5       → Frontend (schnell, klein)
TypeScript 5.3          → Typ-Sicherheit
SQLite 3 + SQLCipher    → Datenbank (verschlüsselt)
Tesseract.js            → OCR (lokal)
better-sqlite3          → DB-Driver (synchron)
```

📄 **Detailliert**: [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)
- `package.json` (komplett)
- Electron-Konfiguration
- Database-Connection-Code
- Svelte-Komponenten-Beispiele
- Service-Pattern
- Store-Pattern
- TypeScript-Interfaces
- Vite-Konfiguration
- Testing-Setup
- Deployment-Config

---

## 🔐 Sicherheit & Compliance

✅ **Master-Passwort**: Beim Start entschlüsselt DB
✅ **SQLCipher**: AES-256 für die gesamte Datenbank
✅ **Audit-Logging**: Jede Änderung wird verzeichnet
✅ **DSGVO-Export**: Alle Daten eines Patienten exportierbar
✅ **Soft-Deletes**: Gelöscht = markiert, nicht sofort weg
✅ **Local-First**: Keine Cloud, keine Server, alles lokal

---

## 📊 Modul-Übersicht

| # | Modul | Tabellen | Key-Features |
|---|-------|----------|--------------|
| 1 | **Patientenakte** | patients, patient_documents | Basisdaten, Dokumente, OCR-Suche |
| 2 | **Posteingang** | mailbox_items | Digitale Workflow, Zuordnung, Router |
| 3 | **Verträge** | contracts, suppliers | Laufzeiten, Auto-Erinnerungen, Status |
| 4 | **Rechnungen** | invoices | Ein-/Ausgang, Status (Offen/Bezahlt/Überfällig) |
| 5 | **QM** | qm_documents, qm_folders, versions | Dokumentation, Versionskontrolle, Ordner |

**Alle 5 Module** sind vollständig dokumentiert mit:
- Datenbank-Schema
- UI-Komponenten
- Services & Business-Logik
- Workflows

---

## 🎯 Implementierungs-Roadmap

### Phase 1: Grundlagen (Woche 1-2)
- [ ] Git-Repository mit Ordnerstruktur
- [ ] `package.json` mit Dependencies
- [ ] Vite + Svelte + TypeScript Setup
- [ ] Electron-Konfiguration (Main + Preload)

### Phase 2: Kern-Shell (Woche 3-4)
- [ ] Login mit Master-Passwort
- [ ] Hauptlayout (Header + Sidebar)
- [ ] Globale Suche
- [ ] Dashboard
- [ ] Benachrichtigungscenter

### Phase 3: Datenbankschicht (Woche 5)
- [ ] SQLite + SQLCipher Integration
- [ ] Schema initialisieren
- [ ] Database-Service erstellen
- [ ] Audit-Logging System

### Phase 4: Module (Woche 6-12)
**Modul 1 - Patientenakte** (Woche 6)
- [ ] Patient-CRUD
- [ ] Dokument-Upload
- [ ] OCR Integration

**Modul 2 - Posteingang** (Woche 7)
- [ ] Mailbox-Item-Management
- [ ] Zuordnungs-Dialog
- [ ] Router zu anderen Modulen

**Modul 3 - Rechnungen** (Woche 8)
- [ ] Invoice-CRUD
- [ ] Status-Board (Kanban)
- [ ] Erinnerungssystem

**Modul 4 - Verträge** (Woche 9)
- [ ] Contract-CRUD
- [ ] Ablauf-Tracking
- [ ] Auto-Erinnerungen

**Modul 5 - QM** (Woche 10-12)
- [ ] Ordner-Navigation
- [ ] Dokument-Versioning
- [ ] Genehmigungsworkflow

### Phase 5: Testing & Deployment (Woche 13+)
- [ ] Unit-Tests
- [ ] E2E-Tests
- [ ] Electron-Builder
- [ ] Installers (Windows/Mac/Linux)

---

## 💡 Key Design Decisions

| Entscheidung | Grund |
|--------------|-------|
| **Electron** | Cross-Platform (Windows/Mac/Linux) |
| **Svelte** | Kleine Bundle, schnell, einfach zu lernen |
| **SQLite** | Lokal, keine Server, leicht zu backup |
| **SQLCipher** | Transparente Verschlüsselung, DSGVO-ready |
| **Tesseract.js** | OCR lokal, keine Cloud-APIs |
| **FTS5** | Extrem schnelle Volltextsuche |
| **Local-First** | Datenschutz an erster Stelle |
| **Modular** | Unabhängige Module, einfach erweiterbar |

---

## 🔗 Dokumentations-Index

| Dokument | Umfang | Inhalt |
|----------|--------|--------|
| **README.md** | 1 Seite | Überblick & Features |
| **ARCHITECTURE_OVERVIEW.md** | 5 Seiten | Gesamtarchitektur & Konzepte |
| **PROJECT_STRUCTURE.md** | 6 Seiten | Detaillierte Ordnerordnung |
| **DATABASE_SCHEMA.md** | 8 Seiten | Alle 13 Tabellen + Indizes |
| **WORKFLOW_PSEUDOCODE.md** | 12 Seiten | 9 detaillierte Funktionen |
| **UI_MOCKUP_DESCRIPTION.md** | 10 Seiten | Layout, Komponenten, Design |
| **TECHNICAL_SPECIFICATIONS.md** | 15 Seiten | Code-Beispiele, Config, Setup |
| **QUICKSTART_GUIDE.md** | Diese Seite | Schnellorientierung |

**Gesamt: 60+ Seiten Dokumentation**

---

## 🎓 Für Anfänger

Wenn du neu im Projekt bist:

1. **Lese zuerst**: [README.md](./README.md) + [ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)
2. **Dann tief einsteigen**: [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
3. **Für die Implementierung**: [TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)

---

## ❓ FAQ

**F: Warum Local-First?**
A: Datenschutz & DSGVO. Alle Patientendaten bleiben auf dem lokalen PC, nicht in der Cloud.

**F: Kann man später Mehrbenutzer hinzufügen?**
A: Ja! Das Schema ist dafür vorbereitet. Im MVP startet man mit Single-User.

**F: Wie funktioniert die Verschlüsselung?**
A: Master-Passwort → bcrypt-Hash → entschlüsselt SQLCipher-DB. Ganz transparent.

**F: Und wenn die DB beschädigt wird?**
A: Backup-System empfohlen. Die DB-Datei kann einfach kopiert werden.

**F: Können Rechnungen automatisch gemailt werden?**
A: Im MVP nein, aber es ist geplant für Phase 2 (einfache PDF-Export & Mail-Integration).

**F: Wie viele Module passen in die App?**
A: Beliebig viele! Das Schema ist beliebig erweiterbar.

---

## 📞 Kontakt & Support

Diese Dokumentation ist **komplett** für MVP-Implementierung. Alle 4 Deliverables sind vorhanden:

✅ 1. Erweiterte Projektstruktur
✅ 2. Modulares Datenbank-Schema  
✅ 3. Pseudocode für Cross-Module-Workflow
✅ 4. UI-Mockup-Beschreibung für Kern-Shell

**Plus**: Technische Spezifikationen, README, Setup-Anweisungen.

---

**Status**: ✨ **100% dokumentiert, bereit für Implementierung**

*Nächster Schritt: Projektsetup starten mit `git init` & `npm init`* 🚀
