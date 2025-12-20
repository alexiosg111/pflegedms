/**
 * Contract CRUD service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type {
  Contract,
  CreateContractInput,
  UpdateContractInput,
  Supplier,
  CreateSupplierInput,
  ContractStats,
  ExpiringContract,
} from '../types/contract';

export class ContractService {
  /**
   * Get all contracts
   */
  async getAll(): Promise<Contract[]> {
    try {
      const sql = `
        SELECT * FROM contracts
        WHERE status != 'expired'
        ORDER BY end_date ASC
      `;
      const contracts = await window.api.queryDatabase(sql);
      logger.info(`Fetched ${contracts.length} contracts`);
      return contracts as Contract[];
    } catch (err) {
      logger.error('Failed to fetch contracts', err);
      throw err;
    }
  }

  /**
   * Get contract by ID
   */
  async getById(id: string): Promise<Contract | null> {
    try {
      const sql = 'SELECT * FROM contracts WHERE id = ?';
      const contracts = await window.api.queryDatabase(sql, [id]);
      return contracts.length > 0 ? (contracts[0] as Contract) : null;
    } catch (err) {
      logger.error(`Failed to fetch contract ${id}`, err);
      throw err;
    }
  }

  /**
   * Create contract
   */
  async createContract(input: CreateContractInput): Promise<Contract> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO contracts (
          id, partner_type, partner_id, partner_name, contract_name,
          description, start_date, end_date, renewal_date,
          cancellation_period_days, status, contract_document_id,
          reminder_days_before_expiry, reminder_sent, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.partner_type,
        input.partner_id,
        input.partner_name,
        input.contract_name,
        input.description || null,
        input.start_date,
        input.end_date,
        input.renewal_date || null,
        input.cancellation_period_days || null,
        'active',
        null,
        input.reminder_days_before_expiry || 30,
        false,
        now,
        now,
      ]);

      logger.info(`Contract created: ${id}`);

      const contract = await this.getById(id);
      if (!contract) throw new Error('Contract creation failed');

      return contract;
    } catch (err) {
      logger.error('Failed to create contract', err);
      throw err;
    }
  }

  /**
   * Update contract
   */
  async updateContract(id: string, input: UpdateContractInput): Promise<Contract> {
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

      const sql = `UPDATE contracts SET ${updates.join(', ')} WHERE id = ?`;
      await window.api.executeDatabase(sql, values);

      logger.info(`Contract updated: ${id}`);

      const contract = await this.getById(id);
      if (!contract) throw new Error('Contract update failed');

      return contract;
    } catch (err) {
      logger.error(`Failed to update contract ${id}`, err);
      throw err;
    }
  }

  /**
   * Delete contract (soft delete)
   */
  async deleteContract(id: string): Promise<void> {
    try {
      const sql = "UPDATE contracts SET status = 'inactive', updated_at = ? WHERE id = ?";
      await window.api.executeDatabase(sql, [new Date().toISOString(), id]);
      logger.info(`Contract deleted: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete contract ${id}`, err);
      throw err;
    }
  }

  /**
   * Get contracts expiring soon (within reminder_days_before_expiry)
   */
  async getExpiringContracts(): Promise<ExpiringContract[]> {
    try {
      const sql = `
        SELECT 
          id, contract_name, partner_name, end_date, reminder_sent,
          CAST((julianday(end_date) - julianday(CURRENT_DATE)) as INTEGER) as days_until_expiry
        FROM contracts
        WHERE status = 'active'
          AND julianday(end_date) - julianday(CURRENT_DATE) BETWEEN 0 AND reminder_days_before_expiry
        ORDER BY end_date ASC
      `;
      const contracts = await window.api.queryDatabase(sql);
      return contracts as ExpiringContract[];
    } catch (err) {
      logger.error('Failed to fetch expiring contracts', err);
      throw err;
    }
  }

  /**
   * Get contract stats
   */
  async getStats(): Promise<ContractStats> {
    try {
      const sql = `
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END), 0) as active,
          COALESCE(SUM(CASE WHEN 
            status = 'active' AND 
            julianday(end_date) - julianday(CURRENT_DATE) BETWEEN 0 AND reminder_days_before_expiry
          THEN 1 ELSE 0 END), 0) as expiring_soon,
          COALESCE(SUM(CASE WHEN status = 'expired' THEN 1 ELSE 0 END), 0) as expired
        FROM contracts
      `;
      const result = await window.api.queryDatabase(sql);
      return result[0] as ContractStats;
    } catch (err) {
      logger.error('Failed to fetch contract stats', err);
      throw err;
    }
  }

  /**
   * Mark reminder as sent
   */
  async markReminderSent(contractId: string): Promise<void> {
    try {
      const sql = 'UPDATE contracts SET reminder_sent = 1 WHERE id = ?';
      await window.api.executeDatabase(sql, [contractId]);
      logger.info(`Reminder marked as sent for contract ${contractId}`);
    } catch (err) {
      logger.error(`Failed to mark reminder as sent for contract ${contractId}`, err);
      throw err;
    }
  }

  /**
   * Get all suppliers
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const sql = `
        SELECT * FROM suppliers
        WHERE status = 'active'
        ORDER BY name ASC
      `;
      const suppliers = await window.api.queryDatabase(sql);
      return suppliers as Supplier[];
    } catch (err) {
      logger.error('Failed to fetch suppliers', err);
      throw err;
    }
  }

  /**
   * Create supplier
   */
  async createSupplier(input: CreateSupplierInput): Promise<Supplier> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO suppliers (
          id, name, contact_person, phone, email, website,
          address, postal_code, city, country,
          supplier_type, tax_id, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.name,
        input.contact_person || null,
        input.phone || null,
        input.email || null,
        input.website || null,
        input.address || null,
        input.postal_code || null,
        input.city || null,
        'DE',
        input.supplier_type || null,
        input.tax_id || null,
        'active',
        now,
        now,
      ]);

      logger.info(`Supplier created: ${id}`);

      const supplier = await this.getSupplierById(id);
      if (!supplier) throw new Error('Supplier creation failed');

      return supplier;
    } catch (err) {
      logger.error('Failed to create supplier', err);
      throw err;
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: string): Promise<Supplier | null> {
    try {
      const sql = 'SELECT * FROM suppliers WHERE id = ?';
      const suppliers = await window.api.queryDatabase(sql, [id]);
      return suppliers.length > 0 ? (suppliers[0] as Supplier) : null;
    } catch (err) {
      logger.error(`Failed to fetch supplier ${id}`, err);
      throw err;
    }
  }
}

export const contractService = new ContractService();
