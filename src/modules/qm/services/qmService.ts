/**
 * QM (Quality Management) CRUD service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type {
  QMFolder,
  QMDocument,
  CreateQMFolderInput,
  CreateQMDocumentInput,
  QMFolderTree,
  QMDocumentVersion,
} from '../types/qm';

export class QMService {
  /**
   * Get all folders (flat list)
   */
  async getAllFolders(): Promise<QMFolder[]> {
    try {
      const sql = `
        SELECT * FROM qm_folders
        WHERE status = 'active'
        ORDER BY parent_folder_id, sort_order, name
      `;
      const folders = await window.api.queryDatabase(sql);
      logger.info(`Fetched ${folders.length} QM folders`);
      return folders as unknown as QMFolder[];
    } catch (err) {
      logger.error('Failed to fetch QM folders', err);
      throw err;
    }
  }

  /**
   * Get folder tree (recursive structure)
   */
  async getFolderTree(parentId: string | null = null): Promise<QMFolderTree[]> {
    try {
      const allFolders = await this.getAllFolders();
      const docs = await this.getAllDocuments();

      const buildTree = (parentId: string | null): QMFolderTree[] => {
        return allFolders
          .filter((f) => f.parent_folder_id === parentId)
          .map((folder) => ({
            ...folder,
            children: buildTree(folder.id),
            document_count: docs.filter((d) => d.folder_id === folder.id).length,
          }))
          .sort((a, b) => a.sort_order - b.sort_order);
      };

      return buildTree(parentId);
    } catch (err) {
      logger.error('Failed to fetch QM folder tree', err);
      throw err;
    }
  }

  /**
   * Get folder by ID
   */
  async getFolderById(id: string): Promise<QMFolder | null> {
    try {
      const sql = 'SELECT * FROM qm_folders WHERE id = ?';
      const folders = await window.api.queryDatabase(sql, [id]);
      return folders.length > 0 ? (folders[0] as unknown as QMFolder) : null;
    } catch (err) {
      logger.error(`Failed to fetch QM folder ${id}`, err);
      throw err;
    }
  }

  /**
   * Create folder
   */
  async createFolder(input: CreateQMFolderInput): Promise<QMFolder> {
    const id = uuidv4();

    try {
      // Get max sort_order in parent folder
      const maxSortSql = `
        SELECT COALESCE(MAX(sort_order), 0) as max_order 
        FROM qm_folders 
        WHERE parent_folder_id = ?
      `;
      const result = await window.api.queryDatabase(maxSortSql, [input.parent_folder_id || null]);
      const sortOrder = (result[0] as any).max_order + 1;

      const sql = `
        INSERT INTO qm_folders (
          id, parent_folder_id, name, description, icon, sort_order,
          status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.parent_folder_id || null,
        input.name,
        input.description || null,
        input.icon || '📁',
        sortOrder,
        'active',
        now,
        now,
      ]);

      logger.info(`QM folder created: ${id}`);

      const folder = await this.getFolderById(id);
      if (!folder) throw new Error('QM folder creation failed');

      return folder;
    } catch (err) {
      logger.error('Failed to create QM folder', err);
      throw err;
    }
  }

  /**
   * Update folder
   */
  async updateFolder(id: string, input: Partial<CreateQMFolderInput>): Promise<QMFolder> {
    try {
      const updates: string[] = [];
      const values: unknown[] = [];

      Object.entries(input).forEach(([key, value]) => {
        if (value !== undefined) {
          updates.push(`${key} = ?`);
          values.push(value);
        }
      });

      updates.push('updated_at = ?');
      values.push(new Date().toISOString());
      values.push(id);

      const sql = `UPDATE qm_folders SET ${updates.join(', ')} WHERE id = ?`;
      await window.api.executeDatabase(sql, values);

      logger.info(`QM folder updated: ${id}`);

      const folder = await this.getFolderById(id);
      if (!folder) throw new Error('QM folder update failed');

      return folder;
    } catch (err) {
      logger.error(`Failed to update QM folder ${id}`, err);
      throw err;
    }
  }

  /**
   * Delete folder (soft delete)
   */
  async deleteFolder(id: string): Promise<void> {
    try {
      const sql = "UPDATE qm_folders SET status = 'archived', updated_at = ? WHERE id = ?";
      await window.api.executeDatabase(sql, [new Date().toISOString(), id]);
      logger.info(`QM folder deleted: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete QM folder ${id}`, err);
      throw err;
    }
  }

  /**
   * Get all documents (flat list)
   */
  async getAllDocuments(): Promise<QMDocument[]> {
    try {
      const sql = `
        SELECT * FROM qm_documents
        WHERE status != 'archived'
        ORDER BY folder_id, created_at DESC
      `;
      const documents = await window.api.queryDatabase(sql);
      return documents as unknown as QMDocument[];
    } catch (err) {
      logger.error('Failed to fetch QM documents', err);
      throw err;
    }
  }

  /**
   * Get documents in folder
   */
  async getDocumentsByFolder(folderId: string): Promise<QMDocument[]> {
    try {
      const sql = `
        SELECT * FROM qm_documents
        WHERE folder_id = ? AND is_current_version = 1
        ORDER BY created_at DESC
      `;
      const documents = await window.api.queryDatabase(sql, [folderId]);
      return documents as unknown as QMDocument[];
    } catch (err) {
      logger.error(`Failed to fetch QM documents for folder ${folderId}`, err);
      throw err;
    }
  }

  /**
   * Get document by ID (current version)
   */
  async getDocumentById(id: string): Promise<QMDocument | null> {
    try {
      const sql = 'SELECT * FROM qm_documents WHERE id = ? AND is_current_version = 1';
      const documents = await window.api.queryDatabase(sql, [id]);
      return documents.length > 0 ? (documents[0] as unknown as QMDocument) : null;
    } catch (err) {
      logger.error(`Failed to fetch QM document ${id}`, err);
      throw err;
    }
  }

  /**
   * Get document versions
   */
  async getDocumentVersions(documentId: string): Promise<QMDocumentVersion[]> {
    try {
      const sql = `
        SELECT 
          id as document_id, version_major, version_minor,
          created_at, created_by, status, approved_by, approved_at
        FROM qm_documents
        WHERE id = ?
        ORDER BY version_major DESC, version_minor DESC
      `;
      const versions = await window.api.queryDatabase(sql, [documentId]);
      return versions as unknown as QMDocumentVersion[];
    } catch (err) {
      logger.error(`Failed to fetch versions for document ${documentId}`, err);
      throw err;
    }
  }

  /**
   * Create document (new version)
   */
  async createDocument(input: CreateQMDocumentInput): Promise<QMDocument> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO qm_documents (
          id, folder_id, filename, file_path, file_size, mime_type,
          version_major, version_minor, is_current_version, status,
          approved_by, approved_at, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.folder_id,
        input.filename,
        input.file_path || null,
        input.file_size || null,
        input.mime_type || null,
        1, // version_major
        0, // version_minor
        true, // is_current_version
        'draft',
        null,
        null,
        now,
        now,
        input.created_by || 'system',
      ]);

      logger.info(`QM document created: ${id}`);

      const doc = await this.getDocumentById(id);
      if (!doc) throw new Error('QM document creation failed');

      return doc;
    } catch (err) {
      logger.error('Failed to create QM document', err);
      throw err;
    }
  }

  /**
   * Approve document
   */
  async approveDocument(id: string, approvedBy: string = 'admin'): Promise<QMDocument | null> {
    try {
      const sql = `
        UPDATE qm_documents
        SET status = 'approved', approved_by = ?, approved_at = ?, updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();
      await window.api.executeDatabase(sql, [approvedBy, now, now, id]);

      logger.info(`QM document approved: ${id}`);

      return this.getDocumentById(id);
    } catch (err) {
      logger.error(`Failed to approve QM document ${id}`, err);
      throw err;
    }
  }

  /**
   * Create new version (increment minor, set old as non-current)
   */
  async createNewVersion(documentId: string, input: CreateQMDocumentInput): Promise<QMDocument> {
    try {
      // Get current version
      const currentDoc = await this.getDocumentById(documentId);
      if (!currentDoc) throw new Error('Document not found');

      // Mark old version as non-current
      const updateOldSql =
        'UPDATE qm_documents SET is_current_version = 0 WHERE id = ? AND is_current_version = 1';
      await window.api.executeDatabase(updateOldSql, [documentId]);

      // Create new version
      const newId = uuidv4();
      const now = new Date().toISOString();

      const sql = `
        INSERT INTO qm_documents (
          id, folder_id, filename, file_path, file_size, mime_type,
          version_major, version_minor, is_current_version, status,
          approved_by, approved_at, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await window.api.executeDatabase(sql, [
        newId,
        input.folder_id,
        input.filename,
        input.file_path || null,
        input.file_size || null,
        input.mime_type || null,
        currentDoc.version_major,
        currentDoc.version_minor + 1, // Increment minor
        true,
        'draft',
        null,
        null,
        now,
        now,
        input.created_by || 'system',
      ]);

      logger.info(`QM document new version created: ${newId}`);

      const newDoc = await this.getDocumentById(newId);
      if (!newDoc) throw new Error('QM document version creation failed');

      return newDoc;
    } catch (err) {
      logger.error(`Failed to create new version for document ${documentId}`, err);
      throw err;
    }
  }

  /**
   * Delete document (soft delete)
   */
  async deleteDocument(id: string): Promise<void> {
    try {
      const sql = "UPDATE qm_documents SET status = 'archived', updated_at = ? WHERE id = ?";
      await window.api.executeDatabase(sql, [new Date().toISOString(), id]);
      logger.info(`QM document deleted: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete QM document ${id}`, err);
      throw err;
    }
  }
}

export const qmService = new QMService();
