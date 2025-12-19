/**
 * Mailbox CRUD service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type { MailboxItem, CreateMailboxItemInput, MailboxStats } from '../types/mailbox';

export class MailboxService {
  /**
   * Get all mailbox items (sorted by priority and date)
   */
  async getAll(): Promise<MailboxItem[]> {
    try {
      const sql = `
        SELECT * FROM mailbox_items
        WHERE status != 'rejected'
        ORDER BY 
          CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
          created_at DESC
      `;
      const items = await window.api.queryDatabase(sql);
      logger.info(`Fetched ${items.length} mailbox items`);
      return items as unknown as MailboxItem[];
    } catch (err) {
      logger.error('Failed to fetch mailbox items', err);
      throw err;
    }
  }

  /**
   * Get mailbox items by status
   */
  async getByStatus(status: string): Promise<MailboxItem[]> {
    try {
      const sql = `
        SELECT * FROM mailbox_items
        WHERE status = ?
        ORDER BY 
          CASE priority WHEN 'high' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END,
          created_at DESC
      `;
      const items = await window.api.queryDatabase(sql, [status]);
      return items as unknown as MailboxItem[];
    } catch (err) {
      logger.error(`Failed to fetch mailbox items for status ${status}`, err);
      throw err;
    }
  }

  /**
   * Get mailbox stats
   */
  async getStats(): Promise<MailboxStats> {
    try {
      const sql = `
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END), 0) as new,
          COALESCE(SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END), 0) as in_progress,
          COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completed
        FROM mailbox_items
        WHERE status != 'rejected'
      `;
      const result = await window.api.queryDatabase(sql);
      return result[0] as unknown as MailboxStats;
    } catch (err) {
      logger.error('Failed to fetch mailbox stats', err);
      throw err;
    }
  }

  /**
   * Create mailbox item from document
   */
  async createFromDocument(input: CreateMailboxItemInput): Promise<MailboxItem> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO mailbox_items (
          id, document_id, status, priority, item_type,
          assigned_to_patient_id, assigned_to_module,
          reminder_date, created_at, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.document_id,
        'new',
        input.priority || 'normal',
        input.item_type || 'document',
        null,
        null,
        null,
        now,
        input.notes || null,
      ]);

      logger.info(`Mailbox item created: ${id}`);

      const item = await this.getById(id);
      if (!item) throw new Error('Mailbox item creation failed');

      return item;
    } catch (err) {
      logger.error('Failed to create mailbox item', err);
      throw err;
    }
  }

  /**
   * Get mailbox item by ID
   */
  async getById(id: string): Promise<MailboxItem | null> {
    try {
      const sql = 'SELECT * FROM mailbox_items WHERE id = ?';
      const items = await window.api.queryDatabase(sql, [id]);
      return items.length > 0 ? (items[0] as unknown as MailboxItem) : null;
    } catch (err) {
      logger.error(`Failed to fetch mailbox item ${id}`, err);
      throw err;
    }
  }

  /**
   * Update mailbox item status
   */
  async updateStatus(id: string, status: string): Promise<MailboxItem | null> {
    try {
      const sql = `
        UPDATE mailbox_items 
        SET status = ?, 
            completed_at = CASE WHEN ? = 'completed' THEN ? ELSE NULL END,
            updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [status, status, now, now, id]);

      logger.info(`Mailbox item status updated: ${id} → ${status}`);

      return this.getById(id);
    } catch (err) {
      logger.error(`Failed to update mailbox item ${id}`, err);
      throw err;
    }
  }

  /**
   * Assign mailbox item to patient (route to patient module)
   */
  async assignToPatient(
    mailboxItemId: string,
    patientId: string,
    notes?: string
  ): Promise<MailboxItem | null> {
    try {
      const sql = `
        UPDATE mailbox_items 
        SET assigned_to_patient_id = ?, 
            assigned_to_module = 'patients',
            status = 'in_progress',
            notes = COALESCE(?, notes),
            updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [patientId, notes || null, now, mailboxItemId]);

      logger.info(`Mailbox item assigned to patient: ${mailboxItemId} → ${patientId}`);

      return this.getById(mailboxItemId);
    } catch (err) {
      logger.error(`Failed to assign mailbox item ${mailboxItemId}`, err);
      throw err;
    }
  }

  /**
   * Assign mailbox item to module (route to specific module)
   */
  async assignToModule(
    mailboxItemId: string,
    moduleName: string,
    targetId?: string,
    notes?: string
  ): Promise<MailboxItem | null> {
    try {
      const sql = `
        UPDATE mailbox_items 
        SET assigned_to_module = ?, 
            assigned_to_patient_id = ?,
            status = 'in_progress',
            notes = COALESCE(?, notes),
            updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        moduleName,
        targetId || null,
        notes || null,
        now,
        mailboxItemId,
      ]);

      logger.info(`Mailbox item assigned to module: ${mailboxItemId} → ${moduleName}`);

      return this.getById(mailboxItemId);
    } catch (err) {
      logger.error(`Failed to assign mailbox item ${mailboxItemId}`, err);
      throw err;
    }
  }

  /**
   * Complete mailbox item
   */
  async complete(id: string): Promise<MailboxItem | null> {
    return this.updateStatus(id, 'completed');
  }

  /**
   * Reject mailbox item
   */
  async reject(id: string, reason?: string): Promise<MailboxItem | null> {
    try {
      const sql = `
        UPDATE mailbox_items 
        SET status = 'rejected', 
            notes = COALESCE(?, notes),
            updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [reason || null, now, id]);

      logger.info(`Mailbox item rejected: ${id}`);

      return this.getById(id);
    } catch (err) {
      logger.error(`Failed to reject mailbox item ${id}`, err);
      throw err;
    }
  }

  /**
   * Delete mailbox item (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const sql = 'DELETE FROM mailbox_items WHERE id = ?';
      await window.api.executeDatabase(sql, [id]);
      logger.info(`Mailbox item deleted: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete mailbox item ${id}`, err);
      throw err;
    }
  }
}

export const mailboxService = new MailboxService();
