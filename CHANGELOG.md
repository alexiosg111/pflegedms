# Changelog

All notable changes to PflegeDMS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.0] - 2024-12-27

### Added - OCR Document Text Extraction

#### New OCR Feature
- **OCR Text Extraction**: Automatically extract text from scanned documents using Tesseract.js
- **Confidence-Based Verification**: View confidence scores for each extracted line of text
  - High confidence (80-100%): Green indicator
  - Medium confidence (60-80%): Yellow indicator
  - Low confidence (<60%): Red indicator, requires manual verification
- **Interactive Verification Interface**: Split-view panel showing original image and extracted text side-by-side
  - Left panel: Original document with dynamic line highlighting
  - Right panel: Line-by-line verification with edit capabilities
  - Zoom and pan controls for better document readability
- **Human-in-the-Loop Workflow**: Manual verification and correction of extracted text
  - Click-to-edit inline text corrections
  - Quick verify/reject buttons for each line
  - Progress tracking with visual indicators
- **Batch Operations**:
  - Auto-verify all high confidence lines (>85%)
  - Jump to low confidence lines for quick review
  - Filter by verification status or confidence level
- **Multi-Language Support**: German and English OCR recognition (default: German + English)
- **Resume Capability**: Save and resume verification progress
- **Automatic Document Classification**: Detected text is automatically analyzed to suggest document category
- **Metadata Extraction**: Automatically extract dates, diagnoses, and other metadata from OCR text
- **Privacy-First**: All OCR processing runs locally in browser/Electron - no external API calls

#### Technical Implementation
- Added `tesseract.js` dependency for local OCR processing
- New components:
  - `DocumentScanUpload.svelte`: Upload and process document scans
  - `OCRVerificationPanel.svelte`: Split-view verification interface
  - `OCRLineItem.svelte`: Individual line verification component
- New service: `ocrService.ts` with helper functions for OCR operations
- Extended document types with `OCRLine`, `OCRResult`, and `DocumentOCRData` interfaces
- Documents with verified OCR data show 🔍 OCR badge in document list
- Worker-based processing to prevent UI freezing during OCR
- Real-time progress indicators during text extraction

#### UI/UX Enhancements
- New "🔍 OCR Scan" button in documentation module
- Visual badges showing OCR verification status on documents
- Smooth transitions between upload, processing, and verification stages
- Responsive design that works on all screen sizes

### Fixed - Critical Bug Fixes

#### Add Button Fix
- **Fixed "Hinzufügen" button not working**: The add button in all modules now correctly opens the add modal
- **Improved module detection**: Fixed issue where module names weren't properly mapped to form types
- **Fixed staff module**: Staff module now properly opens when clicking add button
- **Better error handling**: More robust type detection for all modules (patients, schedule, documentation, staff)

#### Technical Improvements
- Refactored `openAddModal()` function to accept module IDs directly
- Added support for both singular and plural module names
- Simplified button click handler (removed unreliable `slice()` operation)
- Better TypeScript type safety with optional parameters

### Changed
- Version updated from 1.5.0 to 1.6.0

### Includes all features from v1.5.0
- Modern UI/UX design with animations
- All document management features from v1.4.0
- 10 Document categories
- Full version control
- Advanced search & filtering
- Digital approval workflows
- Complete audit logging
- Automatic document classification
- Document templates
- Tag system

## [1.5.0] - 2024-12-25

### Added - Improved UI/UX Design

#### Visual Enhancements
- **Modern Animations**: Smooth fade-in and slide-in animations throughout the interface
- **Enhanced Cards**: Beautiful gradient backgrounds with subtle hover effects
- **Improved Shadows**: Deeper, more professional shadow effects for better depth perception
- **Better Typography**: Increased font weights and improved letter spacing for better readability
- **Interactive Elements**: Enhanced hover states with smooth transitions and scale effects

#### Dashboard Improvements
- **Animated Statistics**: Statistics cards now have hover animations and glow effects
- **Gradient Backgrounds**: Subtle gradients on cards for a more modern look
- **Enhanced Module Cards**: Improved hover effects with icon animations and color transitions
- **Better Spacing**: Increased padding and margins for a more spacious, breathable layout

#### Document Management UI
- **Improved List Items**: Enhanced document cards with gradient backgrounds
- **Better Hover Effects**: Smooth transitions with transform effects on hover
- **Enhanced Buttons**: Gradient buttons with shine effects and shadow animations
- **Visual Feedback**: Better visual indicators for interactive elements

#### Technical Improvements
- **CSS Animations**: Added keyframe animations (fadeIn, slideIn, pulse)
- **Cubic Bezier Transitions**: Smoother, more natural animation curves
- **Z-index Management**: Proper layering for overlay effects
- **Fixed Background**: Background gradient now fixed for better visual consistency

### Changed
- Version updated from 1.4.0 to 1.5.0
- Footer text updated to "Professional Document Management"
- All card border-radius increased to 20px for more modern look
- Button styles enhanced with gradients and shadow effects
- Increased font sizes for better hierarchy

### Technical
- Added CSS custom properties for better maintainability
- Improved animation performance with GPU-accelerated properties
- Enhanced accessibility with proper focus states
- Better responsive design with improved grid layouts

## [1.4.0] - 2024-12-25

### Added - Erweiterte Dokumentenverwaltung

#### Phase 1: Datenbankstruktur & Dokumentarten-System
- **Dokumentarten-System** mit 10 vordefiniert Kategorien:
  - Pflegeplan
  - Ärztlicher Bericht
  - Vertrag
  - Laborergebnis
  - Verordnung
  - Arztbrief
  - Pflegedokumentation
  - Medikationsplan
  - Einwilligung
  - Sonstiges
- **Erweiterte Document-Struktur**:
  - `category`: Dokumentkategorie
  - `metadata`: Flexible Schlüssel-Wert-Paare für dokumentspezifische Daten
  - `version`: Versionsnummer für Versionskontrolle
  - `status`: Dokumentstatus (draft, active, archived, deleted)
  - `tags`: Tag-System für flexible Kategorisierung
  - `createdAt`, `updatedAt`, `archivedAt`: Zeitstempel für vollständige Historie
- **Automatische Migration** bestehender Dokumente zur neuen Struktur
- **Storage Version Management** für zukünftige Migrationen

#### Phase 2: Versioning & Versionshistorie
- **Vollständige Versionskontrolle**:
  - Automatische Speicherung jeder Dokumentänderung als neue Version
  - Versionsnummer wird automatisch inkrementiert
  - Änderungsdatum und Benutzer werden protokolliert
  - Change-Log für jede Version mit Beschreibung der Änderung
- **Versionswiederherstellung**:
  - Nutzer können zu jeder älteren Version zurückkehren
  - Wiederherstellung erstellt eine neue Version mit Referenz zur Quellversion
- **Versionshistorie-UI**:
  - Übersichtliche Darstellung aller Versionen
  - Anzeige von Änderungsdatum, Benutzer und Change-Log
  - Ein-Klick-Wiederherstellung für jede Version

#### Phase 3: Tags, Suche & Templates
- **Tag-System**:
  - Nutzer können Dokumente mit beliebigen Tags versehen
  - Tags werden kommagetrennt eingegeben
  - Vorschlag verfügbarer Tags beim Filtern
- **Erweiterte Volltext-Suche**:
  - Suche in Titel, Inhalt, Tags und Metadaten
  - Suche funktioniert auch auf OCR-Text (wenn vorhanden)
  - Echtzeit-Suchergebnisse
- **Erweiterte Filter-Optionen**:
  - Filterung nach Kategorie
  - Filterung nach Status
  - Filterung nach Tags (Mehrfachauswahl möglich)
  - Kombinierbare Filter
  - Visueller Indikator für aktive Filter
- **Document Templates**:
  - 3 vordefinierte Templates (Pflegeplan, Medikationsplan, Pflegedokumentation)
  - Templates enthalten vordefinierte Struktur und Metadaten
  - Ein-Klick-Erstellung neuer Dokumente aus Templates
  - Templates können mit Standard-Metadaten versehen werden

#### Phase 4: Zugriffskontrolle & Digitale Freigaben
- **Approval-Workflow**:
  - Dokumente können einen Freigabeprozess durchlaufen
  - Freigabestatus: pending, approved, rejected
  - Approver können Kommentare zur Freigabe/Ablehnung hinzufügen
  - Vollständiger Freigabe-Verlauf wird gespeichert
- **Freigabe-UI**:
  - Visueller Freigabestatus in Dokumentenliste
  - Dedizierter Freigabe-Tab im Dokumentdetail
  - Anzeige aller Freigabe-Einträge mit Kommentaren
  - Ein-Klick-Freigabe und -Ablehnung
- **Audit-Log**:
  - Vollständige Protokollierung aller Dokumentaktionen
  - Erfasste Aktionen: create, edit, delete, view, approve, reject, restore
  - Protokollierte Informationen:
    - Benutzer-ID und -Name
    - Zeitstempel
    - Aktionsdetails
    - Device-Informationen (User-Agent)
  - Chronologische Anzeige im Audit-Log-Tab

#### Phase 5: OCR & Intelligente Klassifikation
- **Automatische Dokumenten-Klassifikation**:
  - Pattern-basierte Erkennung von Dokumenttypen
  - Erkennung anhand von Schlüsselwörtern in Titel und Inhalt
  - Unterstützte Kategorien: Pflegeplan, Laborergebnisse, Medikation, Berichte, etc.
  - Manuelle Korrekturmöglichkeit durch Nutzer
- **Metadaten-Extraktion**:
  - Automatische Extraktion von Datum, Diagnose und Arzt aus Dokumentinhalt
  - Pattern-basierte Erkennung mit Regex
  - Extrahierte Daten werden als Metadaten gespeichert
- **OCR-Vorbereitung**:
  - Datenstruktur für OCR-Text vorhanden
  - Suche funktioniert auch auf OCR-Text
  - Bereit für zukünftige OCR-Integration

### Improved

- **Dashboard-Statistiken**: Anzeige der Anzahl von Patienten, Dokumenten, Terminen und Mitarbeitern
- **Dokumentenliste**: 
  - Verbesserte visuelle Darstellung mit Status-Emojis
  - Versionsnummer-Badge
  - Freigabestatus-Badge
  - Tag-Vorschau (bis zu 3 Tags + Zähler)
  - Bessere Hover-Effekte
- **Dokument-Detail-Ansicht**:
  - Tabbed-Interface (Inhalt, Versionen, Audit-Log, Freigabe)
  - Strukturierte Metadaten-Anzeige
  - Farbcodierte Status- und Freigabe-Badges
  - Übersichtliche Versionshistorie
- **Storage Management**:
  - Zentrale StorageService-Klasse
  - Automatische Migrations-Unterstützung
  - Fehlerbehandlung bei Storage-Operationen

### Technical

- **TypeScript-Definitionen** für alle Datenstrukturen
- **Modulare Komponenten-Architektur**:
  - `DocumentForm.svelte`: Formular für Dokumenterstellung/-bearbeitung
  - `DocumentDetail.svelte`: Detailansicht mit Tabs
  - `DocumentSearch.svelte`: Erweiterte Such- und Filterkomponente
- **Service-Layer**:
  - `documentService.ts`: Business-Logik für Dokumentenverwaltung
  - `storageService.ts`: Abstrahierte Storage-Verwaltung
  - `types.ts`: TypeScript-Definitionen
- **Svelte Store Pattern** für reaktive Datenhandhabung
- **Event-basierte Kommunikation** zwischen Komponenten

### Changed

- Version erhöht von 1.2.0 auf 1.4.0
- Footer zeigt jetzt "Erweiterte Dokumentenverwaltung"

### Migration Notes

- Alle bestehenden Dokumente werden automatisch beim ersten Start migriert
- Storage-Version wird in localStorage gespeichert
- Migration ist nicht-destruktiv - alte Daten bleiben erhalten
- Nach Migration haben alle Dokumente Version 1 und Status "active"

## [1.2.0] - Previous Release

### Added
- Grundlegende Patientenverwaltung
- Terminplanung
- Einfache Dokumentation
- Mitarbeiterverwaltung
- Electron-Desktop-Anwendung
- Multi-Platform-Support (Windows, macOS, Linux)

---

## Future Roadmap

### Geplante Features für v1.5.0+
- [ ] Datei-Upload für Dokumente (PDF, Bilder)
- [ ] Echte OCR-Integration (z.B. Tesseract.js)
- [ ] PDF-Vorschau und -Export
- [ ] Erweiterte Benutzer- und Rollenverwaltung
- [ ] Digitale Signaturen
- [ ] SQLite-Datenbank statt localStorage
- [ ] Offline-First-Architektur mit Sync
- [ ] Erweiterte Reporting- und Export-Funktionen
- [ ] Kalender-Integration
- [ ] Benachrichtigungssystem
- [ ] Multi-Sprachen-Support
