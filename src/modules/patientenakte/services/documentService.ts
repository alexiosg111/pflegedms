/**
 * Document CRUD and OCR service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type { Document, CreateDocumentInput, PatientDocument } from '../types/document';

export class DocumentService {
  /**
   * Get all documents for a patient
   */
  async getByPatientId(patientId: string): Promise<PatientDocument[]> {
    try {
      const sql = `
        SELECT pd.* FROM patient_documents pd
        WHERE pd.patient_id = ?
        ORDER BY pd.created_at DESC
      `;
      const docs = await window.api.queryDatabase(sql, [patientId]);
      return docs as unknown as PatientDocument[];
    } catch (err) {
      logger.error(`Failed to fetch documents for patient ${patientId}`, err);
      throw err;
    }
  }

  /**
   * Get document by ID
   */
  async getDocumentById(documentId: string): Promise<Document | null> {
    try {
      const sql = 'SELECT * FROM documents WHERE id = ?';
      const docs = await window.api.queryDatabase(sql, [documentId]);
      return docs.length > 0 ? (docs[0] as unknown as Document) : null;
    } catch (err) {
      logger.error(`Failed to fetch document ${documentId}`, err);
      throw err;
    }
  }

  /**
   * Create document
   */
  async createDocument(input: CreateDocumentInput): Promise<Document> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO documents (
          id, filename, file_path, file_size, mime_type,
          entity_type, entity_id, document_type, status,
          ocr_text, is_ocr_processed, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.filename,
        input.file_path,
        input.file_size,
        input.mime_type,
        input.entity_type,
        input.entity_id,
        input.document_type,
        'active',
        null, // ocr_text
        false, // is_ocr_processed
        now,
        now,
        'user',
      ]);

      logger.info(`Document created: ${id}`);

      const doc = await this.getDocumentById(id);
      if (!doc) throw new Error('Document creation failed');

      return doc;
    } catch (err) {
      logger.error('Failed to create document', err);
      throw err;
    }
  }

  /**
   * Link document to patient
   */
  async linkToPatient(
    patientId: string,
    documentId: string,
    category: string,
    notes?: string
  ): Promise<PatientDocument> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO patient_documents (
          id, patient_id, document_id, category, notes, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      await window.api.executeDatabase(sql, [
        id,
        patientId,
        documentId,
        category,
        notes || null,
        new Date().toISOString(),
      ]);

      // Update document entity_type & entity_id
      await this.updateDocumentEntity(documentId, 'patient', patientId);

      logger.info(`Document linked to patient: ${patientId}`);

      return {
        id,
        patient_id: patientId,
        document_id: documentId,
        category,
        notes: notes || null,
        created_at: new Date().toISOString(),
      };
    } catch (err) {
      logger.error('Failed to link document to patient', err);
      throw err;
    }
  }

  /**
   * Update document entity reference
   */
  private async updateDocumentEntity(
    documentId: string,
    entityType: string,
    entityId: string
  ): Promise<void> {
    try {
      const sql = `
        UPDATE documents
        SET entity_type = ?, entity_id = ?, updated_at = ?
        WHERE id = ?
      `;

      await window.api.executeDatabase(sql, [
        entityType,
        entityId,
        new Date().toISOString(),
        documentId,
      ]);
    } catch (err) {
      logger.error('Failed to update document entity', err);
      throw err;
    }
  }

  /**
   * Update OCR text
   */
  async updateOCRText(documentId: string, ocrText: string): Promise<void> {
    try {
      const sql = `
        UPDATE documents
        SET ocr_text = ?, is_ocr_processed = 1, updated_at = ?
        WHERE id = ?
      `;

      await window.api.executeDatabase(sql, [ocrText, new Date().toISOString(), documentId]);

      logger.info(`OCR processed for document ${documentId}`);
    } catch (err) {
      logger.error(`Failed to update OCR text for document ${documentId}`, err);
      throw err;
    }
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const sql = "UPDATE documents SET status = 'archived', updated_at = ? WHERE id = ?";
      await window.api.executeDatabase(sql, [new Date().toISOString(), documentId]);

      // Also delete patient_documents link
      const sql2 = 'DELETE FROM patient_documents WHERE document_id = ?';
      await window.api.executeDatabase(sql2, [documentId]);

      logger.info(`Document archived: ${documentId}`);
    } catch (err) {
      logger.error(`Failed to delete document ${documentId}`, err);
      throw err;
    }
  }

  /**
   * Search documents by filename or OCR text
   */
  async searchDocuments(query: string): Promise<Document[]> {
    try {
      const sql = `
        SELECT d.* FROM documents d
        WHERE d.filename LIKE ? OR d.ocr_text LIKE ?
        AND d.status != 'archived'
        ORDER BY d.created_at DESC
        LIMIT 50
      `;

      const searchTerm = `%${query}%`;
      const docs = await window.api.queryDatabase(sql, [searchTerm, searchTerm]);
      return docs as unknown as Document[];
    } catch (err) {
      logger.error(`Failed to search documents for "${query}"`, err);
      throw err;
    }
  }

  /**
   * Get full document data with OCR text
   */
  async getDocumentFull(documentId: string): Promise<Document | null> {
    return this.getDocumentById(documentId);
  }
}

export const documentService = new DocumentService();
