/**
 * Quality Management (QM) data model and types
 */

export interface QMFolder {
  id: string;
  parent_folder_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  sort_order: number;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface QMDocument {
  id: string;
  folder_id: string;
  filename: string;
  file_path: string | null;
  file_size: number | null;
  mime_type: string | null;
  version_major: number;
  version_minor: number;
  is_current_version: boolean;
  status: 'draft' | 'approved' | 'archived';
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface CreateQMFolderInput {
  parent_folder_id?: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface CreateQMDocumentInput {
  folder_id: string;
  filename: string;
  file_path?: string;
  file_size?: number;
  mime_type?: string;
  created_by?: string;
}

export interface QMFolderTree extends QMFolder {
  children: QMFolderTree[];
  document_count: number;
}

export interface QMDocumentVersion {
  document_id: string;
  version_major: number;
  version_minor: number;
  created_at: string;
  created_by: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
}

export const QM_FOLDER_TEMPLATES = [
  {
    name: 'Hygieneplan',
    description: 'Hygiene- und Infektionsschutzmaßnahmen',
    icon: '🧼',
  },
  {
    name: 'Notfallmanagement',
    description: 'Notfall- und Krisenbewältigung',
    icon: '🚨',
  },
  {
    name: 'Personalmanagement',
    description: 'Schulungen und Personalentwicklung',
    icon: '👥',
  },
  {
    name: 'Kundenbetreuung',
    description: 'Betreuung und Beschwerdeverfahren',
    icon: '❤️',
  },
  {
    name: 'Datenschutz & DSGVO',
    description: 'Datenschutzrichtlinien und Compliance',
    icon: '🔒',
  },
  {
    name: 'Medizinische Standards',
    description: 'Medizinische Behandlungsprotokolle',
    icon: '⚕️',
  },
  {
    name: 'Dokumentation',
    description: 'Dokumentation und Archivierung',
    icon: '📋',
  },
  {
    name: 'Audit & Überprüfung',
    description: 'Interne Audits und Überprüfungen',
    icon: '✔️',
  },
];
