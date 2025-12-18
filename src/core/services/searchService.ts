/**
 * Full-text search service using SQLite FTS5
 */

import { logger } from './logger';

export interface SearchResult {
  id: string;
  title: string;
  type: 'patient' | 'document' | 'contract' | 'invoice' | 'qm_folder' | 'qm_document';
  content_preview: string;
  created_at: string;
  relevance: number;
}

export class SearchService {
  /**
   * Search across all modules using FTS5
   */
  async search(query: string, limit: number = 20): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      // Escape FTS5 special characters
      const escapedQuery = this.escapeFTS5Query(query);

      // Search in documents
      const documentResults = await this.searchDocuments(escapedQuery, limit);

      // Search in patients
      const patientResults = await this.searchPatients(escapedQuery, limit);

      // Search in contracts
      const contractResults = await this.searchContracts(escapedQuery, limit);

      // Search in invoices
      const invoiceResults = await this.searchInvoices(escapedQuery, limit);

      // Search in QM
      const qmResults = await this.searchQM(escapedQuery, limit);

      // Combine and sort by relevance
      const combined = [
        ...documentResults,
        ...patientResults,
        ...contractResults,
        ...invoiceResults,
        ...qmResults,
      ].sort((a, b) => b.relevance - a.relevance);

      return combined.slice(0, limit);
    } catch (err) {
      logger.error('Search failed', err);
      return [];
    }
  }

  /**
   * Search in documents (patient documents + QM documents)
   */
  private async searchDocuments(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const sql = `
        SELECT
          d.id,
          d.filename as title,
          'document' as type,
          substr(d.ocr_text, 1, 100) as content_preview,
          d.created_at,
          CASE 
            WHEN d.filename LIKE '%' || ? || '%' THEN 50
            ELSE 10
          END as relevance
        FROM documents d
        WHERE d.filename LIKE '%' || ? || '%'
          OR d.ocr_text LIKE '%' || ? || '%'
        LIMIT ?
      `;

      const results = await window.api.queryDatabase(sql, [query, query, query, limit]);
      return (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        content_preview: r.content_preview || 'Dokument',
        created_at: r.created_at,
        relevance: r.relevance,
      }));
    } catch (err) {
      logger.error('Document search failed', err);
      return [];
    }
  }

  /**
   * Search in patients
   */
  private async searchPatients(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const sql = `
        SELECT
          p.id,
          (p.first_name || ' ' || p.last_name) as title,
          'patient' as type,
          (p.address || ', ' || p.postal_code) as content_preview,
          p.created_at,
          CASE
            WHEN p.first_name LIKE '%' || ? || '%' THEN 60
            WHEN p.last_name LIKE '%' || ? || '%' THEN 60
            WHEN p.phone LIKE '%' || ? || '%' THEN 30
            WHEN p.email LIKE '%' || ? || '%' THEN 30
            ELSE 10
          END as relevance
        FROM patients p
        WHERE p.first_name LIKE '%' || ? || '%'
          OR p.last_name LIKE '%' || ? || '%'
          OR p.phone LIKE '%' || ? || '%'
          OR p.email LIKE '%' || ? || '%'
        LIMIT ?
      `;

      const results = await window.api.queryDatabase(sql, [
        query, query, query, query,
        query, query, query, query,
        limit,
      ]);
      return (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        content_preview: r.content_preview || 'Patient',
        created_at: r.created_at,
        relevance: r.relevance,
      }));
    } catch (err) {
      logger.error('Patient search failed', err);
      return [];
    }
  }

  /**
   * Search in contracts
   */
  private async searchContracts(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const sql = `
        SELECT
          c.id,
          c.contract_name as title,
          'contract' as type,
          c.partner_name as content_preview,
          c.created_at,
          CASE
            WHEN c.contract_name LIKE '%' || ? || '%' THEN 50
            WHEN c.partner_name LIKE '%' || ? || '%' THEN 50
            WHEN c.description LIKE '%' || ? || '%' THEN 20
            ELSE 10
          END as relevance
        FROM contracts c
        WHERE c.contract_name LIKE '%' || ? || '%'
          OR c.partner_name LIKE '%' || ? || '%'
          OR c.description LIKE '%' || ? || '%'
        LIMIT ?
      `;

      const results = await window.api.queryDatabase(sql, [
        query, query, query,
        query, query, query,
        limit,
      ]);
      return (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        content_preview: r.content_preview || 'Vertrag',
        created_at: r.created_at,
        relevance: r.relevance,
      }));
    } catch (err) {
      logger.error('Contract search failed', err);
      return [];
    }
  }

  /**
   * Search in invoices
   */
  private async searchInvoices(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const sql = `
        SELECT
          i.id,
          i.invoice_number as title,
          'invoice' as type,
          i.partner_name as content_preview,
          i.created_at,
          CASE
            WHEN i.invoice_number LIKE '%' || ? || '%' THEN 50
            WHEN i.partner_name LIKE '%' || ? || '%' THEN 50
            WHEN i.description LIKE '%' || ? || '%' THEN 20
            ELSE 10
          END as relevance
        FROM invoices i
        WHERE i.invoice_number LIKE '%' || ? || '%'
          OR i.partner_name LIKE '%' || ? || '%'
          OR i.description LIKE '%' || ? || '%'
        LIMIT ?
      `;

      const results = await window.api.queryDatabase(sql, [
        query, query, query,
        query, query, query,
        limit,
      ]);
      return (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        content_preview: r.content_preview || 'Rechnung',
        created_at: r.created_at,
        relevance: r.relevance,
      }));
    } catch (err) {
      logger.error('Invoice search failed', err);
      return [];
    }
  }

  /**
   * Search in QM (folders + documents)
   */
  private async searchQM(query: string, limit: number): Promise<SearchResult[]> {
    try {
      const sql = `
        SELECT
          qf.id,
          qf.name as title,
          'qm_folder' as type,
          qf.description as content_preview,
          qf.created_at,
          CASE
            WHEN qf.name LIKE '%' || ? || '%' THEN 50
            WHEN qf.description LIKE '%' || ? || '%' THEN 20
            ELSE 10
          END as relevance
        FROM qm_folders qf
        WHERE qf.name LIKE '%' || ? || '%'
          OR qf.description LIKE '%' || ? || '%'
        LIMIT ?
      `;

      const results = await window.api.queryDatabase(sql, [
        query, query,
        query, query,
        limit,
      ]);
      return (results || []).map((r: any) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        content_preview: r.content_preview || 'QM-Ordner',
        created_at: r.created_at,
        relevance: r.relevance,
      }));
    } catch (err) {
      logger.error('QM search failed', err);
      return [];
    }
  }

  /**
   * Escape FTS5 special characters
   */
  private escapeFTS5Query(query: string): string {
    return query.replace(/["()]/g, '').trim();
  }
}

export const searchService = new SearchService();
