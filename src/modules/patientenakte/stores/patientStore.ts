/**
 * Patient state management store
 */

import { writable, derived } from 'svelte/store';
import { patientService } from '../services/patientService';
import { logger } from '@core/utils/logger';
import type { Patient, CreatePatientInput, UpdatePatientInput } from '../types/patient';

interface PatientState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  selectedPatientId: string | null;
}

function createPatientStore() {
  const { subscribe, update } = writable<PatientState>({
    patients: [],
    isLoading: false,
    error: null,
    selectedPatientId: null,
  });

  return {
    subscribe,

    // Load all patients from database
    async loadPatients() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const patients = await patientService.getAll();
        update((state) => ({
          ...state,
          patients,
          isLoading: false,
        }));
        logger.info(`Loaded ${patients.length} patients`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load patients', err);
      }
    },

    // Create new patient
    async createPatient(input: CreatePatientInput): Promise<Patient | null> {
      try {
        const patient = await patientService.create(input);
        update((state) => ({
          ...state,
          patients: [...state.patients, patient],
        }));
        logger.info(`Patient created: ${patient.id}`);
        return patient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create patient', err);
        return null;
      }
    },

    // Update patient
    async updatePatient(id: string, input: UpdatePatientInput): Promise<Patient | null> {
      try {
        const updatedPatient = await patientService.update(id, input);
        update((state) => ({
          ...state,
          patients: state.patients.map((p) => (p.id === id ? updatedPatient : p)),
        }));
        logger.info(`Patient updated: ${id}`);
        return updatedPatient;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update patient', err);
        return null;
      }
    },

    // Delete patient
    async deletePatient(id: string): Promise<boolean> {
      try {
        await patientService.delete(id);
        update((state) => ({
          ...state,
          patients: state.patients.filter((p) => p.id !== id),
        }));
        logger.info(`Patient deleted: ${id}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete patient', err);
        return false;
      }
    },

    // Select patient
    selectPatient(id: string | null) {
      update((state) => ({
        ...state,
        selectedPatientId: id,
      }));
    },

    // Search patients
    async searchPatients(query: string): Promise<Patient[]> {
      try {
        return await patientService.search(query);
      } catch (err) {
        logger.error('Failed to search patients', err);
        return [];
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

export const patientStore = createPatientStore();

// Derived store for selected patient
export const selectedPatient = derived(patientStore, ($patientStore) => {
  if (!$patientStore.selectedPatientId) return null;
  return (
    $patientStore.patients.find((p) => p.id === $patientStore.selectedPatientId) || null
  );
});
