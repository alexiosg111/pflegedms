/**
 * Mailbox state management store
 */

import { writable, derived } from 'svelte/store';
import { mailboxService } from '../services/mailboxService';
import { logger } from '@core/utils/logger';
import type { MailboxItem, MailboxStats } from '../types/mailbox';

interface MailboxState {
  items: MailboxItem[];
  stats: MailboxStats | null;
  isLoading: boolean;
  error: string | null;
  selectedItemId: string | null;
  filterStatus: string;
}

function createMailboxStore() {
  const { subscribe, update } = writable<MailboxState>({
    items: [],
    stats: null,
    isLoading: false,
    error: null,
    selectedItemId: null,
    filterStatus: 'new',
  });

  return {
    subscribe,

    // Load all mailbox items
    async loadItems() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const items = await mailboxService.getAll();
        const stats = await mailboxService.getStats();
        update((state) => ({
          ...state,
          items,
          stats,
          isLoading: false,
        }));
        logger.info(`Loaded ${items.length} mailbox items`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load mailbox items', err);
      }
    },

    // Load items by status
    async loadByStatus(status: string) {
      update((state) => ({ ...state, isLoading: true, error: null, filterStatus: status }));
      try {
        const items = await mailboxService.getByStatus(status);
        const stats = await mailboxService.getStats();
        update((state) => ({
          ...state,
          items,
          stats,
          isLoading: false,
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load mailbox items by status', err);
      }
    },

    // Select item
    selectItem(id: string | null) {
      update((state) => ({
        ...state,
        selectedItemId: id,
      }));
    },

    // Update item status
    async updateStatus(id: string, status: string) {
      try {
        const updated = await mailboxService.updateStatus(id, status);
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((item) => (item.id === id ? updated : item)),
          }));
          logger.info(`Item ${id} status updated to ${status}`);
          return updated;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update item status', err);
      }
      return null;
    },

    // Assign to patient
    async assignToPatient(mailboxItemId: string, patientId: string, notes?: string) {
      try {
        const updated = await mailboxService.assignToPatient(mailboxItemId, patientId, notes);
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((item) => (item.id === mailboxItemId ? updated : item)),
          }));
          logger.info(`Item assigned to patient ${patientId}`);
          return updated;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to assign item to patient', err);
      }
      return null;
    },

    // Assign to module
    async assignToModule(
      mailboxItemId: string,
      moduleName: string,
      targetId?: string,
      notes?: string
    ) {
      try {
        const updated = await mailboxService.assignToModule(
          mailboxItemId,
          moduleName,
          targetId,
          notes
        );
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.map((item) => (item.id === mailboxItemId ? updated : item)),
          }));
          logger.info(`Item assigned to module ${moduleName}`);
          return updated;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to assign item to module', err);
      }
      return null;
    },

    // Complete item
    async completeItem(id: string) {
      return this.updateStatus(id, 'completed');
    },

    // Reject item
    async rejectItem(id: string, reason?: string) {
      try {
        const updated = await mailboxService.reject(id, reason);
        if (updated) {
          update((state) => ({
            ...state,
            items: state.items.filter((item) => item.id !== id),
          }));
          logger.info(`Item ${id} rejected`);
          return true;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to reject item', err);
      }
      return false;
    },

    // Delete item
    async deleteItem(id: string) {
      try {
        await mailboxService.delete(id);
        update((state) => ({
          ...state,
          items: state.items.filter((item) => item.id !== id),
        }));
        logger.info(`Item ${id} deleted`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete item', err);
      }
      return false;
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

export const mailboxStore = createMailboxStore();

// Derived stores
export const selectedMailboxItem = derived(mailboxStore, ($mailboxStore) => {
  if (!$mailboxStore.selectedItemId) return null;
  return $mailboxStore.items.find((item) => item.id === $mailboxStore.selectedItemId) || null;
});
