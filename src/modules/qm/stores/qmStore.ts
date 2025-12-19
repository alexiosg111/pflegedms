/**
 * QM state management store
 */

import { writable } from 'svelte/store';
import { qmService } from '../services/qmService';
import { logger } from '@core/utils/logger';
import type { QMFolder, QMDocument, QMFolderTree, CreateQMFolderInput, CreateQMDocumentInput } from '../types/qm';

interface QMState {
  folders: QMFolder[];
  folderTree: QMFolderTree[];
  documents: QMDocument[];
  currentFolderId: string | null;
  selectedDocumentId: string | null;
  isLoading: boolean;
  error: string | null;
}

function createQMStore() {
  const { subscribe, update } = writable<QMState>({
    folders: [],
    folderTree: [],
    documents: [],
    currentFolderId: null,
    selectedDocumentId: null,
    isLoading: false,
    error: null,
  });

  return {
    subscribe,

    // Load all folders and build tree
    async loadFolders() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const folders = await qmService.getAllFolders();
        const folderTree = await qmService.getFolderTree();
        update((state) => ({
          ...state,
          folders,
          folderTree,
          isLoading: false,
        }));
        logger.info(`Loaded ${folders.length} QM folders`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load QM folders', err);
      }
    },

    // Load documents in folder
    async loadFolderDocuments(folderId: string) {
      update((state) => ({ ...state, currentFolderId: folderId, isLoading: true, error: null }));
      try {
        const documents = await qmService.getDocumentsByFolder(folderId);
        update((state) => ({
          ...state,
          documents,
          isLoading: false,
        }));
        logger.info(`Loaded ${documents.length} documents for folder ${folderId}`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load folder documents', err);
      }
    },

    // Create folder
    async createFolder(input: CreateQMFolderInput): Promise<QMFolder | null> {
      try {
        const folder = await qmService.createFolder(input);
        // Reload folder tree
        await this.loadFolders();
        logger.info(`QM folder created: ${folder.id}`);
        return folder;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create QM folder', err);
        return null;
      }
    },

    // Update folder
    async updateFolder(id: string, input: Partial<CreateQMFolderInput>): Promise<QMFolder | null> {
      try {
        const folder = await qmService.updateFolder(id, input);
        await this.loadFolders();
        logger.info(`QM folder updated: ${id}`);
        return folder;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update QM folder', err);
        return null;
      }
    },

    // Delete folder
    async deleteFolder(id: string): Promise<boolean> {
      try {
        await qmService.deleteFolder(id);
        await this.loadFolders();
        logger.info(`QM folder deleted: ${id}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete QM folder', err);
        return false;
      }
    },

    // Create document
    async createDocument(input: CreateQMDocumentInput): Promise<QMDocument | null> {
      try {
        const doc = await qmService.createDocument(input);
        // Reload documents in current folder
        if (input.folder_id) {
          await this.loadFolderDocuments(input.folder_id);
        }
        logger.info(`QM document created: ${doc.id}`);
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create QM document', err);
        return null;
      }
    },

    // Approve document
    async approveDocument(id: string): Promise<QMDocument | null> {
      try {
        const doc = await qmService.approveDocument(id);
        if (doc) {
          update((state) => ({
            ...state,
            documents: state.documents.map((d) => (d.id === id ? doc : d)),
          }));
          logger.info(`QM document approved: ${id}`);
          return doc;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to approve QM document', err);
      }
      return null;
    },

    // Create new version
    async createNewVersion(
      documentId: string,
      input: CreateQMDocumentInput
    ): Promise<QMDocument | null> {
      try {
        const doc = await qmService.createNewVersion(documentId, input);
        if (input.folder_id) {
          await this.loadFolderDocuments(input.folder_id);
        }
        logger.info(`QM document new version created: ${doc.id}`);
        return doc;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create new QM document version', err);
        return null;
      }
    },

    // Delete document
    async deleteDocument(id: string): Promise<boolean> {
      try {
        await qmService.deleteDocument(id);
        update((state) => ({
          ...state,
          documents: state.documents.filter((d) => d.id !== id),
        }));
        logger.info(`QM document deleted: ${id}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete QM document', err);
        return false;
      }
    },

    // Select document
    selectDocument(id: string | null) {
      update((state) => ({
        ...state,
        selectedDocumentId: id,
      }));
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

export const qmStore = createQMStore();
