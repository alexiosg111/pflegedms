# Modulares Datenbank-Schema für Pflegedienst-Anwendung

## Übersicht

Das Datenbankschema wird in **SQLite 3** mit **SQLCipher-Verschlüsselung** implementiert. Es folgt einem relationalen Modell mit einer zentralen `documents`-Tabelle, die Dokumente aus allen Modulen verwaltet und eine **Volltextsuche** ermöglicht.

---

## Kern-Tabellen (Cross-Module)

### Tabelle: `documents`
Zentrale Dokumentenverwaltung für alle Module.

```sql
CREATE TABLE documents (
  id TEXT PRIMARY KEY,                    -- UUID
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,                -- Pfad zur Datei auf der Festplatte
  file_size INTEGER,                      -- In Bytes
  mime_type TEXT,                         -- z.B. 'application/pdf', 'image/jpeg'
  
  -- Zuordnung zu einer Entität (Patient, Lieferant, Allgemein, etc.)
  entity_type TEXT NOT NULL,              -- 'patient', 'supplier', 'general', 'qm'
  entity_id TEXT,                         -- Referenz zur Entität (z.B. patient_id)
  
  -- Dokumentklassifizierung
  document_type TEXT,                     -- z.B. 'prescription', 'lab_report', 'invoice', 'contract'
  status TEXT DEFAULT 'active',           -- 'active', 'archived', 'deleted'
  
  -- OCR und Volltextsuche
  ocr_text TEXT,                          -- Extrahierter Text mittels Tesseract.js
  is_ocr_processed BOOLEAN DEFAULT FALSE, -- Gibt an, ob OCR bereits durchgeführt wurde
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,                        -- Benutzer (zukünftige Mehrbenutzer-Unterstützung)
  
  -- Audit
  audit_log_id TEXT,                      -- Referenz zum Audit-Log
  
  -- Indizierung für Performance
  FOREIGN KEY (entity_id) REFERENCES patients(id),
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_document_type (document_type),
  INDEX idx_status (status),
  FULLTEXT INDEX idx_ocr_text (ocr_text)  -- Für schnelle Volltextsuche
);
```

### Tabelle: `audit_log`
Zentrales Audit-Logging für alle Änderungen.

```sql
CREATE TABLE audit_log (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Aktion
  action TEXT NOT NULL,                   -- 'create', 'update', 'delete', 'assign', 'status_change'
  entity_type TEXT NOT NULL,              -- 'patient', 'document', 'contract', 'invoice', 'mailbox_item'
  entity_id TEXT NOT NULL,                -- Referenz zur veränderten Entität
  
  -- Änderungsdetails
  old_value TEXT,                         -- JSON der alten Werte
  new_value TEXT,                         -- JSON der neuen Werte
  description TEXT,                       -- Menschenlesbarer Beschreibung der Aktion
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,                        -- Benutzer (zukünftige Mehrbenutzer-Unterstützung)
  
  INDEX idx_entity_type (entity_type),
  INDEX idx_entity_id (entity_id),
  INDEX idx_created_at (created_at)
);
```

---

## Modul 1: Patientenakte

### Tabelle: `patients`
Verwaltung von Patientenbasisdaten.

```sql
CREATE TABLE patients (
  id TEXT PRIMARY KEY,                    -- UUID
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,                            -- 'm', 'f', 'other'
  
  -- Kontakt
  phone TEXT,
  email TEXT,
  
  -- Adresse
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'DE',
  
  -- Versicherung & Medizinisches
  insurance_company TEXT,
  insurance_number TEXT,
  primary_doctor TEXT,                    -- Name des Hausarztes
  
  -- Status
  status TEXT DEFAULT 'active',           -- 'active', 'inactive', 'archived'
  date_registered DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_last_name (last_name),
  INDEX idx_status (status),
  FULLTEXT INDEX idx_patient_search (first_name, last_name)
);
```

### Tabelle: `patient_documents`
Zuordnung von Dokumenten zu Patienten (Denormalisierung für Performance).

```sql
CREATE TABLE patient_documents (
  id TEXT PRIMARY KEY,                    -- UUID
  patient_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  
  category TEXT,                          -- 'prescription', 'lab_report', 'care_plan', 'doctor_letter'
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE (patient_id, document_id),
  INDEX idx_patient_id (patient_id)
);
```

---

## Modul 2: Posteingang & Verteilung

### Tabelle: `mailbox_items`
Verwaltung des digitalen Posteingangs.

```sql
CREATE TABLE mailbox_items (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Dokument-Referenz
  document_id TEXT NOT NULL,              -- Referenz zur documents-Tabelle
  
  -- Status im Workflow
  status TEXT DEFAULT 'new',              -- 'new', 'in_progress', 'completed'
  priority TEXT DEFAULT 'normal',         -- 'low', 'normal', 'high'
  
  -- Klassifizierung
  item_type TEXT DEFAULT 'unknown',       -- 'invoice', 'letter', 'prescription', 'contract', 'other'
  
  -- Zuordnung
  assigned_to_patient_id TEXT,            -- Kann NULL sein (falls nicht patientenbezogen)
  assigned_to_module TEXT,                -- Zielmodul ('patientenakte', 'rechnungsmanagement', 'vertragsmanagement', etc.)
  
  -- Benachrichtigungen
  reminder_date DATETIME,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  notes TEXT,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (assigned_to_patient_id) REFERENCES patients(id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

---

## Modul 3: Vertragsmanagement

### Tabelle: `contracts`
Verwaltung aller Verträge.

```sql
CREATE TABLE contracts (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Vertragspartner
  partner_type TEXT NOT NULL,             -- 'patient', 'supplier', 'service_provider'
  partner_id TEXT NOT NULL,               -- Referenz zur patients- oder suppliers-Tabelle
  partner_name TEXT NOT NULL,             -- Redundanz für schnellere Anzeige
  
  -- Vertragsdetails
  contract_name TEXT NOT NULL,
  description TEXT,
  
  -- Vertragsdaten
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renewal_date DATE,                      -- Automatische Verlängerung am
  cancellation_period_days INTEGER,       -- Kündigungsfrist in Tagen
  
  -- Status
  status TEXT DEFAULT 'active',           -- 'active', 'pending_signature', 'expired', 'cancelled'
  
  -- Dokumente
  contract_document_id TEXT,              -- Referenz zu documents (der unterschriebene Vertrag als PDF)
  
  -- Benachrichtigungen
  reminder_days_before_expiry INTEGER DEFAULT 30,  -- Woran erinnern, X Tage bevor der Vertrag abläuft
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contract_document_id) REFERENCES documents(id),
  INDEX idx_partner_type (partner_type),
  INDEX idx_partner_id (partner_id),
  INDEX idx_end_date (end_date),
  INDEX idx_status (status)
);
```

### Tabelle: `suppliers`
Verwaltung von Lieferanten (die nicht Patienten sind).

```sql
CREATE TABLE suppliers (
  id TEXT PRIMARY KEY,                    -- UUID
  
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Adresse
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'DE',
  
  -- Klassifizierung
  supplier_type TEXT,                     -- 'medical_supplier', 'pharmacy', 'service_provider', 'other'
  tax_id TEXT,                            -- Für Rechnungen
  
  -- Status
  status TEXT DEFAULT 'active',           -- 'active', 'inactive', 'archived'
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_status (status),
  FULLTEXT INDEX idx_supplier_search (name, contact_person)
);
```

---

## Modul 4: Rechnungsmanagement

### Tabelle: `invoices`
Verwaltung von Ein- und Ausgangsrechnungen.

```sql
CREATE TABLE invoices (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Rechnungstyp
  invoice_type TEXT NOT NULL,             -- 'incoming' (Eingangsrechnung), 'outgoing' (Ausgangsrechnung)
  
  -- Rechnungsdaten
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  -- Partnerreferenzen
  partner_type TEXT NOT NULL,             -- 'patient', 'supplier'
  partner_id TEXT NOT NULL,               -- Referenz zu patient_id oder supplier_id
  partner_name TEXT NOT NULL,             -- Redundanz für Anzeige
  
  -- Rechnungsinhalte
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  -- Dokument
  document_id TEXT,                       -- Referenz zu documents (die Rechnung als PDF/Scan)
  
  -- Status
  status TEXT DEFAULT 'open',             -- 'open', 'paid', 'overdue', 'cancelled'
  paid_date DATE,
  payment_method TEXT,                    -- 'cash', 'transfer', 'check', 'other'
  notes TEXT,
  
  -- Benachrichtigungen
  reminder_sent BOOLEAN DEFAULT FALSE,
  reminder_sent_at DATETIME,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  INDEX idx_invoice_type (invoice_type),
  INDEX idx_partner_type (partner_type),
  INDEX idx_partner_id (partner_id),
  INDEX idx_invoice_date (invoice_date),
  INDEX idx_due_date (due_date),
  INDEX idx_status (status)
);
```

---

## Modul 5: Qualitätsmanagement (QM)

### Tabelle: `qm_folders`
Ordnerstruktur für QM-Dokumente.

```sql
CREATE TABLE qm_folders (
  id TEXT PRIMARY KEY,                    -- UUID
  
  name TEXT NOT NULL,                     -- z.B. 'Hygieneplan', 'Notfallmanagement'
  description TEXT,
  parent_folder_id TEXT,                  -- Für Ordner-Hierarchie
  
  -- Sortierung
  sort_order INTEGER,
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_folder_id) REFERENCES qm_folders(id),
  INDEX idx_parent_folder_id (parent_folder_id),
  UNIQUE (name, parent_folder_id)
);
```

### Tabelle: `qm_documents`
QM-Dokumente mit Versionsverwaltung.

```sql
CREATE TABLE qm_documents (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Organisatorisches
  title TEXT NOT NULL,
  description TEXT,
  folder_id TEXT NOT NULL,                -- Referenz zu qm_folders
  
  -- Versionierung
  current_version TEXT NOT NULL,          -- z.B. '1.0', '1.1'
  document_id TEXT NOT NULL,              -- Referenz zu documents (aktuelle Version)
  
  -- Metadaten
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  approved_by TEXT,
  approval_date DATETIME,
  
  FOREIGN KEY (folder_id) REFERENCES qm_folders(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  INDEX idx_folder_id (folder_id),
  UNIQUE (title, folder_id)
);
```

### Tabelle: `qm_document_versions`
Versionsverlauf für QM-Dokumente.

```sql
CREATE TABLE qm_document_versions (
  id TEXT PRIMARY KEY,                    -- UUID
  
  qm_document_id TEXT NOT NULL,
  version_number TEXT NOT NULL,           -- z.B. '1.0', '1.1'
  document_id TEXT NOT NULL,              -- Referenz zu documents
  
  -- Änderungsnotizen
  change_notes TEXT,
  
  -- Versionskontrolle
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  approved_by TEXT,
  approval_date DATETIME,
  
  FOREIGN KEY (qm_document_id) REFERENCES qm_documents(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  INDEX idx_qm_document_id (qm_document_id),
  UNIQUE (qm_document_id, version_number)
);
```

---

## Benachrichtigungen und Erinnerungen

### Tabelle: `notifications`
Zentrale Benachrichtigungsverwaltung.

```sql
CREATE TABLE notifications (
  id TEXT PRIMARY KEY,                    -- UUID
  
  -- Benachrichtigungstyp
  notification_type TEXT NOT NULL,        -- 'contract_expiry', 'invoice_overdue', 'mailbox_new', 'qm_update'
  
  -- Referenzen
  entity_type TEXT NOT NULL,              -- 'contract', 'invoice', 'mailbox_item', 'qm_document'
  entity_id TEXT NOT NULL,
  
  -- Inhalt
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  is_dismissed BOOLEAN DEFAULT FALSE,
  
  -- Timing
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_for DATETIME,                 -- Wann die Benachrichtigung angezeigt werden soll
  dismissed_at DATETIME,
  
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at),
  INDEX idx_entity_type (entity_type)
);
```

---

## Indizes und Performance-Optimierungen

```sql
-- Für schnelle Volltextsuche über alle Dokumente
CREATE VIRTUAL TABLE documents_fts USING fts5(
  filename,
  ocr_text,
  content=documents,
  content_rowid=id
);

-- Automatische Aktualisierung der FTS-Tabelle
CREATE TRIGGER documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(rowid, filename, ocr_text)
  VALUES (new.id, new.filename, new.ocr_text);
END;

CREATE TRIGGER documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, filename, ocr_text)
  VALUES('delete', old.id, old.filename, old.ocr_text);
END;

CREATE TRIGGER documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, filename, ocr_text)
  VALUES('delete', old.id, old.filename, old.ocr_text);
  INSERT INTO documents_fts(rowid, filename, ocr_text)
  VALUES (new.id, new.filename, new.ocr_text);
END;
```

---

## SQL-Datei zum Initialisieren

Die vollständige SQL-Initialisierung wird in `/src/core/database/schema.sql` gespeichert und beim Starten der Anwendung über das Migrations-System ausgeführt.

---

## Datenbank-Design-Prinzipien

1. **Zentrale `documents`-Tabelle**: Ermöglicht Volltextsuche über alle Module hinweg
2. **UUID für IDs**: Garantiert Eindeutigkeit auch bei offline-Synchronisierung (zukünftig)
3. **Audit-Logging**: Jede Änderung wird in `audit_log` festgehalten
4. **Indizierung**: Häufig abgefragte Felder sind indiziert (z.B. `status`, `created_at`)
5. **Redundante Felder**: `partner_name`, `partner_type` sind redundant, aber für Performance wichtig
6. **Zeitstempel**: `created_at` und `updated_at` für Audit-Trails
7. **Modul-Isolation**: Jedes Modul hat seine Tabellen, die nur über `documents` und `audit_log` verbunden sind

---

## Sicherheitsaspekte

- **SQLCipher-Verschlüsselung**: Die gesamte Datenbank wird mit dem Master-Passwort verschlüsselt
- **DSGVO-Konformität**: Alle Löschungen werden als `soft delete` (Status = 'deleted') markiert, aber tatsächlich gelöscht (Datenspeicherung erfolgt auf Anfrage)
- **Audit-Trail**: Alle Änderungen werden geloggt für Compliance
- **Lokale Speicherung**: Kein Cloud-Sync, keine externen APIs – alles verbleibt auf dem PC
