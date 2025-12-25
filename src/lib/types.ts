export type DocumentCategory = 
  | 'pflegeplan'
  | 'aerztlicher-bericht'
  | 'vertrag'
  | 'laborergebnis'
  | 'verordnung'
  | 'arztbrief'
  | 'pflegedokumentation'
  | 'medikationsplan'
  | 'einwilligung'
  | 'sonstiges';

export type DocumentStatus = 'draft' | 'active' | 'archived' | 'deleted';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type AccessRight = 'view' | 'edit' | 'delete' | 'approve';

export type AuditAction = 'create' | 'edit' | 'delete' | 'view' | 'approve' | 'reject' | 'restore';

export interface DocumentMetadata {
  [key: string]: string | number | boolean;
}

export interface DocumentVersion {
  versionNumber: number;
  content: {
    title: string;
    notes: string;
    metadata: DocumentMetadata;
  };
  changedBy: string;
  changedAt: string;
  changeLog: string;
}

export interface ApprovalRecord {
  approverId: string;
  status: ApprovalStatus;
  comment?: string;
  timestamp: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export interface DocumentAccessControl {
  userId: string;
  rights: AccessRight[];
}

export interface Document {
  id: string;
  title: string;
  date: string;
  patientId: string;
  category: DocumentCategory;
  type: string;
  notes: string;
  metadata: DocumentMetadata;
  version: number;
  status: DocumentStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  createdBy: string;
  versions: DocumentVersion[];
  approvalStatus?: ApprovalStatus;
  approvalRecords: ApprovalRecord[];
  accessControl: DocumentAccessControl[];
  auditLog: AuditLogEntry[];
  ocrText?: string;
  originalFileName?: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: DocumentCategory;
  description: string;
  defaultMetadata: DocumentMetadata;
  defaultContent: string;
  createdAt: string;
  updatedAt: string;
}

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  address: string;
  phone: string;
  insurance: string;
  diagnosis: string;
  notes: string;
}

export interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  patientId: string;
  staffId: string;
  notes: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  qualifications: string;
  notes: string;
}

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string; description: string }[] = [
  { value: 'pflegeplan', label: 'Pflegeplan', description: 'Individueller Pflegeplan für den Patienten' },
  { value: 'aerztlicher-bericht', label: 'Ärztlicher Bericht', description: 'Medizinische Berichte von Ärzten' },
  { value: 'vertrag', label: 'Vertrag', description: 'Pflegeverträge und Vereinbarungen' },
  { value: 'laborergebnis', label: 'Laborergebnis', description: 'Laboruntersuchungsergebnisse' },
  { value: 'verordnung', label: 'Verordnung', description: 'Medizinische Verordnungen' },
  { value: 'arztbrief', label: 'Arztbrief', description: 'Ärztliche Korrespondenz' },
  { value: 'pflegedokumentation', label: 'Pflegedokumentation', description: 'Tägliche Pflegedokumentation' },
  { value: 'medikationsplan', label: 'Medikationsplan', description: 'Übersicht der Medikation' },
  { value: 'einwilligung', label: 'Einwilligung', description: 'Einwilligungserklärungen' },
  { value: 'sonstiges', label: 'Sonstiges', description: 'Andere Dokumente' }
];
