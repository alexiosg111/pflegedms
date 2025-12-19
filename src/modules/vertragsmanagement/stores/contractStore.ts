/**
 * Contract state management store
 */

import { writable } from 'svelte/store';
import { contractService } from '../services/contractService';
import { logger } from '@core/utils/logger';
import type { Contract, CreateContractInput, UpdateContractInput, ContractStats } from '../types/contract';

interface ContractState {
  contracts: Contract[];
  stats: ContractStats | null;
  isLoading: boolean;
  error: string | null;
  selectedContractId: string | null;
}

function createContractStore() {
  const { subscribe, update } = writable<ContractState>({
    contracts: [],
    stats: null,
    isLoading: false,
    error: null,
    selectedContractId: null,
  });

  return {
    subscribe,

    // Load all contracts
    async loadContracts() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const contracts = await contractService.getAll();
        const stats = await contractService.getStats();
        update((state) => ({
          ...state,
          contracts,
          stats,
          isLoading: false,
        }));
        logger.info(`Loaded ${contracts.length} contracts`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load contracts', err);
      }
    },

    // Create contract
    async createContract(input: CreateContractInput): Promise<Contract | null> {
      try {
        const contract = await contractService.createContract(input);
        update((state) => ({
          ...state,
          contracts: [...state.contracts, contract],
        }));
        logger.info(`Contract created: ${contract.id}`);
        return contract;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create contract', err);
        return null;
      }
    },

    // Update contract
    async updateContract(id: string, input: UpdateContractInput): Promise<Contract | null> {
      try {
        const updated = await contractService.updateContract(id, input);
        update((state) => ({
          ...state,
          contracts: state.contracts.map((c) => (c.id === id ? updated : c)),
        }));
        logger.info(`Contract updated: ${id}`);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update contract', err);
        return null;
      }
    },

    // Delete contract
    async deleteContract(id: string): Promise<boolean> {
      try {
        await contractService.deleteContract(id);
        update((state) => ({
          ...state,
          contracts: state.contracts.filter((c) => c.id !== id),
        }));
        logger.info(`Contract deleted: ${id}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete contract', err);
        return false;
      }
    },

    // Select contract
    selectContract(id: string | null) {
      update((state) => ({
        ...state,
        selectedContractId: id,
      }));
    },

    // Check for expiring contracts
    async checkExpiringContracts() {
      try {
        const expiringContracts = await contractService.getExpiringContracts();
        logger.info(`Found ${expiringContracts.length} expiring contracts`);
        return expiringContracts;
      } catch (err) {
        logger.error('Failed to check expiring contracts', err);
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

export const contractStore = createContractStore();
