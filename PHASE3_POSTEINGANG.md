# Phase 3: Posteingang-Modul (Dokumenten-Router)

## ✅ Status: FERTIG (PR 1/2)

### Was wurde implementiert:

#### 1. **Mailbox Types** (`src/modules/posteingang/types/mailbox.ts`)
- ✅ `MailboxItem` interface – Vollständiger Mailbox-Eintrag
- ✅ `CreateMailboxItemInput` interface – Eingabeformular
- ✅ `MailboxStats` interface – Statistik-Daten
- ✅ Enums: `MailboxStatus`, `MailboxPriority`, `TargetModule`
- ✅ 4 Status: new, in_progress, completed, rejected
- ✅ 3 Prioritäten: low, normal, high
- ✅ 5 Ziel-Module: patients, contracts, invoices, qm, archive

#### 2. **Mailbox Service** (`src/modules/posteingang/services/mailboxService.ts`)
- ✅ `getAll()` – Alle Mailbox-Items laden
- ✅ `getByStatus(status)` – Filter nach Status
- ✅ `getStats()` – Statistiken abrufen (total, new, in_progress, completed)
- ✅ `createFromDocument(input)` – Item aus Dokument erstellen
- ✅ `getById(id)` – Einzelnes Item abrufen
- ✅ `updateStatus(id, status)` – Status ändern (mit Auto-Completion-Date)
- ✅ `assignToPatient(itemId, patientId, notes)` – Zu Patient zuordnen
- ✅ `assignToModule(itemId, moduleName, targetId, notes)` – Zu Modul zuordnen
- ✅ `complete(id)` – Item abschließen
- ✅ `reject(id, reason)` – Item ablehnen
- ✅ `delete(id)` – Item löschen (soft delete)
- ✅ Vollständige Error-Handling & Logging

#### 3. **Mailbox Store** (`src/modules/posteingang/stores/mailboxStore.ts`)
- ✅ `mailboxStore` Svelte Store
- ✅ State: `items[]`, `stats`, `isLoading`, `error`, `selectedItemId`, `filterStatus`
- ✅ `loadItems()` – Lade alle Items
- ✅ `loadByStatus(status)` – Lade Items nach Status
- ✅ `selectItem(id)` – Wähle Item aus
- ✅ `updateStatus(id, status)` – Status aktualisieren
- ✅ `assignToPatient(itemId, patientId, notes)` – Zu Patient zuordnen
- ✅ `assignToModule(itemId, moduleName, targetId, notes)` – Zu Modul zuordnen
- ✅ `completeItem(id)` – Item abschließen
- ✅ `rejectItem(id, reason)` – Item ablehnen
- ✅ `deleteItem(id)` – Item löschen
- ✅ `clearError()` – Fehler löschen
- ✅ Derived store: `selectedMailboxItem`

#### 4. **UI Komponenten**

**MailboxCard.svelte** (`src/modules/posteingang/components/MailboxCard.svelte`)
- ✅ Kachel-Ansicht für Mailbox-Items
- ✅ Prioritäts-Farbcodierung:
  - 🔴 Rot für High-Priority
  - 🔵 Blau für Normal-Priority
  - ⚪ Grau für Low-Priority
- ✅ Status-Anzeige mit Label
- ✅ Dokument-ID (gekürzt)
- ✅ Item-Typ + Erstellungsdatum
- ✅ Notizen-Anzeige (gekürzt)
- ✅ Zuordnungs-Status-Badge:
  - ✓ Patient zugeordnet (Grün)
  - ✓ Modul zugeordnet (Blau)
  - ⚠ Nicht zugeordnet (Gelb)
- ✅ Aktions-Buttons:
  - 👁️ Ansehen
  - 📋 In Arbeit (nur für "new")
  - ✓ Fertig (nur für "in_progress")

**AssignmentDialog.svelte** (`src/modules/posteingang/components/AssignmentDialog.svelte`)
- ✅ Modal-Dialog für Dokumenten-Zuordnung
- ✅ 2 Tabs:
  - 👤 **Patient**: Liste aller Patienten
  - 📋 **Modul**: 5 Ziel-Module mit Icons & Beschreibung
- ✅ Ziel-Module:
  - 👤 Patientenakte → "Der Patientenakte hinzufügen"
  - 📜 Verträge → "Als Vertragsanhang"
  - 💰 Rechnungen → "Als Rechnung verarbeiten"
  - ✅ QM → "Zu QM-Dokumenten hinzufügen"
  - 📦 Archiv → "In Archiv verschieben"
- ✅ Optionale Notizen
- ✅ Validierung (Patient muss gewählt sein)
- ✅ Fehlermeldung wenn keine Patienten vorhanden
- ✅ Loading-State auf Zuordnen-Button

**MailboxList.svelte** (`src/modules/posteingang/views/MailboxList.svelte`)
- ✅ Hauptseite für Posteingang-Modul
- ✅ Statistik-Panel (4 Spalten):
  - 📮 Neu (Rot)
  - ⏳ In Bearbeitung (Gelb)
  - ✓ Abgeschlossen (Grün)
  - 📊 Gesamt (Grau)
- ✅ 3 Status-Tabs mit Tab-Navigation:
  - 📮 Neu
  - ⏳ In Bearbeitung
  - ✓ Abgeschlossen
- ✅ Kachel-Grid (1 Col Mobile, 2 Col Tablet, 3 Col Desktop)
- ✅ Loading-State
- ✅ Leere Zustand mit kontextuellen Nachrichten
- ✅ Error-Anzeige
- ✅ AssignmentDialog-Integration

#### 5. **Integration in MainLayout**
- ✅ MailboxList importiert
- ✅ Route `mailbox` zu MailboxList
- ✅ Nahtlose Integration

#### 6. **Datenbank**
- ✅ `mailbox_items` Tabelle wird genutzt
- ✅ Indizes auf status + priority
- ✅ Audit-Trail via audit_log

### Features dieser Phase:

✅ **Posteingang-Management**: Alle Dokumente in einer Ansicht  
✅ **Status-Workflow**: new → in_progress → completed  
✅ **Priorisiierung**: low / normal / high  
✅ **Cross-Module-Router**: Zuordnung zu Patienten oder Modulen  
✅ **Statistik-Panel**: Übersicht aller Status  
✅ **Kachel-Design**: Moderne, responsive Ansicht  
✅ **Zuordnungs-Dialog**: Einfache 2-Tab-Auswahl  
✅ **Fehlerbehandlung**: Toast-Feedback + Logging  
✅ **Validierung**: Pflichtfelder prüfen  

### Workflow (getestet):

```bash
# 1. Patienten-Akte öffnen
# - Patient erstellen / bearbeiten
# - "Akten anzeigen" klicken

# 2. Dokument hochladen
# - "📤 Hochladen" Button
# - Datei hochladen
# - Kategorie wählen
# - "Hochladen" bestätigen
# → Dokument lädt, OCR läuft, Item geht in Posteingang

# 3. Posteingang-Modul öffnen
# - Klick auf "Posteingang" in Sidebar
# - Stats anzeigen (z.B. 1 Neu, 0 In Bearbeitung, 0 Abgeschlossen)
# - Tab "Neu" zeigt die Kachel

# 4. Dokument zuordnen
# - Klick auf Kachel → AssignmentDialog öffnet
# - Option 1: Patient wählen → "Zuordnen"
#   - Dokument geht in Patientenakte
#   - Status: in_progress
# - Option 2: Modul wählen (z.B. "Verträge") → "Zuordnen"
#   - Dokument wird zu Vertrags-Modul geschickt
#   - Status: in_progress

# 5. Status verwalten
# - In "In Bearbeitung" Tab wechseln
# - Kachel zeigt "Dokument zugeordnet" Badge
# - Button "✓ Fertig" klicken
# - Status wechselt zu completed_at-Datum
# - Kachel verschwindet aus "Neu"

# 6. Abgeschlossene anzeigen
# - Tab "Abgeschlossen" klicken
# - Abgeschlossene Dokumente sind hier sichtbar
```

### Router-Logik (Cross-Module-Integration):

```typescript
// Wenn Dokument zu Patient zugeordnet:
await mailboxService.assignToPatient(itemId, patientId, notes);
// → mailbox_items.assigned_to_patient_id = patientId
// → mailbox_items.assigned_to_module = 'patients'
// → documents.entity_type = 'patient'
// → documents.entity_id = patientId

// Wenn Dokument zu Modul zugeordnet:
await mailboxService.assignToModule(itemId, 'invoices', null, notes);
// → mailbox_items.assigned_to_module = 'invoices'
// → In Phase 5 werden Invoices dieses Dokument laden
```

### Nächster Schritt (Phase 4, PR 1):

**Vertragsmanagement (CRUD)**
- ContractService (create, read, update, delete)
- ContractStore (Svelte Store)
- ContractList (Tabelle)
- ContractForm (Modal)
- ContractDetail (Read-Only View)

**Geschätzter Aufwand**: 1-2 Tage

---

## Merge-Ready Checkliste

✅ Mailbox-Items werden geladen  
✅ Status-Filter funktioniert  
✅ Kachel-Ansicht responsive  
✅ AssignmentDialog integriert  
✅ Patient-Zuordnung funktioniert  
✅ Modul-Zuordnung funktioniert  
✅ Status-Update funktioniert  
✅ Statistiken aktualisieren  
✅ Error-Handling & Toast-Feedback  
✅ Logging auf Konsole  
✅ Kein TypeScript-Fehler  

**Bereit zum Merge!** 🚀

---

## Technische Details

### Datenbank-Queries Performance
- Alle Status-Queries mit Indizes
- Priority-Sortierung in SQL (case-when)
- Stats aggregiert in einer Query
- Keine N+1-Probleme

### UI-Responsivität
- Mobile: 1 Spalte
- Tablet: 2 Spalten (≥768px)
- Desktop: 3 Spalten (≥1024px)
- Tab-Navigation responsive

### Cross-Module Integration
- MailboxItem hat `assigned_to_module` Feld
- In Phase 4-6 laden Module ihre Dokumente aus Mailbox
- Zentrale Dokumenten-Tabelle verbindet alles
- Audit-Log trackt jede Zuordnung

---

**Status**: ✅ Phase 3, PR 1 – POSTEINGANG & ROUTER – FERTIG & MERGE-READY

**Nächste Phase**: Phase 4 – Vertragsmanagement (CRUD) 🚀

**Progress**: 4/9 Phasen abgeschlossen (44%)
