# Phase 4: Vertragsmanagement (CRUD + Auto-Erinnerungen)

## ✅ Status: FERTIG (PR 1/2)

### Was wurde implementiert:

#### 1. **Contract Types** (`src/modules/vertragsmanagement/types/contract.ts`)
- ✅ `Contract` interface – Vollständiger Vertragsdatensatz
- ✅ `CreateContractInput` interface – Eingabeformular
- ✅ `UpdateContractInput` interface – Änderungsformular
- ✅ `Supplier` interface – Lieferantendaten
- ✅ `CreateSupplierInput` interface – Lieferanten-Eingabe
- ✅ `ContractStats` interface – Statistik-Daten
- ✅ `ExpiringContract` interface – Auslaufende Verträge
- ✅ Partner-Typen: patient, supplier
- ✅ Status: active, inactive, expired

#### 2. **Contract Service** (`src/modules/vertragsmanagement/services/contractService.ts`)
- ✅ `getAll()` – Alle Verträge laden
- ✅ `getById(id)` – Einzelnen Vertrag abrufen
- ✅ `createContract(input)` – Neuen Vertrag erstellen (mit UUID)
- ✅ `updateContract(id, input)` – Vertrag aktualisieren
- ✅ `deleteContract(id)` – Vertrag archivieren (soft delete)
- ✅ `getExpiringContracts()` – Verträge die bald ablaufen (≤ reminder_days_before_expiry)
- ✅ `getStats()` – Statistiken (total, active, expiring_soon, expired)
- ✅ `markReminderSent(contractId)` – Erinnerung als gesendet markieren
- ✅ `getAllSuppliers()` – Alle Lieferanten laden
- ✅ `createSupplier(input)` – Neuen Lieferanten erstellen
- ✅ `getSupplierById(id)` – Lieferanten abrufen
- ✅ Vollständige Error-Handling & Logging

#### 3. **Contract Store** (`src/modules/vertragsmanagement/stores/contractStore.ts`)
- ✅ `contractStore` Svelte Store
- ✅ State: `contracts[]`, `stats`, `isLoading`, `error`, `selectedContractId`
- ✅ `loadContracts()` – Lade alle Verträge + Stats
- ✅ `createContract(input)` – Vertrag erstellen
- ✅ `updateContract(id, input)` – Vertrag aktualisieren
- ✅ `deleteContract(id)` – Vertrag löschen
- ✅ `selectContract(id)` – Vertrag auswählen
- ✅ `checkExpiringContracts()` – Check für auslaufende Verträge
- ✅ `clearError()` – Error löschen

#### 4. **UI Komponenten**

**ContractCard.svelte** (`src/modules/vertragsmanagement/components/ContractCard.svelte`)
- ✅ Moderne Kachel-Ansicht
- ✅ Status-Badge (✓ Aktiv / ⏸ Inaktiv / ✕ Abgelaufen)
- ✅ Partner-Typ-Icon (👤 Patient / 🏢 Lieferant)
- ✅ Vertrag-Name + Partner-Name
- ✅ Start- und End-Datum
- ✅ Ablauf-Countdown mit Farbcodierung:
  - 🔴 Rot wenn abgelaufen
  - 🟠 Orange wenn ≤ 30 Tage
  - 🟢 Grün wenn > 30 Tage
- ✅ Kündigungsfrist-Anzeige
- ✅ Erinnerungs-Status
- ✅ Beschreibung (gekürzt auf 2 Zeilen)
- ✅ Action-Slot für Buttons

**ContractForm.svelte** (`src/modules/vertragsmanagement/components/ContractForm.svelte`)
- ✅ Modal-Dialog für Vertrag-Erstellung
- ✅ 2-Button Partner-Typ-Auswahl (👤 Patient / 🏢 Lieferant)
- ✅ Dynamische Partner-Liste:
  - Patients: Alle aktiven Patienten
  - Suppliers: Alle Lieferanten
- ✅ Scrollbare Auswahl mit Highlighting
- ✅ Formular-Felder:
  - Vertrag Name (Pflicht)
  - Beschreibung (Optional)
  - Start Datum (Pflicht)
  - End Datum (Pflicht)
  - Kündigungsfrist (Optional, Default: 30 Tage)
  - Erinnerung vor X Tage (Default: 30)
- ✅ Validierung (Pflichtfelder prüfen)
- ✅ Loading-State auf Erstellen-Button
- ✅ Toast-Feedback

**ContractList.svelte** (`src/modules/vertragsmanagement/views/ContractList.svelte`)
- ✅ Hauptseite für Vertragsmanagement
- ✅ Statistik-Panel (4 Spalten):
  - 📜 Gesamt (Blau)
  - ✓ Aktiv (Grün)
  - ⚠ Läuft aus (Orange)
  - ✕ Abgelaufen (Rot)
- ✅ 3 Status-Tabs:
  - 📜 Alle
  - ✓ Aktiv
  - ⚠ Läuft aus (nur ≤ 30 Tage)
- ✅ Responsive Kachel-Grid (1/2/3 Spalten)
- ✅ Loading-State
- ✅ Leere Zustand mit CTA
- ✅ Error-Anzeige
- ✅ "Archivieren"-Button pro Vertrag

#### 5. **Integration in MainLayout**
- ✅ ContractList importiert
- ✅ Route `contracts` zu ContractList
- ✅ Nahtlose Integration

#### 6. **Datenbank**
- ✅ `contracts` Tabelle
- ✅ `suppliers` Tabelle
- ✅ Proper Indizes auf end_date, status
- ✅ Audit-Log für alle Operationen

### Features dieser Phase:

✅ **Vertrags-CRUD**: Vollständige Create, Read, Update, Delete  
✅ **Partner-Verwaltung**: Patienten oder Lieferanten auswählen  
✅ **Ablauf-Tracking**: Automatische Berechnung von Tagen bis Ablauf  
✅ **Farbcodierung**: Visuelles Status-System (rot/orange/grün)  
✅ **Statistik-Panel**: Übersicht über Vertragsbestand  
✅ **Tab-Filterung**: Nach Status filtern  
✅ **Erinnerungs-System**: Vorbereitung für Auto-Erinnerungen  
✅ **Responsive Design**: Kachel-Grid auf allen Geräten  

### Workflow (getestet):

```bash
# 1. Vertragsmanagement öffnen
# - Klick auf "📜 Verträge" in Sidebar
# - Stats anzeigen (z.B. 0 Gesamt, 0 Aktiv)
# - Tab "📜 Alle" (aktiv)

# 2. Neuen Vertrag erstellen
# - Button "➕ Neuer Vertrag"
# - Modal öffnet sich
# - Partner-Typ wählen (z.B. "👤 Patient")
# - Patient auswählen (z.B. "Max Mustermann")
# - Formular ausfüllen:
#   - Vertrag Name: "Pflegeleistungen Max"
#   - Beschreibung: "3x täglich Pflege"
#   - Start: 01.01.2024
#   - End: 31.12.2024
#   - Kündigungsfrist: 30 Tage
#   - Erinnerung vor: 30 Tage
# - "Erstellen" Button
# → Toast: "Vertrag erstellt"

# 3. Vertrag anzeigen
# - Kachel erscheint in "📜 Alle" Tab
# - Kachel zeigt:
#   - ✓ Aktiv (Badge)
#   - 👤 Pflegeleistungen Max (Name)
#   - Max Mustermann (Partner)
#   - Start: 01.01.2024
#   - Ende: 31.12.2024 (⏳ 350 Tage)
#   - Kündigungsfrist: 30 Tage
#   - Beschreibung: "3x täglich Pflege"

# 4. Ablauf-Tracking
# - Wenn < 30 Tage bis Ablauf:
#   - Tab "⚠ Läuft aus" zeigt Vertrag
#   - Countdown in Rot (z.B. "⚠ 10 Tage")
#   - Kachel wechselt zur Rot-Farbe

# 5. Vertrag archivieren
# - Button "🗑 Archivieren"
# - Bestätigung: "Vertrag wirklich archivieren?"
# - Status wechselt zu "Inaktiv"
# - Vertrag verschwindet aus Tabs
```

### Auto-Erinnerungen (Basis implementiert):

```typescript
// getExpiringContracts() prüft:
// - Status = 'active'
// - Tage bis Ablauf ≤ reminder_days_before_expiry (default 30)
// 
// Returns:
// [
//   { id: 'xxx', contract_name: 'Vertrag 1', end_date: '2024-02-15', days_until_expiry: 25, ... },
//   { id: 'yyy', contract_name: 'Vertrag 2', end_date: '2024-02-20', days_until_expiry: 30, ... },
// ]
//
// In Phase 7 wird ein Scheduler diese täglich prüfen
// und Einträge in die reminders-Tabelle schreiben
```

### Nächster Schritt (Phase 4 PR 2):

**Erweiterte Features**:
- Lieferanten-Verwaltung (CRUD UI)
- Dokumenten-Zuordnung (von Posteingang)
- Renewals / Auto-Verlängerung
- Vertragshistorie + Versionierung

**Geschätzter Aufwand**: 1-2 Tage

---

## Merge-Ready Checkliste

✅ Verträge werden geladen  
✅ CRUD funktioniert  
✅ Status-Filter arbeitet  
✅ Kachel-Ansicht responsive  
✅ Partner-Auswahl funktioniert  
✅ Statistiken aktualisieren  
✅ Ablauf-Berechnung korrekt  
✅ Farbcodierung funktioniert  
✅ Error-Handling & Toast-Feedback  
✅ Logging auf Konsole  
✅ Kein TypeScript-Fehler  

**Bereit zum Merge!** 🚀

---

## Technische Details

### Ablauf-Berechnung
```sql
-- Datenbankquery für auslaufende Verträge:
CAST((julianday(end_date) - julianday(CURRENT_DATE)) as INTEGER) as days_until_expiry

-- Verträge die in den nächsten 30 Tagen ablaufen:
WHERE julianday(end_date) - julianday(CURRENT_DATE) BETWEEN 0 AND reminder_days_before_expiry
```

### Stats-Aggregation
```sql
-- Alle 4 Statistiken in einer Query:
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN status = 'active' AND days_left ≤ 30 THEN 1 ELSE 0 END) as expiring_soon,
  SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END) as expired
```

### Partner-Typen Flexibilität
```typescript
// Verträge können mit Patienten oder Lieferanten verknüpft sein
// Die partner_id kann auf patients oder suppliers Tabelle verweisen
// partner_type Feld macht das eindeutig

partner_type = 'patient' → partner_id verweist auf patients.id
partner_type = 'supplier' → partner_id verweist auf suppliers.id
```

---

**Status**: ✅ Phase 4, PR 1 – VERTRAGSMANAGEMENT – FERTIG & MERGE-READY

**Nächste Phase**: Phase 5 – Rechnungsmanagement (CRUD + Status-Board) 🚀

**Progress**: 5/9 Phasen abgeschlossen (56%)
