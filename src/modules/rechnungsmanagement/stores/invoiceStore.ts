/**
 * Invoice state management store
 */

import { writable } from 'svelte/store';
import { invoiceService } from '../services/invoiceService';
import { logger } from '@core/utils/logger';
import type {
  Invoice,
  CreateInvoiceInput,
  UpdateInvoiceInput,
  InvoiceStats,
  InvoicesByStatus,
} from '../types/invoice';

interface InvoiceState {
  invoices: Invoice[];
  invoicesByStatus: InvoicesByStatus | null;
  stats: InvoiceStats | null;
  isLoading: boolean;
  error: string | null;
  selectedInvoiceId: string | null;
}

function createInvoiceStore() {
  const { subscribe, update } = writable<InvoiceState>({
    invoices: [],
    invoicesByStatus: null,
    stats: null,
    isLoading: false,
    error: null,
    selectedInvoiceId: null,
  });

  return {
    subscribe,

    // Load all invoices
    async loadInvoices() {
      update((state) => ({ ...state, isLoading: true, error: null }));
      try {
        const invoices = await invoiceService.getAll();
        const invoicesByStatus = await invoiceService.getByStatusGrouped();
        const stats = await invoiceService.getStats();
        update((state) => ({
          ...state,
          invoices,
          invoicesByStatus,
          stats,
          isLoading: false,
        }));
        logger.info(`Loaded ${invoices.length} invoices`);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          isLoading: false,
          error: message,
        }));
        logger.error('Failed to load invoices', err);
      }
    },

    // Create invoice
    async createInvoice(input: CreateInvoiceInput): Promise<Invoice | null> {
      try {
        const invoice = await invoiceService.createInvoice(input);
        update((state) => ({
          ...state,
          invoices: [...state.invoices, invoice],
        }));
        // Reload grouped data
        await this.loadInvoices();
        logger.info(`Invoice created: ${invoice.id}`);
        return invoice;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to create invoice', err);
        return null;
      }
    },

    // Update invoice
    async updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice | null> {
      try {
        const updated = await invoiceService.updateInvoice(id, input);
        update((state) => ({
          ...state,
          invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
        }));
        // Reload grouped data
        await this.loadInvoices();
        logger.info(`Invoice updated: ${id}`);
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update invoice', err);
        return null;
      }
    },

    // Update invoice status
    async updateStatus(id: string, status: string): Promise<Invoice | null> {
      try {
        const updated = await invoiceService.updateStatus(id, status);
        if (updated) {
          update((state) => ({
            ...state,
            invoices: state.invoices.map((inv) => (inv.id === id ? updated : inv)),
          }));
          // Reload grouped data
          await this.loadInvoices();
          logger.info(`Invoice ${id} status updated to ${status}`);
          return updated;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to update invoice status', err);
      }
      return null;
    },

    // Delete invoice
    async deleteInvoice(id: string): Promise<boolean> {
      try {
        await invoiceService.deleteInvoice(id);
        update((state) => ({
          ...state,
          invoices: state.invoices.filter((inv) => inv.id !== id),
        }));
        await this.loadInvoices();
        logger.info(`Invoice deleted: ${id}`);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        update((state) => ({
          ...state,
          error: message,
        }));
        logger.error('Failed to delete invoice', err);
        return false;
      }
    },

    // Select invoice
    selectInvoice(id: string | null) {
      update((state) => ({
        ...state,
        selectedInvoiceId: id,
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

export const invoiceStore = createInvoiceStore();
