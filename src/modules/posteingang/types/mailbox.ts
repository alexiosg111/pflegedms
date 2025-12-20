/**
 * Mailbox data model and types
 */

export interface MailboxItem {
  id: string;
  document_id: string;
  status: 'new' | 'in_progress' | 'completed' | 'rejected';
  priority: 'low' | 'normal' | 'high';
  item_type: string;
  assigned_to_patient_id: string | null;
  assigned_to_module: string | null;
  reminder_date: string | null;
  created_at: string;
  completed_at: string | null;
  notes: string | null;
}

export interface CreateMailboxItemInput {
  document_id: string;
  priority?: 'low' | 'normal' | 'high';
  item_type?: string;
  notes?: string;
}

export interface MailboxStats {
  total: number;
  new: number;
  in_progress: number;
  completed: number;
}

export enum MailboxStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export enum MailboxPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
}

export enum TargetModule {
  PATIENTS = 'patients',
  CONTRACTS = 'contracts',
  INVOICES = 'invoices',
  QM = 'qm',
  ARCHIVE = 'archive',
}
