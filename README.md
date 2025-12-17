# 🏥 Pflegedienst Workspace – Modulare Desktop-Anwendung

## Überblick

**Pflegedienst Workspace** ist eine sichere, modulare Desktop-Anwendung für ambulante Pflegedienste. Sie bündelt wichtige administrative Aufgaben (Patientenmanagement, Dokumentenverwaltung, Rechnungsmanagement, Vertragsmanagement, Qualitätsmanagement) in **einem einzigen, lokalen, verschlüsselten Programm**.

### 🎯 Besonderheiten

- ✅ **Local-First**: Keine Cloud, keine Server – alles bleibt auf dem lokalen PC
- ✅ **DSGVO-konform**: Verschlüsselte Datenbank, Audit-Logs, sichere Datenlöschung
- ✅ **Benutzerfreundlich**: Für nicht-technische Nutzer (Pflegekräfte, Verwaltung)
- ✅ **Modular**: 5 unabhängige Module, erweiterbar
- ✅ **Cross-Platform**: Windows, macOS, Linux (via Electron)
- ✅ **OCR-fähig**: Vollautomatische Texterkennung mit Tesseract.js

---

## 📦 Module

| Modul | Funktion |
|-------|----------|
| **👤 Patientenakte** | Zentrale Ablage aller patientenbezogenen Dokumente |
| **📮 Posteingang** | Digitale Bearbeitung ein-/ausgehender Post & Routing |
| **📜 Vertragsmanagement** | Verwaltung aller Verträge mit automatischen Erinnerungen |
| **💰 Rechnungsmanagement** | Ein-/Ausgangsrechnungen mit Status-Tracking |
| **✅ Qualitätsmgmt.** | QM-Dokumentenverwaltung mit Versionierung |

---

## 🚀 Quick Start

### Voraussetzungen

- Node.js 18 LTS oder 20 LTS
- npm oder yarn
- Git

### Installation

```bash
# Repository klonen
git clone <repository-url>
cd pflegedienst-workspace

# Dependencies installieren
npm install

# Im Development-Modus starten
npm run dev

# Mit Electron-App starten
npm run electron
```

### Build

```bash
# Production-Build
npm run build

# Electron-App packen (Windows/macOS/Linux)
npm run build:electron

# Installer erstellen
npm run dist
```

---

## 📚 Dokumentation

Die Architektur ist vollständig dokumentiert:

1. **[ARCHITECTURE_OVERVIEW.md](./ARCHITECTURE_OVERVIEW.md)** – Gesamtübersicht & Mission
2. **[PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)** – Detaillierte Ordnerstruktur
3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** – Vollständiges SQL-Schema
4. **[WORKFLOW_PSEUDOCODE.md](./WORKFLOW_PSEUDOCODE.md)** – Cross-Module-Workflows in Pseudocode
5. **[UI_MOCKUP_DESCRIPTION.md](./UI_MOCKUP_DESCRIPTION.md)** – UI/UX-Design-Beschreibung
6. **[TECHNICAL_SPECIFICATIONS.md](./TECHNICAL_SPECIFICATIONS.md)** – Technische Details & Code-Beispiele

---

## 🏗️ Projektstruktur

```
pflegedienst-workspace/
├── src/
│   ├── core/                    # Kern-Shell & gemeinsame Services
│   │   ├── shell/              # Hauptlayout, Sidebar, Dashboard
│   │   ├── components/         # Wiederverwendbare UI-Komponenten
│   │   ├── database/           # SQLite + SQLCipher
│   │   ├── auth/               # Master-Passwort-Auth
│   │   ├── services/           # Globale Services (Suche, Audit, Export)
│   │   └── stores/             # State Management
│   │
│   └── modules/                # 5 unabhängige Module
│       ├── patientenakte/
│       ├── posteingang/
│       ├── vertragsmanagement/
│       ├── rechnungsmanagement/
│       └── qualitaetsmanagement/
│
├── tests/                       # Unit- & E2E-Tests
├── public/                      # Statische Assets
├── docs/                        # Dokumentation
└── scripts/                     # Build- & Dev-Scripts
```

---

## 🔐 Sicherheit & Datenschutz

### Master-Passwort
- Beim Start-Up: Login mit Master-Passwort
- Passwort hasht mit bcrypt
- SQLCipher-Datenbank wird damit entschlüsselt

### Datenbank-Verschlüsselung
- **SQLCipher**: AES-256-Verschlüsselung
- **Alles verschlüsselt**: Dokumente, Patientendaten, Rechnungen
- **Lokal gespeichert**: Keine Cloud-Synchronisation

### Audit-Logging
- **Alle Änderungen** werden in `audit_log` verzeichnet
- **DSGVO-Konformität**: Nachweise für Datenzugriff & -Änderungen
- **Datenlöschung**: Auf Anfrage sofort möglich

### DSGVO-Features
- ✅ **Datenschutz-Export**: Alle Daten eines Patienten als ZIP
- ✅ **Datenlöschung**: Patient-Löschung entfernt zugehörige Daten
- ✅ **Soft-Deletes**: Gelöschte Einträge sind merkierbar (für Audits)

---

## 🛠️ Tech-Stack

| Layer | Technologie |
|-------|-------------|
| **Desktop-Framework** | Electron 27+ |
| **Frontend** | Svelte 4 + Vite 5 |
| **Language** | TypeScript 5.3+ |
| **Datenbank** | SQLite 3 + SQLCipher |
| **OCR** | Tesseract.js |
| **State Mgmt** | Svelte Stores |
| **Testing** | Vitest + Playwright |
| **Styling** | Tailwind CSS oder Bulma |

---

## 📖 Workflow-Beispiel

### Szenario: Verarbeitung einer Eingangsrechnung

```
1. Mitarbeiter öffnet "Posteingang"
2. Scannt Rechnung → Dokument wird hochgeladen
3. OCR läuft im Hintergrund → Typ wird erkannt ("Rechnung")
4. Mitarbeiter klickt auf Item → Modal öffnet sich
5. Wählt "Rechnungsmanagement" → "Eingangsrechnung"
6. Wählt Lieferant "Sanitätshaus Schmidt"
7. Klickt "Speichern"
   → Rechnung wird in invoices-Tabelle erstellt
   → Dokument wird dem Modul zugeordnet
   → Posteingang-Item wird als "erledigt" markiert
   → Audit-Logs werden geschrieben
8. Mitarbeiter öffnet "Rechnungsmanagement"
   → Neue Rechnung ist sichtbar
   → Ggf. Benachrichtigung bei Überfälligkeit
```

**Datenflusss:**
```
Scanner → Posteingang → OCR → Klassifizierung 
         → Zuordnung-Dialog → Zielmodul
         → Datenbank-Transaktion 
         → Audit-Log
         → Benachrichtigungen
```

---

## 🎨 Design-Prinzipien

- **Einfachheit**: Große Icons, klare Struktur, minimale Klicks
- **Konsistenz**: Alle Module folgen dem gleichen UI-Pattern
- **Accessibility**: WCAG AA Standard, Tastatur-Navigation
- **Responsiveness**: 1366x768 bis 1920x1080+
- **Performance**: Progressive Loading, Caching, Smart Indexing

---

## 📊 Geplante Features (Roadmap)

### Phase 1 (MVP) ✅ Dokumentiert
- [x] Kern-Shell mit Navigation & Dashboard
- [x] Datenbankschema & Encryption
- [x] Patientenakte-Modul
- [x] Posteingang-Modul
- [x] Rechnungsmanagement-Modul
- [x] Vertragsmanagement-Modul (mit Erinnerungen)
- [x] Qualitätsmanagement-Modul

### Phase 2 (Geplant)
- [ ] Mehrbenutzersystem
- [ ] Rollen & Berechtigungen
- [ ] Erweiterte Berichte & Statistiken
- [ ] Automatisierte Workflows

### Phase 3 (Zukünftig)
- [ ] Offline-Sync mit Server (optional)
- [ ] Mobile-App für Inspektionen vor Ort
- [ ] KI-gestützte Dokumenten-Klassifizierung

---

## 🧪 Testing

### Unit-Tests
```bash
npm run test
```

### E2E-Tests
```bash
npm run test:e2e
```

### Type-Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

---

## 🤝 Beitragen

Diese Anwendung wurde konzeptionell vollständig durchdacht. Weitere Entwicklung erfolgt in separaten Tasks:

1. Projektsetup (package.json, Vite, TypeScript)
2. Kern-Shell Implementierung
3. Datenbankschicht
4. Module (nacheinander)
5. OCR-Integration
6. Testing & Deployment

---

## 📄 Lizenz

Proprietär – Für Pflegedienste reserviert.

---

## 📞 Support

Bei Fragen zur Architektur oder Implementierung: Siehe die ausführliche Dokumentation im `docs/`-Ordner.

---

## ✨ Warum diese Lösung?

Diese Anwendung löst das Chaos in Pflegediensten:

| Vorher | Nachher |
|--------|---------|
| Papierkram, Excel-Listen | Digitale zentrale Ablage |
| Verschiedene Tools | Ein Programm für alles |
| Fehlerhafte Prozesse | Digitale Workflows |
| Datenschutz-Risiken | DSGVO-konform, verschlüsselt |
| Schlecht trainierbar | Einfach zu bedienen |

Mit **Pflegedienst Workspace** haben Pflegekräfte mehr Zeit für Patienten, statt Zeit mit Papierkram zu verschwenden. ❤️

---

**Status**: Architektur & Spezifikationen ✅ Komplett dokumentiert
**Nächster Schritt**: Implementierung der Projektstruktur & Kern-Shell

---

*Modulare Desktop-Anwendung für Pflegedienste • Local-First • DSGVO-konform • Sichere Verschlüsselung* 🏥✨
