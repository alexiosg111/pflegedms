/**
 * Document data model and types
 */

export interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number | null;
  mime_type: string | null;
  entity_type: string;
  entity_id: string | null;
  document_type: string | null;
  status: 'active' | 'archived' | 'deleted';
  ocr_text: string | null;
  is_ocr_processed: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  document_id: string;
  category: string;
  notes: string | null;
  created_at: string;
}

export interface CreateDocumentInput {
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  entity_type: string;
  entity_id: string | null;
  document_type: string;
}

export interface DocumentCategory {
  id: string;
  label: string;
  icon: string;
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'prescription', label: 'Rezept', icon: '💊' },
  { id: 'lab_report', label: 'Laborbefund', icon: '🧪' },
  { id: 'doctor_letter', label: 'Arztbrief', icon: '📋' },
  { id: 'insurance', label: 'Versicherung', icon: '🏥' },
  { id: 'contract', label: 'Vertrag', icon: '📄' },
  { id: 'care_plan', label: 'Pflegeplan', icon: '📝' },
  { id: 'other', label: 'Sonstiges', icon: '📎' },
];
