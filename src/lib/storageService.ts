import type { Document, DocumentTemplate, Patient, Appointment, Staff } from './types';
import { migrateOldDocument, DEFAULT_TEMPLATES } from './documentService';

const STORAGE_VERSION_KEY = 'pflegedms_storage_version';
const CURRENT_STORAGE_VERSION = '2.0';

const KEYS = {
  patients: 'pflegedms_patients',
  appointments: 'pflegedms_appointments',
  documents: 'pflegedms_documents',
  staff: 'pflegedms_staff',
  templates: 'pflegedms_templates'
};

export class StorageService {
  static init(): void {
    if (typeof localStorage === 'undefined') return;
    
    const currentVersion = localStorage.getItem(STORAGE_VERSION_KEY);
    
    if (!currentVersion || currentVersion !== CURRENT_STORAGE_VERSION) {
      this.migrateStorage(currentVersion);
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_STORAGE_VERSION);
    }
    
    const existingTemplates = this.getTemplates();
    if (existingTemplates.length === 0) {
      this.saveTemplates(DEFAULT_TEMPLATES);
    }
  }
  
  static migrateStorage(fromVersion: string | null): void {
    console.log(`Migrating storage from version ${fromVersion || 'legacy'} to ${CURRENT_STORAGE_VERSION}`);
    
    const oldDocuments = this.getDocuments();
    const migratedDocuments = oldDocuments.map(doc => {
      if (!doc.version || !doc.status || !doc.auditLog) {
        console.log(`Migrating document: ${doc.id}`);
        return migrateOldDocument(doc);
      }
      return doc;
    });
    
    this.saveDocuments(migratedDocuments);
    console.log(`Migration complete. Migrated ${migratedDocuments.length} documents.`);
  }
  
  static getPatients(): Patient[] {
    return this.getFromStorage<Patient[]>(KEYS.patients, []);
  }
  
  static savePatients(patients: Patient[]): void {
    this.saveToStorage(KEYS.patients, patients);
  }
  
  static getAppointments(): Appointment[] {
    return this.getFromStorage<Appointment[]>(KEYS.appointments, []);
  }
  
  static saveAppointments(appointments: Appointment[]): void {
    this.saveToStorage(KEYS.appointments, appointments);
  }
  
  static getDocuments(): Document[] {
    return this.getFromStorage<Document[]>(KEYS.documents, []);
  }
  
  static saveDocuments(documents: Document[]): void {
    this.saveToStorage(KEYS.documents, documents);
  }
  
  static getStaff(): Staff[] {
    return this.getFromStorage<Staff[]>(KEYS.staff, []);
  }
  
  static saveStaff(staff: Staff[]): void {
    this.saveToStorage(KEYS.staff, staff);
  }
  
  static getTemplates(): DocumentTemplate[] {
    return this.getFromStorage<DocumentTemplate[]>(KEYS.templates, []);
  }
  
  static saveTemplates(templates: DocumentTemplate[]): void {
    this.saveToStorage(KEYS.templates, templates);
  }
  
  private static getFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof localStorage === 'undefined') return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Error loading from storage (${key}):`, e);
      return defaultValue;
    }
  }
  
  private static saveToStorage<T>(key: string, value: T): void {
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error saving to storage (${key}):`, e);
    }
  }
}
