# Kompletter Workflow: Von Upload bis Zuordnung

## 🎯 End-to-End Beispiel: Rezept einscannen & verarbeiten

### Szenario:
Ein Pflegekraft hat ein Rezept eingescannt und möchte es:
1. In den Posteingang hochladen
2. Mit OCR verarbeiten lassen
3. Dem zuständigen Patienten zuordnen
4. In dessen Patientenakte speichern

---

## Phase 1: Dokument Upload (Patientenakte-Modul)

### Schritt 1: Patient öffnen
```
Pflegedienst Workspace
├─ Sidebar: "👤 Patientenakte" klicken
├─ Liste: Patient "Max Mustermann" auswählen
└─ Button: "📂 Akten anzeigen" klicken
  └─ Modal öffnet sich: "Patientenakte: Max Mustermann"
```

### Schritt 2: Dokument hochladen
```
Modal: Patientenakte
├─ Button: "📤 Hochladen" klicken
├─ Upload-Form erscheint
│  ├─ Drag & Drop Zone
│  └─ Oder: "Datei auswählen" klicken
│
├─ Dateiauswahl (z.B. rezept.jpg)
├─ Nach Dateiauswahl:
│  ├─ Vorschau zeigt: "rezept.jpg" + "185 KB"
│  ├─ Kategorie-Dropdown: "💊 Rezept" wählen
│  └─ Optionale Notizen: "Antibiotika - 3x täglich"
│
└─ Button: "Hochladen" klicken
```

### Schritt 3: Upload-Prozess (im Hintergrund)

```typescript
// DocumentStore.uploadDocument() wird aufgerufen
// Progress:
0% → Start
  ↓
30% → Datei gespeichert ✓
  ↓
60% → Dokument in DB erstellt ✓
  ↓
80% → OCR läuft (Tesseract.js)
      Erkannt: "Antibiotika - 3x täglich für 7 Tage"
      Confidence: 92%
      Klassifizierung: "prescription" ✓
  ↓
100% → Dokument mit Patient verknüpft ✓
  ↓
✓ Toast: "Dokument hochgeladen"
```

### Ergebnis nach Upload:
```
- Dokument in `documents` Tabelle
- Verknüpfung in `patient_documents` Tabelle
- OCR-Text in `documents.ocr_text` Feld
- Zunächst in entity_type = 'mailbox'
- Mailbox-Item wird NICHT automatisch erstellt (noch nicht in Phase 3)
```

---

## Phase 2: Posteingang Management (Posteingang-Modul)

### Annahme für MVP:
In dieser Phase werden Mailbox-Items noch **manuell** erstellt. 
In Phase 3 PR 2 werden wir Auto-Integration hinzufügen.

### Schritt 1: Posteingang öffnen
```
Pflegedienst Workspace
├─ Sidebar: "📮 Posteingang" klicken
└─ Seite öffnet sich mit:
   ├─ Statistik-Panel (z.B. 0 Neu, 0 In Bearbeitung)
   ├─ Tabs: "📮 Neu" | "⏳ In Bearbeitung" | "✓ Abgeschlossen"
   └─ Nachricht: "📭 Keine Dokumente in diesem Status"
```

**Hinweis**: Momentan müssen Items noch manuell erstellt werden. 
Echte Integration kommt mit PR 2 automatisch vom Document-Upload.

### Schritt 2: Manuales Erstellen (für MVP-Testing)

Für den MVP erstellen wir manuell via Direct-SQL (oder später API):

```sql
-- Manuell in DB einfügen (für Testing)
INSERT INTO mailbox_items (
  id, document_id, status, priority, item_type,
  assigned_to_patient_id, assigned_to_module, 
  reminder_date, created_at, notes
) VALUES (
  'uuid-xxx',
  'doc-id-from-upload', -- die Document-ID vom Upload
  'new',                  -- neuer Status
  'high',                 -- hohe Priorität (Rezept)
  'prescription',         -- Dokumenttyp
  NULL, NULL,             -- noch nicht zugeordnet
  NULL, NOW(), 'Rezept für Patient'
);
```

### Schritt 3: Kachel im Posteingang sichtbar
```
Posteingang
├─ Statistik: 1 Neu, 0 In Bearbeitung, 0 Abgeschlossen
├─ Tab "📮 Neu" (aktiv)
└─ Kachel:
   ├─ 🔴 Status: "Neu"
   ├─ 💊 Dokument abcd1234
   ├─ Typ: prescription
   ├─ Erstellt: 15.01.2024
   ├─ Notes: "Rezept für Patient"
   ├─ Badge: "⚠ Nicht zugeordnet" (Gelb)
   └─ Buttons: "👁️ Ansehen" | "📋 In Arbeit"
```

### Schritt 4: Kachel klicken → Zuordnungs-Dialog
```
Modal: "Dokument zuordnen"
├─ Tabs: "👤 Patient" (aktiv) | "📋 Modul"
│
├─ Patient-Tab:
│  ├─ Dropdown: "-- Bitte wählen --"
│  ├─ Optionen:
│  │  ├─ "Max Mustermann"
│  │  ├─ "Erika Musterfrau"
│  │  └─ ...
│  └─ Wir wählen: "Max Mustermann"
│
├─ Notizen (optional): "Vom 15.01.2024"
│
└─ Button: "Zuordnen" klicken
```

### Ergebnis nach Zuordnung:
```
-- In DB:
mailbox_items.assigned_to_patient_id = 'max-uuid'
mailbox_items.assigned_to_module = 'patients'
mailbox_items.status = 'in_progress'
mailbox_items.completed_at = NULL

documents.entity_type = 'patient'
documents.entity_id = 'max-uuid'

-- UI:
✓ Kachel-Status ändert sich zu "In Bearbeitung"
✓ Badge: "✓ Patient zugeordnet" (Grün)
✓ Toast: "Dokument dem Patienten zugeordnet"
✓ Kachel wechselt zum Tab "⏳ In Bearbeitung"
```

---

## Phase 3: Dokumenten-Nachverfolgung

### Schritt 1: Status aktualisieren

Im "In Bearbeitung" Tab:
```
Kachel: 💊 Dokument abcd1234
├─ Status: "In Bearbeitung"
├─ Badge: "✓ Patient zugeordnet"
└─ Buttons: "👁️ Ansehen" | "✓ Fertig"

Klick auf "✓ Fertig"
```

### Ergebnis:
```
-- In DB:
mailbox_items.status = 'completed'
mailbox_items.completed_at = NOW()

-- UI:
✓ Toast: "Dokument abgeschlossen"
✓ Kachel verschwindet aus "In Bearbeitung"
✓ Erscheint jetzt im "✓ Abgeschlossen" Tab
```

---

## Phase 4: Dokument in Patientenakte abrufen

### Der Workflow schliesst sich:

```
Pflegedienst Workspace
├─ Sidebar: "👤 Patientenakte" klicken
├─ Patient: "Max Mustermann" auswählen
└─ Button: "📂 Akten anzeigen" klicken
  └─ Modal: "Patientenakte: Max Mustermann"
     └─ Dokumenten-Liste:
        ├─ 💊 Rezept
        ├─ 📌 Erstellt: 15.01.2024
        ├─ Kategorie: "💊 Rezept"
        ├─ Notizen: "Antibiotika - 3x täglich"
        └─ Button: "🔍 Details" oder "Löschen"
```

Das Dokument ist nun:
- ✅ In der Patientenakte sichtbar
- ✅ Mit OCR-Text durchsuchbar
- ✅ Kategorisiert als "Rezept"
- ✅ Mit Patient verknüpft
- ✅ Im Posteingang als "Abgeschlossen" markiert

---

## 📊 Datenbank-Status nach vollständigem Workflow

```sql
-- documents table
SELECT * FROM documents WHERE id = 'doc-xxx';
/*
id: doc-xxx
filename: rezept.jpg
file_path: documents/123456_rezept.jpg
file_size: 189456
mime_type: image/jpeg
entity_type: patient          ← Zugeordnet!
entity_id: max-uuid           ← Patient-ID!
document_type: prescription
status: active
ocr_text: "Antibiotika 3x täglich für 7 Tage..."
is_ocr_processed: true
created_at: 2024-01-15 10:30:00
updated_at: 2024-01-15 10:32:00
*/

-- patient_documents table
SELECT * FROM patient_documents WHERE patient_id = 'max-uuid';
/*
id: link-xxx
patient_id: max-uuid
document_id: doc-xxx
category: prescription
notes: "Antibiotika - 3x täglich"
created_at: 2024-01-15 10:30:00
*/

-- mailbox_items table
SELECT * FROM mailbox_items WHERE id = 'mail-xxx';
/*
id: mail-xxx
document_id: doc-xxx
status: completed              ← Abgeschlossen!
priority: high
item_type: prescription
assigned_to_patient_id: max-uuid
assigned_to_module: patients
completed_at: 2024-01-15 10:35:00
created_at: 2024-01-15 10:30:00
*/

-- audit_log table
SELECT * FROM audit_log WHERE entity_id = 'doc-xxx';
/*
[Multiple entries for:]
- Document created
- OCR processed
- Linked to patient
- Mailbox item status updated to "in_progress"
- Mailbox item status updated to "completed"
*/
```

---

## 🔄 Integration zwischen Modulen (Phase 3+)

```
Patientenakte Module
     ↓ (Upload)
   ✓ Document erstellen
   ✓ OCR laufen lassen
   ✓ In patient_documents verknüpfen
     ↓
Posteingang Module
   ✓ Mailbox-Item automatisch erstellen (Phase 3 PR 2)
   ✓ Mit AssignmentDialog verknüpfen
   ✓ Status-Workflow verwalten
     ↓
Vertragsmanagement (Phase 4)
   ✓ Wenn "contracts" Module ausgewählt:
   ✓ Dokument zu Contract verknüpfen
   ✓ In contracts Tabelle speichern
     ↓
Rechnungsmanagement (Phase 5)
   ✓ Wenn "invoices" Module ausgewählt:
   ✓ Automatische Betrag-Extraktion via OCR
   ✓ In invoices Tabelle speichern
     ↓
Qualitätsmanagement (Phase 6)
   ✓ QM-Dokumente organisieren
   ✓ Versionierung verwalten
```

---

## 🚀 MVP-Ready Workflow Checkliste

### ✅ Patientenakte
- [x] Patient-CRUD
- [x] Dokument-Upload (Drag & Drop)
- [x] OCR-Verarbeitung (Tesseract.js)
- [x] Patient-Akten-View
- [x] Dokumentenliste

### ✅ Posteingang
- [x] Mailbox-Items Management
- [x] Status-Workflow
- [x] Cross-Module-Router
- [x] AssignmentDialog
- [x] Statistik-Panel

### ⏳ Noch nicht implementiert (nach Phase 3 PR 2)
- [ ] Automatische Mailbox-Item-Erstellung aus Upload
- [ ] Bulk-Operations (mehrere Items)
- [ ] Export-Funktion

### ⏳ Später (Phase 4+)
- [ ] Verträge mit Zuordnung
- [ ] Rechnungen mit OCR-Betrag-Extraktion
- [ ] QM-Dokumente mit Versionierung
- [ ] Globale Suche (FTS5)
- [ ] DSGVO-Export
- [ ] Backup-Scheduler

---

**Status**: MVP-Workflow funktionsfähig von Phase 1-3 🎉
