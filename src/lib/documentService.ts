import type { 
  Document, 
  DocumentVersion, 
  DocumentTemplate,
  AuditLogEntry,
  AuditAction,
  ApprovalRecord,
  ApprovalStatus,
  DocumentCategory,
  DocumentStatus
} from './types';

const CURRENT_USER_ID = 'system';
const CURRENT_USER_NAME = 'System';

function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

function getBrowserInfo(): { ipAddress?: string; deviceInfo?: string } {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  return {
    deviceInfo: userAgent
  };
}

export function migrateOldDocument(oldDoc: any): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const newDoc: Document = {
    id: oldDoc.id || Date.now().toString(),
    title: oldDoc.title || '',
    date: oldDoc.date || now,
    patientId: oldDoc.patientId || '',
    category: mapOldTypeToCategory(oldDoc.type),
    type: oldDoc.type || '',
    notes: oldDoc.notes || '',
    metadata: {},
    version: 1,
    status: 'active',
    tags: [],
    createdAt: oldDoc.createdAt || now,
    updatedAt: oldDoc.updatedAt || now,
    createdBy: oldDoc.createdBy || CURRENT_USER_ID,
    versions: [{
      versionNumber: 1,
      content: {
        title: oldDoc.title || '',
        notes: oldDoc.notes || '',
        metadata: {}
      },
      changedBy: CURRENT_USER_ID,
      changedAt: oldDoc.createdAt || now,
      changeLog: 'Initiale Version (migriert)'
    }],
    approvalRecords: [],
    accessControl: [],
    auditLog: [{
      id: `audit-${Date.now()}`,
      action: 'create',
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      timestamp: oldDoc.createdAt || now,
      details: 'Dokument migriert von alter Struktur',
      ...browserInfo
    }]
  };
  
  return newDoc;
}

function mapOldTypeToCategory(type: string): DocumentCategory {
  const typeMap: { [key: string]: DocumentCategory } = {
    'Bericht': 'aerztlicher-bericht',
    'Arztbrief': 'arztbrief',
    'Verordnung': 'verordnung',
    'Pflegeplan': 'pflegeplan',
    'Labor': 'laborergebnis',
    'Vertrag': 'vertrag'
  };
  
  return typeMap[type] || 'sonstiges';
}

export function createNewDocument(
  title: string,
  patientId: string,
  category: DocumentCategory,
  notes: string = ''
): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  const id = Date.now().toString();
  
  const document: Document = {
    id,
    title,
    date: now,
    patientId,
    category,
    type: '',
    notes,
    metadata: {},
    version: 1,
    status: 'draft',
    tags: [],
    createdAt: now,
    updatedAt: now,
    createdBy: CURRENT_USER_ID,
    versions: [{
      versionNumber: 1,
      content: {
        title,
        notes,
        metadata: {}
      },
      changedBy: CURRENT_USER_ID,
      changedAt: now,
      changeLog: 'Initiale Version'
    }],
    approvalRecords: [],
    accessControl: [],
    auditLog: [{
      id: `audit-${Date.now()}`,
      action: 'create',
      userId: CURRENT_USER_ID,
      userName: CURRENT_USER_NAME,
      timestamp: now,
      details: 'Dokument erstellt',
      ...browserInfo
    }]
  };
  
  return document;
}

export function updateDocument(
  document: Document,
  updates: Partial<Pick<Document, 'title' | 'notes' | 'metadata' | 'tags' | 'patientId' | 'category'>>,
  changeLog: string = 'Dokument aktualisiert'
): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const newVersion: DocumentVersion = {
    versionNumber: document.version + 1,
    content: {
      title: updates.title || document.title,
      notes: updates.notes || document.notes,
      metadata: updates.metadata || document.metadata
    },
    changedBy: CURRENT_USER_ID,
    changedAt: now,
    changeLog
  };
  
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    action: 'edit',
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    timestamp: now,
    details: changeLog,
    ...browserInfo
  };
  
  return {
    ...document,
    ...updates,
    version: newVersion.versionNumber,
    updatedAt: now,
    versions: [...document.versions, newVersion],
    auditLog: [...document.auditLog, auditEntry]
  };
}

export function changeDocumentStatus(
  document: Document,
  newStatus: DocumentStatus,
  reason?: string
): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    action: newStatus === 'deleted' ? 'delete' : 'edit',
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    timestamp: now,
    details: `Status geändert zu: ${newStatus}${reason ? ` (${reason})` : ''}`,
    ...browserInfo
  };
  
  const updates: Partial<Document> = {
    status: newStatus,
    updatedAt: now,
    auditLog: [...document.auditLog, auditEntry]
  };
  
  if (newStatus === 'archived') {
    updates.archivedAt = now;
  }
  
  return {
    ...document,
    ...updates
  };
}

export function addApprovalRecord(
  document: Document,
  approverId: string,
  status: ApprovalStatus,
  comment?: string
): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const approvalRecord: ApprovalRecord = {
    approverId,
    status,
    comment,
    timestamp: now
  };
  
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    action: status === 'approved' ? 'approve' : 'reject',
    userId: approverId,
    userName: approverId,
    timestamp: now,
    details: `Dokument ${status === 'approved' ? 'freigegeben' : 'abgelehnt'}${comment ? `: ${comment}` : ''}`,
    ...browserInfo
  };
  
  return {
    ...document,
    approvalStatus: status,
    approvalRecords: [...document.approvalRecords, approvalRecord],
    auditLog: [...document.auditLog, auditEntry],
    updatedAt: now
  };
}

export function restoreVersion(document: Document, versionNumber: number): Document {
  const versionToRestore = document.versions.find(v => v.versionNumber === versionNumber);
  
  if (!versionToRestore) {
    throw new Error(`Version ${versionNumber} not found`);
  }
  
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const newVersion: DocumentVersion = {
    versionNumber: document.version + 1,
    content: { ...versionToRestore.content },
    changedBy: CURRENT_USER_ID,
    changedAt: now,
    changeLog: `Wiederhergestellt von Version ${versionNumber}`
  };
  
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    action: 'edit',
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    timestamp: now,
    details: `Version ${versionNumber} wiederhergestellt`,
    ...browserInfo
  };
  
  return {
    ...document,
    title: versionToRestore.content.title,
    notes: versionToRestore.content.notes,
    metadata: versionToRestore.content.metadata,
    version: newVersion.versionNumber,
    updatedAt: now,
    versions: [...document.versions, newVersion],
    auditLog: [...document.auditLog, auditEntry]
  };
}

export function addAuditLog(
  document: Document,
  action: AuditAction,
  details?: string
): Document {
  const now = getCurrentTimestamp();
  const browserInfo = getBrowserInfo();
  
  const auditEntry: AuditLogEntry = {
    id: `audit-${Date.now()}`,
    action,
    userId: CURRENT_USER_ID,
    userName: CURRENT_USER_NAME,
    timestamp: now,
    details,
    ...browserInfo
  };
  
  return {
    ...document,
    auditLog: [...document.auditLog, auditEntry]
  };
}

export function searchDocuments(
  documents: Document[],
  query: string,
  filters?: {
    category?: DocumentCategory;
    status?: DocumentStatus;
    tags?: string[];
    dateFrom?: string;
    dateTo?: string;
  }
): Document[] {
  const lowerQuery = query.toLowerCase();
  
  return documents.filter(doc => {
    if (filters?.category && doc.category !== filters.category) {
      return false;
    }
    
    if (filters?.status && doc.status !== filters.status) {
      return false;
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      const hasAllTags = filters.tags.every(tag => doc.tags.includes(tag));
      if (!hasAllTags) return false;
    }
    
    if (filters?.dateFrom && doc.createdAt < filters.dateFrom) {
      return false;
    }
    
    if (filters?.dateTo && doc.createdAt > filters.dateTo) {
      return false;
    }
    
    if (!query) return true;
    
    return (
      doc.title.toLowerCase().includes(lowerQuery) ||
      doc.notes.toLowerCase().includes(lowerQuery) ||
      doc.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      doc.category.toLowerCase().includes(lowerQuery) ||
      (doc.ocrText && doc.ocrText.toLowerCase().includes(lowerQuery)) ||
      Object.values(doc.metadata).some(value => 
        String(value).toLowerCase().includes(lowerQuery)
      )
    );
  });
}

export function classifyDocument(title: string, content: string): DocumentCategory {
  const text = `${title} ${content}`.toLowerCase();
  
  const patterns: { pattern: RegExp; category: DocumentCategory }[] = [
    { pattern: /pflegeplan|pflege.*plan/i, category: 'pflegeplan' },
    { pattern: /labor|blutbild|untersuchung.*ergebnis/i, category: 'laborergebnis' },
    { pattern: /medikation|medikament|arzneimittel/i, category: 'medikationsplan' },
    { pattern: /arzt.*bericht|befund|diagnose/i, category: 'aerztlicher-bericht' },
    { pattern: /arztbrief|brief.*arzt/i, category: 'arztbrief' },
    { pattern: /verordnung|rezept|verschreibung/i, category: 'verordnung' },
    { pattern: /vertrag|vereinbarung/i, category: 'vertrag' },
    { pattern: /einwilligung|einverständnis|zustimmung/i, category: 'einwilligung' },
    { pattern: /dokumentation|bericht.*pflege/i, category: 'pflegedokumentation' }
  ];
  
  for (const { pattern, category } of patterns) {
    if (pattern.test(text)) {
      return category;
    }
  }
  
  return 'sonstiges';
}

export function extractMetadata(content: string): { [key: string]: string } {
  const metadata: { [key: string]: string } = {};
  
  const datePattern = /datum[:\s]+(\d{1,2}[\./]\d{1,2}[\./]\d{2,4})/i;
  const dateMatch = content.match(datePattern);
  if (dateMatch) {
    metadata.datum = dateMatch[1];
  }
  
  const diagnosisPattern = /diagnose[:\s]+([^\n]{3,100})/i;
  const diagnosisMatch = content.match(diagnosisPattern);
  if (diagnosisMatch) {
    metadata.diagnose = diagnosisMatch[1].trim();
  }
  
  const doctorPattern = /arzt[:\s]+([^\n]{3,50})/i;
  const doctorMatch = content.match(doctorPattern);
  if (doctorMatch) {
    metadata.arzt = doctorMatch[1].trim();
  }
  
  return metadata;
}

export const DEFAULT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'template-pflegeplan',
    name: 'Standard Pflegeplan',
    category: 'pflegeplan',
    description: 'Vorlage für einen individuellen Pflegeplan',
    defaultMetadata: {
      erstelltVon: '',
      überprüftAm: ''
    },
    defaultContent: `# Pflegeplan

## Patienteninformationen
- Name: 
- Geburtsdatum:

## Pflegeziele
1. 

## Pflegemaßnahmen
1. 

## Medikation
- 

## Besonderheiten
`,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  },
  {
    id: 'template-medikationsplan',
    name: 'Medikationsplan',
    category: 'medikationsplan',
    description: 'Vorlage für Medikationspläne',
    defaultMetadata: {
      gültigAb: '',
      gültigBis: ''
    },
    defaultContent: `# Medikationsplan

## Patient
- Name:
- Geb.-Datum:

## Medikamente

| Medikament | Dosierung | Morgens | Mittags | Abends | Nachts | Hinweise |
|------------|-----------|---------|---------|--------|--------|----------|
|            |           |         |         |        |        |          |

## Hinweise
`,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  },
  {
    id: 'template-pflegedoku',
    name: 'Pflegedokumentation',
    category: 'pflegedokumentation',
    description: 'Vorlage für tägliche Pflegedokumentation',
    defaultMetadata: {
      schicht: '',
      pflegekraft: ''
    },
    defaultContent: `# Pflegedokumentation

Datum: 
Zeit: 
Pflegekraft: 

## Durchgeführte Maßnahmen
- 

## Beobachtungen
- 

## Besonderheiten
- 

## Unterschrift
`,
    createdAt: getCurrentTimestamp(),
    updatedAt: getCurrentTimestamp()
  }
];
