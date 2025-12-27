# PflegeDMS v1.8.0 Release Notes

**Release Date:** December 27, 2024

## 🎉 Version 1.8.0 - OCR Document Text Extraction

Version 1.8.0 ist ein Release-Alignment-Update, das alle OCR-Features aus v1.6.0 in einer aktualisierten Versionsnummer bündelt. Diese Version beinhaltet die vollständige OCR-Funktionalität mit allen Verbesserungen und Features.

## ✨ Hauptfeatures (von v1.6.0 übernommen)

### OCR Text-Extraktion
- **Automatische Texterkennung**: Scannen und extrahieren Sie Text aus medizinischen Dokumenten, Rezepten, Laborberichten und mehr
- **Mehrsprachige Unterstützung**: Integrierte Unterstützung für deutsche und englische Texterkennung (Standard: Deutsch + Englisch kombiniert)
- **Datenschutz-zuerst Design**: Alle OCR-Verarbeitung läuft lokal mit Tesseract.js - keine externen API-Aufrufe oder Datenübertragung
- **Hohe Genauigkeit**: Fortschrittliche OCR-Engine mit Konfidenz-Scoring für jede Textzeile

### Interaktive Verifizierungs-Oberfläche
- **Split-View Panel**: 
  - Linkes Panel: Original-Dokumentenbild mit dynamischer Zeilen-Hervorhebung
  - Rechtes Panel: Extrahierter Text mit Zeile-für-Zeile-Verifizierungssteuerung
- **Visuelle Konfidenz-Indikatoren**:
  - 🟢 Grün (80-100%): Hohe Konfidenz - wahrscheinlich korrekt
  - 🟡 Gelb (60-80%): Mittlere Konfidenz - Überprüfung empfohlen
  - 🔴 Rot (<60%): Niedrige Konfidenz - manuelle Verifizierung erforderlich
- **Zoom & Pan-Steuerung**: Verbesserte Dokumenten-Lesbarkeit mit einstellbaren Zoom-Stufen
- **Echtzeit-Hervorhebung**: Ausgewählte Textzeilen werden auf dem Originalbild hervorgehoben

### Human-in-the-Loop Workflow
- **Click-to-Edit**: Inline-Textkorrektur für jede Zeile
- **Schnellaktionen**: Verifizieren (✓) oder bearbeiten Sie jede Zeile mit Ein-Klick-Buttons
- **Fortschritts-Tracking**: Visueller Fortschrittsbalken zeigt Verifizierungs-Abschlussstatus
- **Batch-Operationen**:
  - Auto-Verifizierung aller Zeilen mit hoher Konfidenz (>85%)
  - Direkt zu Zeilen mit niedriger Konfidenz springen für schnelle Überprüfung
  - Filtern nach Verifizierungsstatus oder Konfidenzniveau

### Intelligente Dokumenten-Verarbeitung
- **Automatische Klassifizierung**: Erkannter Text wird analysiert, um Dokumentenkategorie vorzuschlagen
- **Metadaten-Extraktion**: Extrahiert automatisch Daten, Diagnosen, Arztnamen und andere relevante Informationen
- **Durchsuchbarer Inhalt**: Verifizierter OCR-Text wird im Dokumentenmanagementsystem durchsuchbar
- **Versionskontrolle**: OCR-Daten werden in der Dokumentenversionshistorie aufbewahrt

### Benutzererfahrung
- **Nahtlose Integration**: Neuer "🔍 OCR Scan"-Button im Dokumentationsmodul
- **Status-Badges**: Dokumente mit verifizierten OCR-Daten zeigen ein 🔍-Badge in der Liste
- **Speichern & Fortsetzen**: Teilweiser Verifizierungsfortschritt wird gespeichert, sodass Sie später weitermachen können
- **Responsive Design**: Funktioniert auf allen Bildschirmgrößen und Geräten

## 📦 Verfügbare Builds

### Linux
- **AppImage**: `PflegeDMS-1.8.0.AppImage` (118 MB)
  - Universelles Linux-Paket - funktioniert auf allen Distributionen
  - Keine Installation erforderlich, einfach ausführbar machen und starten
  
- **Debian-Paket**: `pflegedms_1.8.0_amd64.deb` (76 MB)
  - Für Debian, Ubuntu und abgeleitete Distributionen
  - Installation mit: `sudo dpkg -i pflegedms_1.8.0_amd64.deb`

## 🔧 Installation

### AppImage (Empfohlen für Linux)
```bash
chmod +x PflegeDMS-1.8.0.AppImage
./PflegeDMS-1.8.0.AppImage
```

### Debian/Ubuntu
```bash
sudo dpkg -i pflegedms_1.8.0_amd64.deb
sudo apt-get install -f  # Abhängigkeiten installieren falls nötig
```

## 🚀 Erste Schritte mit OCR

1. Öffnen Sie das Dokumentationsmodul
2. Klicken Sie auf den "🔍 OCR Scan"-Button
3. Laden Sie ein gescanntes Dokument hoch (JPG, PNG, BMP oder TIFF)
4. Warten Sie auf die automatische Textextraktion
5. Überprüfen und verifizieren Sie den extrahierten Text im Split-View-Panel
6. Nehmen Sie bei Bedarf Korrekturen vor
7. Klicken Sie auf "Verifizierung abschließen", um das Dokument zu speichern

## 💡 Tipps für beste Ergebnisse

- **Bildqualität**: Verwenden Sie hochauflösende Scans (300 DPI oder höher) für bessere Genauigkeit
- **Beleuchtung**: Stellen Sie sicher, dass Dokumente gleichmäßig beleuchtet sind ohne Schatten
- **Ausrichtung**: Laden Sie Bilder in der richtigen Ausrichtung hoch
- **Sprache**: Wählen Sie die passende Sprache für bessere Erkennungsgenauigkeit
- **Manuelle Überprüfung**: Überprüfen Sie immer Zeilen mit niedriger Konfidenz (rot markiert)

## 🛠️ Technische Details

### Neue Abhängigkeiten
- `tesseract.js` v7.0.0 - OCR-Engine für Browser und Electron

### Neue Komponenten
- `DocumentScanUpload.svelte` - Datei-Upload und OCR-Verarbeitungs-Interface
- `OCRVerificationPanel.svelte` - Split-View-Verifizierungs-Panel mit Bild-Hervorhebung
- `OCRLineItem.svelte` - Einzelne Zeilen-Verifizierungskomponente mit Inline-Bearbeitung

### Neue Services
- `ocrService.ts` - OCR-Verarbeitung und Hilfsfunktionen

## 📊 Vorherige Features (von v1.5.0 und früher)

Alle bestehenden Features bleiben verfügbar:
- ✅ Modernes UI/UX mit flüssigen Animationen
- ✅ Dokumentenverwaltung mit 10 Kategorien
- ✅ Vollständige Versionskontrolle und Audit-Logging
- ✅ Erweiterte Suche und Filterung
- ✅ Digitale Freigabe-Workflows
- ✅ Automatische Dokumentenklassifizierung
- ✅ Dokumentenvorlagen
- ✅ Tag-System
- ✅ Patientenverwaltung
- ✅ Terminplanung
- ✅ Mitarbeiterverwaltung

## 🔒 Datenschutz & Sicherheit

- **Lokale Verarbeitung**: Alle OCR-Operationen laufen vollständig auf Ihrem Gerät
- **Keine Cloud-Abhängigkeit**: Keine externen API-Aufrufe oder Datenübertragung
- **DSGVO-konform**: Vollständige Datenschutzkontrolle
- **Offline-fähig**: Funktioniert ohne Internetverbindung
- **Verschlüsselte Speicherung**: Alle Daten werden lokal mit Browser/Electron sicherer Speicherung gespeichert

## 📝 Änderungsprotokoll

Siehe [CHANGELOG.md](./CHANGELOG.md) für detaillierte Änderungen.

## 🙏 Danksagungen

Dieses Release verwendet Tesseract.js, eine Open-Source-OCR-Engine basierend auf Googles Tesseract-Projekt.

---

**PflegeDMS Team**  
Professionelle Dokumentenverwaltung für Pflegedienste

Version: 1.8.0  
Build-Datum: 27. Dezember 2024
