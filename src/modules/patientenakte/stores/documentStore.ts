/**
 * Document state management store
 */

import { writable } from 'svelte/store';
import { documentService } from '../services/documentService';
import { ocrService } from '../services/ocrService';
import { logger } from '@core/utils/logger';
import type { Document, PatientDocument, CreateDocumentInput } from '../types/document';

interface DocumentState {
  documents: PatientDocument[];
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadProgress: number;
}

function createDocumentStore() {
  const { subscribe, update } = writable<DocumentState>({
    documents: [],
    isLoading: false,
    isUploading: false,
    error: null,
    uploadProgress: 0,
  });

  return {
    subscribe,

    // Load documents for patient
    async loadDocuments(patientId: string) {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const documents = await documentService.getByPatientId(patientId);
        update((state) => ({
          ...state,
          documents,
          isLoading: false,
        }));
        logger.info(`Loaded ${documents.length} documents for patient ${patientId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load documents', err);
      }
    },

    // Upload document
    async uploadDocument(
      file: File,
      patientId: string,
      category: string,
      notes?: string
    ): Promise<PatientDocument | null> {
      update((state) => ({ ...state, isUploading: true, uploadProgress: 0, error: null }));

      try {
        // Save file (simulate - in real app, send to server)
        const filePath = `documents/${Date.now()}_${file.name}`;

        logger.info(`Uploading file: ${file.name}`);
        update((state) => ({ ...state, uploadProgress: 30 }));

        // Create document record
        const docInput: CreateDocumentInput = {
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          entity_type: 'mailbox', // Initially in mailbox
          entity_id: null,
          document_type: 'unknown',
        };

        const doc = await documentService.createDocument(docInput);
        update((state) => ({ ...state, uploadProgress: 60 }));

        // Run OCR in background
        if (file.type.startsWith('image/')) {
          try {
            const ocrResult = await ocrService.processFile(file);
            await documentService.updateOCRText(doc.id, ocrResult.text);
            logger.info(`OCR completed for ${file.name}`);
            update((state) => ({ ...state, uploadProgress: 80 }));
          } catch (ocrErr) {
            logger.warn(`OCR failed for ${file.name}, continuing without OCR`, ocrErr);
          }
        }

        // Link to patient
        const linkedDoc = await documentService.linkToPatient(
          patientId,
          doc.id,
          category,
          notes
        );

        update((state) => ({
          ...state,
          documents: [...state.documents, linkedDoc],
          isUploading: false,
          uploadProgress: 100,
        }));

        logger.info(`Document linked to patient: ${doc.id}`);
        return linkedDoc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isUploading: false,
          error: message,
          uploadProgress: 0,
        }));
        logger.error('Failed to upload document', err);
        return null;
      }
    },

    // Delete document
    async deleteDocument(documentId: string): Promise<boolean> {
      try {
        await documentService.deleteDocument(documentId);
        update((state) => ({
          ...state,
          documents: state.documents.filter((d) => d.document_id !== documentId),
        }));
        logger.info(`Document deleted: ${documentId}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete document', err);
        return false;
      }
    },

    // Clear error
    clearError() {
      update((state) => ({
        ...state,
        error: null,
      }));
    },
  };
}

export const documentStore = createDocumentStore();
