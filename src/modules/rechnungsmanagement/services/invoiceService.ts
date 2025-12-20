/**
 * Invoice CRUD service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStats,
  InvoicesByStatus,
  OCRExtractedData,
} from '../types/invoice';

export class InvoiceService {
  /**
   * Get all invoices
   */
  async getAll(): Promise<Invoice[]> {
    try {
      const sql = `
        SELECT * FROM invoices
        ORDER BY invoice_date DESC
      `;
      const invoices = await window.api.queryDatabase(sql);
      logger.info(`Fetched ${invoices.length} invoices`);
      return invoices as Invoice[];
    } catch (err) {
      logger.error('Failed to fetch invoices', err);
      throw err;
    }
  }

  /**
   * Get invoices by status
   */
  async getByStatus(status: string): Promise<Invoice[]> {
    try {
      const sql = `
        SELECT * FROM invoices
        WHERE status = ?
        ORDER BY CASE 
          WHEN status = 'open' THEN due_date ASC
          ELSE invoice_date DESC
        END
      `;
      const invoices = await window.api.queryDatabase(sql, [status]);
      return invoices as Invoice[];
    } catch (err) {
      logger.error(`Failed to fetch invoices for status ${status}`, err);
      throw err;
    }
  }

  /**
   * Get invoices organized by status
   */
  async getByStatusGrouped(): Promise<InvoicesByStatus> {
    try {
      const [open, paid, overdue] = await Promise.all([
        this.getByStatus('open'),
        this.getByStatus('paid'),
        this.getByStatus('overdue'),
      ]);
      return { open, paid, overdue };
    } catch (err) {
      logger.error('Failed to fetch invoices grouped by status', err);
      throw err;
    }
  }

  /**
   * Get invoice by ID
   */
  async getById(id: string): Promise<Invoice | null> {
    try {
      const sql = 'SELECT * FROM invoices WHERE id = ?';
      const invoices = await window.api.queryDatabase(sql, [id]);
      return invoices.length > 0 ? (invoices[0] as Invoice) : null;
    } catch (err) {
      logger.error(`Failed to fetch invoice ${id}`, err);
      throw err;
    }
  }

  /**
   * Create invoice
   */
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const id = uuidv4();

    try {
      // Determine status based on due_date
      const dueDate = new Date(input.due_date);
      const today = new Date();
      let status = 'open';
      if (dueDate < today) {
        status = 'overdue';
      }

      const sql = `
        INSERT INTO invoices (
          id, invoice_type, invoice_number, invoice_date, due_date,
          partner_type, partner_id, partner_name, description,
          amount, currency, document_id, status, paid_date,
          payment_method, notes, reminder_sent, reminder_sent_at,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.invoice_type,
        input.invoice_number,
        input.invoice_date,
        input.due_date,
        input.partner_type,
        input.partner_id,
        input.partner_name,
        input.description || null,
        input.amount,
        input.currency || 'EUR',
        null, // document_id
        status,
        null,
        input.payment_method || null,
        input.notes || null,
        false,
        null,
        now,
        now,
      ]);

      logger.info(`Invoice created: ${id}`);

      const invoice = await this.getById(id);
      if (!invoice) throw new Error('Invoice creation failed');

      return invoice;
    } catch (err) {
      logger.error('Failed to create invoice', err);
      throw err;
    }
  }

  /**
   * Update invoice
   */
  async updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
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

      const sql = `UPDATE invoices SET ${updates.join(', ')} WHERE id = ?`;
      await window.api.executeDatabase(sql, values);

      logger.info(`Invoice updated: ${id}`);

      const invoice = await this.getById(id);
      if (!invoice) throw new Error('Invoice update failed');

      return invoice;
    } catch (err) {
      logger.error(`Failed to update invoice ${id}`, err);
      throw err;
    }
  }

  /**
   * Delete invoice (soft delete)
   */
  async deleteInvoice(id: string): Promise<void> {
    try {
      const sql = 'DELETE FROM invoices WHERE id = ?';
      await window.api.executeDatabase(sql, [id]);
      logger.info(`Invoice deleted: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete invoice ${id}`, err);
      throw err;
    }
  }

  /**
   * Update invoice status
   */
  async updateStatus(id: string, status: string, paidDate?: string): Promise<Invoice | null> {
    try {
      const sql = `
        UPDATE invoices 
        SET status = ?, 
            paid_date = CASE WHEN ? = 'paid' THEN ? ELSE NULL END,
            updated_at = ?
        WHERE id = ?
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        status,
        status,
        paidDate || now,
        now,
        id,
      ]);

      logger.info(`Invoice ${id} status updated to ${status}`);

      return this.getById(id);
    } catch (err) {
      logger.error(`Failed to update invoice status ${id}`, err);
      throw err;
    }
  }

  /**
   * Get invoice statistics
   */
  async getStats(): Promise<InvoiceStats> {
    try {
      const sql = `
        SELECT
          COUNT(CASE WHEN status = 'open' THEN 1 END) as total_open,
          COUNT(CASE WHEN status = 'paid' THEN 1 END) as total_paid,
          COUNT(CASE WHEN status = 'overdue' THEN 1 END) as total_overdue,
          COALESCE(SUM(CASE WHEN status = 'open' THEN amount ELSE 0 END), 0) as sum_open,
          COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as sum_paid,
          COALESCE(SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END), 0) as sum_overdue
        FROM invoices
      `;
      const result = await window.api.queryDatabase(sql);
      return result[0] as InvoiceStats;
    } catch (err) {
      logger.error('Failed to fetch invoice stats', err);
      throw err;
    }
  }

  /**
   * Extract amount from OCR text using regex
   */
  extractAmountFromOCR(ocrText: string): OCRExtractedData {
    const result: OCRExtractedData = {
      amount: null,
      invoiceNumber: null,
      invoiceDate: null,
      confidence: 0,
    };

    if (!ocrText) return result;

    // Try to find amount (Euro/EUR format)
    const amountRegex = /(?:€|EUR)?\s*(\d+[.,]\d{2})/i;
    const amountMatch = ocrText.match(amountRegex);
    if (amountMatch) {
      const amountStr = amountMatch[1].replace(',', '.');
      result.amount = parseFloat(amountStr);
      result.confidence += 30;
    }

    // Try to find invoice number
    const invoiceRegex = /(?:Rechnungsnummer|Rechnung|Invoice\s+#|Rg\.?)\s*:?\s*([A-Z0-9\-\/]{4,20})/i;
    const invoiceMatch = ocrText.match(invoiceRegex);
    if (invoiceMatch) {
      result.invoiceNumber = invoiceMatch[1];
      result.confidence += 20;
    }

    // Try to find date (German format DD.MM.YYYY or ISO YYYY-MM-DD)
    const dateRegex = /(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})/;
    const dateMatch = ocrText.match(dateRegex);
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      result.invoiceDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      result.confidence += 25;
    }

    // Normalize confidence to 0-100
    result.confidence = Math.min(result.confidence, 100);

    logger.info(`OCR extraction: amount=${result.amount}, confidence=${result.confidence}%`);

    return result;
  }
}

export const invoiceService = new InvoiceService();
