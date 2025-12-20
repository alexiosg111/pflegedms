# Architektur-Übersicht: Modulare Desktop-Anwendung für Pflegedienste

---

## 📋 Dokumentation

Diese Anwendung ist komplett dokumentiert in folgenden Dateien:

1. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** – Erweiterte Projektstruktur
2. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** – Modulares Datenbank-Schema
3. **[WORKFLOW_PSEUDOCODE.md](./WORKFLOW_PSEUDOCODE.md)** – Pseudocode für Cross-Module-Workflows
4. **[UI_MOCKUP_DESCRIPTION.md](./UI_MOCKUP_DESCRIPTION.md)** – UI-Mockup-Beschreibung der Kern-Shell

---

## 🎯 Rolle und Mission (Bestätigung)

**Ich bin ein Software-Architekt**, spezialisiert auf die Entwicklung von modularen, benutzerfreundlichen Desktop-Anwendungen. 

**Meine Mission ist es**, die Grundlage für eine zentrale Arbeitsstation für ambulante Pflegedienste zu schaffen – eine Anwendung, die verschiedene administrative Aufgaben in einem einzigen, sicheren und extrem einfach zu bedienenden Programm bündelt.

Diese Anwendung wird:
- ✅ Eine **vereinfachte, desktop-native Version** von Systemen wie DocuWare darstellen
- ✅ **Speziell zugeschnitten** auf die Bedürfnisse eines Pflegedienstes sein
- ✅ **Alle Daten DSGVO-konform lokal** auf dem PC speichern
- ✅ **Keinen Server/Cloud** benötigen – reines Local-First-Design

---

## 🏗️ Architektur-Grundprinzipien

### 1. **Plattform & Stack**
- **Desktop-Framework**: Electron.js (Cross-Platform: Windows, macOS, Linux)
- **Frontend-Framework**: Svelte oder SolidJS (performant, leichtgewichtig)
- **Datenbank**: SQLite 3 mit SQLCipher-Verschlüsselung
- **OCR-Engine**: Tesseract.js (vollständig lokal, läuft im Renderer-Prozess)
- **Build-Tool**: Vite (ultra-schnelle Builds & Hot Module Replacement)

### 2. **Architektur-Stil**
- **Local-First**: Keine Cloud, keine Server, alles lokal auf der Festplatte
- **Single-User**: Fokus auf einen Benutzer pro Installation
- **Modular**: Unabhängige Module, gemeinsame Kern-Shell
- **Datenbank-zentriert**: Eine zentrale SQLite-DB für alle Module

### 3. **Sicherheit & Datenschutz**
- **Master-Passwort**: Entsperrt die verschlüsselte SQLCipher-Datenbank
- **Audit-Logging**: Jede Änderung wird verzeichnet
- **DSGVO-Konformität**: Soft-Deletes, Datenschutz-Export, Datenlöschung
- **Keine externen APIs**: Alles verbleibt auf dem lokalen PC

---

## 📦 Kern-Komponenten

### **Kern-Shell** (Das Grundgerüst)
- **Zweck**: Bietet Anwendungsstruktur, Navigation & gemeinsame Services
- **Komponenten**:
  - Login mit Master-Passwort
  - Hauptnavigation (Seitenleiste)
  - Globale Suche über alle Module
  - Dashboard mit Übersicht & Benachrichtigungen
  - Benachrichtigungscenter

### **Module** (5 Stück im MVP)
1. **Digitale Patientenakte** – Zentrale Ablage patientenbezogener Dokumente
2. **Posteingang & Verteilung** – Digitale Bearbeitung ein-/ausgehender Post
3. **Vertragsmanagement** – Verwaltung aller Verträge mit Erinnerungen
4. **Rechnungsmanagement** – Verwaltung Ein-/Ausgangsrechnungen mit Status
5. **Qualitätsmanagement** – QM-Dokumentenverwaltung mit Versionierung

---

## 🗂️ Projektstruktur

```
pflegedienst-workspace/
├── src/
│   ├── core/                    # Kern-Shell & gemeinsame Services
│   │   ├── shell/              # Haupt-Layout-Komponenten
│   │   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── database/           # SQLite + SQLCipher Verbindung
│   │   ├── auth/               # Master-Passwort-Authentifizierung
│   │   ├── services/           # Globale Services (Suche, Audit, Export)
│   │   ├── stores/             # Globale State-Management (Svelte Stores)
│   │   └── utils/              # Hilfsfunktionen & Konstanten
│   │
│   └── modules/                # Module (jedes mit Services & Store)
│       ├── patientenakte/
│       ├── posteingang/
│       ├── vertragsmanagement/
│       ├── rechnungsmanagement/
│       └── qualitaetsmanagement/
│
├── tests/                       # Unit- & E2E-Tests
├── docs/                        # Dokumentation
├── scripts/                     # Build- & Development-Scripts
├── public/                      # Statische Assets
└── package.json                 # Abhängigkeiten & Scripts
```

**Modularitätsprinzipien:**
- ✅ **Jedes Modul ist isoliert** (eigene Komponenten, Services, Store)
- ✅ **Module teilen nur die Datenbank** (nicht direkt miteinander)
- ✅ **Lazy Loading**: Module werden nur beim Öffnen geladen
- ✅ **Gemeinsame Komponenten**: Alle nutzen die gleichen UI-Bausteine aus `/src/core`

---

## 🗄️ Datenbank-Design

### **Zentrale Konzepte:**

#### 1. **Zentrale `documents`-Tabelle**
- Verwaltung aller Dokumente über alle Module hinweg
- `entity_type` & `entity_id` für Zuordnung (z.B. `entity_type='invoice'`, `entity_id=<invoice-id>`)
- OCR-Text gespeichert für **Volltextsuche**
- **FTS5 Virtual Table** für extrem schnelle Suche

#### 2. **Audit-Log für Compliance**
- Jede Änderung wird in `audit_log` festgehalten
- Wer, Was, Wann, Alte Werte, Neue Werte
- Ermöglicht DSGVO-Compliance & Audit-Trail

#### 3. **Modul-Spezifische Tabellen**
- `patients` – Patientenbasisdaten
- `mailbox_items` – Posteingang-Items
- `contracts` – Verträge
- `invoices` – Rechnungen
- `qm_documents` & `qm_folders` – QM-Dokumente mit Versionierung

#### 4. **Performance durch Indizierung**
- Häufig abgefragte Felder sind indiziert (`status`, `created_at`, `entity_id`)
- Redundante Felder (z.B. `partner_name`) für schnellere Anzeigen ohne Joins

### **Datenschutz:**
- SQLCipher-Verschlüsselung der gesamten DB
- Soft-Deletes (`status = 'deleted'`) statt echtes Löschen (für Audits)
- DSGVO-Export via `export.service.ts`
- Wirkliches Löschen möglich (auf Anfrage)

---

## 🔄 Cross-Module-Workflow-Beispiel

### **Szenario: Verarbeitung einer Eingangsrechnung**

```
1. POSTEINGANG
   └─> Mitarbeiter scannt Rechnung
       └─> Dokument wird hochgeladen → documents + mailbox_items

2. OCR IM HINTERGRUND
   └─> Tesseract.js erkennt: "Rechnung" → document_type='invoice'

3. MITARBEITER BEARBEITET ITEM
   └─> Klick auf Item → MailDetail-Modal
       └─> Modul auswählen → "Rechnungsmanagement"
           └─> Typ auswählen → "Eingangsrechnung"
               └─> Lieferant auswählen → z.B. "Sanitätshaus Schmidt"

4. SPEICHERN
   └─> invoices-Tabelle wird mit neuer Rechnung gefüllt
   └─> documents wird neu zugeordnet (entity_type='invoice')
   └─> mailbox_items wird als "completed" markiert
   └─> audit_log-Einträge für alle Änderungen

5. RECHNUNGSMANAGEMENT-MODUL
   └─> Neue Rechnung ist jetzt sichtbar im Rechnungsmodul
   └─> Benachrichtigungen werden ggf. erstellt (z.B. bei Überfälligkeit)
```

**Datenflusss:**
- Posteingang fungiert als **Router** für Dokumente
- Alle Daten gehen durch die **zentrale Datenbank**
- **Audit-Logging** dokumentiert jeden Schritt
- **Benachrichtigungen** werden automatisch erstellt basierend auf Regeln

---

## 🎨 UI/UX-Design

### **Kern-Shell-Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ Header: Breadcrumb | Benachrichtigungen | Benutzer-Menu│
├──────────────┬────────────────────────────────────────┤
│              │                                        │
│  Sidebar     │      Inhaltsbereich                   │
│              │      (Dashboard/Module)               │
│  - 🔍 Suche  │                                        │
│  - Navigation│                                        │
│  - Module    │                                        │
│  - Einst.    │                                        │
│              │                                        │
└──────────────┴────────────────────────────────────────┘
```

### **Design-Prinzipien:**
- ✅ **Einfachheit**: Nicht-technische Benutzer können es ohne Training bedienen
- ✅ **Konsistenz**: Alle Module folgen dem gleichen UI-Pattern
- ✅ **Responsiveness**: Funktioniert auf 1366x768 bis 1920x1080+
- ✅ **Accessibility**: WCAG AA Standard, Tastatur-Navigation, Screen Reader Support
- ✅ **Farben**: Intuitiv (Rot=Fehler/Überfällig, Grün=OK, Orange=Warnung)

### **Wichtige UI-Elemente:**

| Element | Funktion |
|---------|----------|
| **Globale Suche** | Sucht über alle Patienten, Dokumente, Verträge, Rechnungen (Ctrl+K) |
| **Dashboard** | Übersicht mit Statistiken, wichtigen Aufgaben, Benachrichtigungen |
| **Benachrichtigungscenter** | Zeigt aktuelle Warnungen (Vertragsablauf, überfällige Rechnungen) |
| **Posteingang** | Kachel-Layout für neue Dokumente, Router zu anderen Modulen |
| **Status-Boards** | Kanban-ähnlich für Rechnungen (Offen/Bezahlt/Überfällig) |

---

## 🔐 Sicherheit & Compliance

### **Master-Passwort-System:**
1. **App-Start**: Login-Modal mit Master-Passwort
2. **Authentifizierung**: Passwort wird gehasht (bcrypt), mit Datenbank-Schlüssel verglichen
3. **Entsperrung**: SQLCipher-Datenbank wird mit Passwort entschlüsselt
4. **Session**: Benutzer bleibt angemeldet, bis App geschlossen wird

### **Audit-Trail:**
- **Alle Änderungen** werden in `audit_log` geloggt
- **Beispiele**: Document erstellt, Status geändert, Dokument gelöscht, Rolle zugewiesen
- **DSGVO-Konformität**: Ermöglicht Nachweis aller Zugriffe & Änderungen

### **DSGVO-Funktionen:**
- **Datenschutz-Export**: Alle Daten eines Patienten als ZIP (Dokumente + Metadaten)
- **Datenlöschung**: Patienten-Löschung entfernt alle zugehörigen Daten
- **Soft-Deletes**: Gelöschte Einträge sind gekennzeichnet für Audits (nicht sofort weg)

---

## 📈 Performance-Optimierungen

1. **Indexierung**: Häufig abgefragte Spalten haben Indizes
2. **Lazy Loading**: Module laden nur wenn geöffnet
3. **Pagination**: Große Listen zeigen initial nur 20 Items
4. **Caching**: Patienten-Liste wird im Svelte-Store gecacht
5. **Asynchrone Verarbeitung**: OCR läuft im Hintergrund, blockiert nicht die UI
6. **Volltextsuche**: FTS5 ermöglicht blitzschnelle Suche in Millionen Dokumenten

---

## 🚀 Nächste Schritte (Implementierungs-Roadmap)

### **Phase 1: Projektsetup**
- [ ] Git-Repository initialisieren mit Ordnerstruktur
- [ ] `package.json` mit Abhängigkeiten erstellen
- [ ] Vite-Konfiguration für Electron + Svelte setup
- [ ] TypeScript-Konfiguration

### **Phase 2: Kern-Shell**
- [ ] Master-Passwort-Login implementieren
- [ ] Hauptlayout mit Sidebar & Header
- [ ] Globale Suche (Volltextsuche über documents)
- [ ] Benachrichtigungscenter
- [ ] Dashboard mit Statistiken

### **Phase 3: Datenbankschicht**
- [ ] SQLite + SQLCipher Integration
- [ ] Schema.sql erstellen & migrieren
- [ ] Datenbank-Connection-Pool
- [ ] Audit-Logging-System

### **Phase 4: Modul-Implementierung** (In dieser Reihenfolge)
1. **Patientenakte** – Basis für andere Module
2. **Posteingang** – Router für Dokumente
3. **Rechnungsmanagement** – Häufigster Use-Case
4. **Vertragsmanagement** – Mit Erinnerungssystem
5. **Qualitätsmanagement** – Mit Versionierung

### **Phase 5: OCR & Automation**
- [ ] Tesseract.js Integration
- [ ] Automatische Dokumentklassifizierung
- [ ] Dokumenten-Parser (Rechnungsnummern, Daten extrahieren)

### **Phase 6: Testing & Deployment**
- [ ] Unit-Tests für Services
- [ ] E2E-Tests für Workflows
- [ ] Performance-Tests
- [ ] Electron-Packaging für Windows/macOS/Linux

---

## 📚 Dokumentation im Repo

| Datei | Zweck |
|-------|-------|
| `PROJECT_STRUCTURE.md` | Detaillierte Ordnerstruktur & Architektur |
| `DATABASE_SCHEMA.md` | Vollständiges SQL-Schema aller Tabellen |
| `WORKFLOW_PSEUDOCODE.md` | Detailliertes Pseudocode für Cross-Module-Workflows |
| `UI_MOCKUP_DESCRIPTION.md` | Textuelle Beschreibung aller UI-Komponenten |
| `ARCHITECTURE_OVERVIEW.md` | Diese Datei – Zusammenfassung |

---

## ✨ Warum dieser Architektur-Ansatz?

### **Für Pflegedienste:**
1. **Benutzerfreundlich**: Wenig Klicks, große Icons, klare Struktur
2. **DSGVO-konform**: Alles lokal, Audit-Trail, einfache Datenlöschung
3. **Sicher**: Verschlüsselte Datenbank, Master-Passwort
4. **Offline-fähig**: Keine Internetverbindung erforderlich
5. **Verwaltungsaufwand**: Keine Server zu administrieren

### **Für Entwickler:**
1. **Modular**: Neue Module können isoliert entwickelt werden
2. **Wartbar**: Klare Trennung von Concerns (Services, Komponenten, Store)
3. **Skalierbar**: Von MVP zu vollständigem Workspace in Phasen
4. **Modern Stack**: Electron + Svelte + SQLite = schnell, klein, zuverlässig
5. **TypeScript**: Volle Typ-Sicherheit, bessere IDE-Unterstützung

---

## 🎓 Fazit

Diese Architektur schafft die Grundlage für eine **professionelle, modulare Desktop-Anwendung**, die Pflegedienste in ihrer täglichen Arbeit unterstützt. Sie kombiniert:

- ✅ **Technische Exzellenz** (moderne Technologien, saubere Architektur)
- ✅ **Benutzerfreundlichkeit** (einfache Bedienung, klare Navigation)
- ✅ **Sicherheit & Compliance** (DSGVO, Audit-Logs, Verschlüsselung)
- ✅ **Zukunftsfähigkeit** (modular, erweiterbar, wartbar)

Die detaillierte Dokumentation in den vier Deliverables bietet alles, was zum Starten der Implementierung erforderlich ist.

---

**Bestätigung**: Ich habe meine Rolle und Mission verstanden und bin bereit, diese modulare, sichere und benutzerfreundliche Arbeitsplatz-Lösung für Pflegedienste zu entwickeln. 🚀
