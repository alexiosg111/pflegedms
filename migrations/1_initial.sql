-- Pflegedienst Workspace - Initial Schema
-- Phase 1: Core Tables + Modul 1-5

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  
  document_type TEXT,
  status TEXT DEFAULT 'active',
  
  ocr_text TEXT,
  is_ocr_processed BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created ON documents(created_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  notification_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT 0,
  is_dismissed BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  scheduled_for DATETIME,
  dismissed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- ============================================================================
-- MODUL 1: PATIENTENAKTE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patients (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  
  phone TEXT,
  email TEXT,
  
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'DE',
  
  insurance_company TEXT,
  insurance_number TEXT,
  primary_doctor TEXT,
  
  status TEXT DEFAULT 'active',
  date_registered DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_last_name ON patients(last_name);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE FULLTEXT INDEX idx_patients_search ON patients(first_name, last_name);

CREATE TABLE IF NOT EXISTS patient_documents (
  id TEXT PRIMARY KEY,
  patient_id TEXT NOT NULL,
  document_id TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE (patient_id, document_id)
);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient ON patient_documents(patient_id);

-- ============================================================================
-- MODUL 2: POSTEINGANG
-- ============================================================================

CREATE TABLE IF NOT EXISTS mailbox_items (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  
  status TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'normal',
  item_type TEXT DEFAULT 'unknown',
  
  assigned_to_patient_id TEXT,
  assigned_to_module TEXT,
  
  reminder_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  notes TEXT,
  
  FOREIGN KEY (document_id) REFERENCES documents(id),
  FOREIGN KEY (assigned_to_patient_id) REFERENCES patients(id)
);

CREATE INDEX IF NOT EXISTS idx_mailbox_items_status ON mailbox_items(status);
CREATE INDEX IF NOT EXISTS idx_mailbox_items_created ON mailbox_items(created_at);

-- ============================================================================
-- MODUL 3: VERTRAGSMANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  
  address TEXT,
  postal_code TEXT,
  city TEXT,
  country TEXT DEFAULT 'DE',
  
  supplier_type TEXT,
  tax_id TEXT,
  status TEXT DEFAULT 'active',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

CREATE TABLE IF NOT EXISTS contracts (
  id TEXT PRIMARY KEY,
  partner_type TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  
  contract_name TEXT NOT NULL,
  description TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  renewal_date DATE,
  cancellation_period_days INTEGER,
  
  status TEXT DEFAULT 'active',
  contract_document_id TEXT,
  
  reminder_days_before_expiry INTEGER DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (contract_document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_contracts_partner ON contracts(partner_type, partner_id);
CREATE INDEX IF NOT EXISTS idx_contracts_end_date ON contracts(end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_status ON contracts(status);

-- ============================================================================
-- MODUL 4: RECHNUNGSMANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  invoice_type TEXT NOT NULL,
  
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  
  partner_type TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  
  document_id TEXT,
  
  status TEXT DEFAULT 'open',
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  
  reminder_sent BOOLEAN DEFAULT 0,
  reminder_sent_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_type ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_partner ON invoices(partner_type, partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================================================
-- MODUL 5: QUALITÄTSMANAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS qm_folders (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_folder_id TEXT,
  sort_order INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (parent_folder_id) REFERENCES qm_folders(id),
  UNIQUE (name, parent_folder_id)
);

CREATE INDEX IF NOT EXISTS idx_qm_folders_parent ON qm_folders(parent_folder_id);

CREATE TABLE IF NOT EXISTS qm_documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  folder_id TEXT NOT NULL,
  
  current_version TEXT NOT NULL,
  document_id TEXT NOT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  approved_by TEXT,
  approval_date DATETIME,
  
  FOREIGN KEY (folder_id) REFERENCES qm_folders(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE (title, folder_id)
);

CREATE INDEX IF NOT EXISTS idx_qm_documents_folder ON qm_documents(folder_id);

CREATE TABLE IF NOT EXISTS qm_document_versions (
  id TEXT PRIMARY KEY,
  qm_document_id TEXT NOT NULL,
  version_number TEXT NOT NULL,
  document_id TEXT NOT NULL,
  
  change_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  approved_by TEXT,
  approval_date DATETIME,
  
  FOREIGN KEY (qm_document_id) REFERENCES qm_documents(id),
  FOREIGN KEY (document_id) REFERENCES documents(id),
  UNIQUE (qm_document_id, version_number)
);

CREATE INDEX IF NOT EXISTS idx_qm_document_versions_qm ON qm_document_versions(qm_document_id);

-- ============================================================================
-- FULL-TEXT SEARCH
-- ============================================================================

CREATE VIRTUAL TABLE IF NOT EXISTS documents_fts USING fts5(
  filename,
  ocr_text,
  content=documents,
  content_rowid=id
);

-- Trigger to automatically update FTS table
CREATE TRIGGER IF NOT EXISTS documents_ai AFTER INSERT ON documents BEGIN
  INSERT INTO documents_fts(rowid, filename, ocr_text)
  VALUES (new.id, new.filename, new.ocr_text);
END;

CREATE TRIGGER IF NOT EXISTS documents_ad AFTER DELETE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, filename, ocr_text)
  VALUES ('delete', old.id, old.filename, old.ocr_text);
END;

CREATE TRIGGER IF NOT EXISTS documents_au AFTER UPDATE ON documents BEGIN
  INSERT INTO documents_fts(documents_fts, rowid, filename, ocr_text)
  VALUES ('delete', old.id, old.filename, old.ocr_text);
  INSERT INTO documents_fts(rowid, filename, ocr_text)
  VALUES (new.id, new.filename, new.ocr_text);
END;

-- ============================================================================
-- PRAGMAS FOR PERFORMANCE
-- ============================================================================

PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;
