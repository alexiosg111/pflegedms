/**
 * Patient CRUD service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '@core/utils/logger';
import type { Patient, CreatePatientInput, UpdatePatientInput } from '../types/patient';

export class PatientService {
  /**
   * Get all patients
   */
  async getAll(): Promise<Patient[]> {
    try {
      const sql = `
        SELECT * FROM patients
        WHERE status != 'archived'
        ORDER BY last_name, first_name
      `;
      const patients = await window.api.queryDatabase(sql);
      logger.info(`Fetched ${patients.length} patients`);
      return patients as Patient[];
    } catch (err) {
      logger.error('Failed to fetch patients', err);
      throw err;
    }
  }

  /**
   * Get patient by ID
   */
  async getById(id: string): Promise<Patient | null> {
    try {
      const sql = 'SELECT * FROM patients WHERE id = ?';
      const patient = await window.api.queryDatabase(sql, [id]);
      return patient.length > 0 ? (patient[0] as Patient) : null;
    } catch (err) {
      logger.error(`Failed to fetch patient ${id}`, err);
      throw err;
    }
  }

  /**
   * Create new patient
   */
  async create(input: CreatePatientInput): Promise<Patient> {
    const id = uuidv4();

    try {
      const sql = `
        INSERT INTO patients (
          id, first_name, last_name, date_of_birth, gender,
          phone, email, address, postal_code, city, country,
          insurance_company, insurance_number, primary_doctor,
          status, date_registered, notes, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const now = new Date().toISOString();

      await window.api.executeDatabase(sql, [
        id,
        input.first_name,
        input.last_name,
        input.date_of_birth || null,
        input.gender || null,
        input.phone || null,
        input.email || null,
        input.address || null,
        input.postal_code || null,
        input.city || null,
        'DE',
        input.insurance_company || null,
        input.insurance_number || null,
        input.primary_doctor || null,
        'active',
        now,
        input.notes || null,
        now,
        now,
      ]);

      logger.info(`Patient created: ${id}`);

      const patient = await this.getById(id);
      if (!patient) throw new Error('Patient creation failed');

      return patient;
    } catch (err) {
      logger.error('Failed to create patient', err);
      throw err;
    }
  }

  /**
   * Update patient
   */
  async update(id: string, input: UpdatePatientInput): Promise<Patient> {
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

      const sql = `UPDATE patients SET ${updates.join(', ')} WHERE id = ?`;
      await window.api.executeDatabase(sql, values);

      logger.info(`Patient updated: ${id}`);

      const patient = await this.getById(id);
      if (!patient) throw new Error('Patient update failed');

      return patient;
    } catch (err) {
      logger.error(`Failed to update patient ${id}`, err);
      throw err;
    }
  }

  /**
   * Delete patient (soft delete)
   */
  async delete(id: string): Promise<void> {
    try {
      const sql = "UPDATE patients SET status = 'archived', updated_at = ? WHERE id = ?";
      await window.api.executeDatabase(sql, [new Date().toISOString(), id]);
      logger.info(`Patient archived: ${id}`);
    } catch (err) {
      logger.error(`Failed to delete patient ${id}`, err);
      throw err;
    }
  }

  /**
   * Search patients by name
   */
  async search(query: string): Promise<Patient[]> {
    try {
      const sql = `
        SELECT * FROM patients
        WHERE (first_name LIKE ? OR last_name LIKE ?)
        AND status != 'archived'
        ORDER BY last_name, first_name
        LIMIT 50
      `;
      const searchTerm = `%${query}%`;
      const patients = await window.api.queryDatabase(sql, [searchTerm, searchTerm]);
      logger.info(`Found ${patients.length} patients matching "${query}"`);
      return patients as Patient[];
    } catch (err) {
      logger.error(`Failed to search patients for "${query}"`, err);
      throw err;
    }
  }
}

export const patientService = new PatientService();
