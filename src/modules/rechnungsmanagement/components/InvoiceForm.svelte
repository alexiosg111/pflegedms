<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { patientStore } from '@modules/patientenakte/stores/patientStore';
  import { contractService } from '@modules/vertragsmanagement/services/contractService';
  import { invoiceStore } from '../stores/invoiceStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import type { CreateInvoiceInput } from '../types/invoice';

  const dispatch = createEventDispatcher();

  let isSubmitting = false;
  let suppliers: any[] = [];
  let isLoadingSuppliers = false;

  let formData: CreateInvoiceInput = {
    invoice_type: 'incoming',
    invoice_number: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    partner_type: 'supplier',
    partner_id: '',
    partner_name: '',
    description: '',
    amount: 0,
    currency: 'EUR',
    payment_method: '',
    notes: '',
  };

  $: patients = $patientStore.patients;

  async function loadSuppliers() {
    if (isLoadingSuppliers) return;
    isLoadingSuppliers = true;
    try {
      suppliers = await contractService.getAllSuppliers();
    } finally {
      isLoadingSuppliers = false;
    }
  }

  async function handleSubmit() {
    if (!formData.invoice_number || !formData.invoice_date || !formData.due_date || !formData.partner_id) {
      toastStore.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (formData.amount <= 0) {
      toastStore.error('Der Betrag muss größer als 0 sein');
      return;
    }

    isSubmitting = true;

    try {
      const result = await invoiceStore.createInvoice(formData);
      if (result) {
        toastStore.success('Rechnung erstellt');
        dispatch('close');
      } else {
        toastStore.error('Fehler beim Erstellen der Rechnung');
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }

  function handleInvoiceTypeChange(type: string) {
    formData.invoice_type = type as any;
    formData.partner_type = type === 'incoming' ? 'supplier' : 'patient';
    formData.partner_id = '';
    formData.partner_name = '';
    if (type === 'incoming') {
      loadSuppliers();
    }
  }

  function handlePartnerSelect(id: string, name: string) {
    formData.partner_id = id;
    formData.partner_name = name;
  }

  function handleInvoiceDateChange() {
    const invoiceDate = new Date(formData.invoice_date);
    invoiceDate.setDate(invoiceDate.getDate() + 30);
    formData.due_date = invoiceDate.toISOString().split('T')[0];
  }
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Neue Rechnung</h2>
      <button on:click={handleClose} class="text-gray-500 hover:text-gray-700 text-2xl">
        ×
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
      <!-- Rechnungstyp Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Rechnungstyp *
        </label>
        <div class="flex gap-4">
          <button
            type="button"
            on:click={() => handleInvoiceTypeChange('incoming')}
            class={`flex-1 px-4 py-2 rounded-md border-2 transition-colors ${
              formData.invoice_type === 'incoming'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            📥 Eingangsrechnung
          </button>
          <button
            type="button"
            on:click={() => handleInvoiceTypeChange('outgoing')}
            class={`flex-1 px-4 py-2 rounded-md border-2 transition-colors ${
              formData.invoice_type === 'outgoing'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            📤 Ausgangsrechnung
          </button>
        </div>
      </div>

      <!-- Partner Selection -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Partner auswählen *
        </label>
        <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
          {#if formData.invoice_type === 'incoming'}
            {#if isLoadingSuppliers}
              <p class="text-sm text-gray-500 p-2">⏳ Laden...</p>
            {:else if suppliers.length === 0}
              <p class="text-sm text-gray-500 p-2">Keine Lieferanten vorhanden</p>
            {:else}
              {#each suppliers as supplier (supplier.id)}
                <button
                  type="button"
                  on:click={() => handlePartnerSelect(supplier.id, supplier.name)}
                  class={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    formData.partner_id === supplier.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {supplier.name}
                </button>
              {/each}
            {/if}
          {:else}
            {#if patients.length === 0}
              <p class="text-sm text-gray-500 p-2">Keine Patienten vorhanden</p>
            {:else}
              {#each patients as patient (patient.id)}
                <button
                  type="button"
                  on:click={() => handlePartnerSelect(patient.id, `${patient.first_name} ${patient.last_name}`)}
                  class={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    formData.partner_id === patient.id
                      ? 'bg-blue-100 text-blue-900 font-medium'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {patient.first_name} {patient.last_name}
                </button>
              {/each}
            {/if}
          {/if}
        </div>
      </div>

      <!-- Rechnungsnummer -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Rechnungsnummer *
        </label>
        <input
          type="text"
          bind:value={formData.invoice_number}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Betrag -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Betrag ({formData.currency}) *
        </label>
        <input
          type="number"
          bind:value={formData.amount}
          step="0.01"
          min="0"
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Datumfelder -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Rechnungsdatum *
          </label>
          <input
            type="date"
            bind:value={formData.invoice_date}
            on:change={handleInvoiceDateChange}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Fälligkeitsdatum *
          </label>
          <input
            type="date"
            bind:value={formData.due_date}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Beschreibung & Notizen -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Beschreibung
        </label>
        <textarea
          bind:value={formData.description}
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Zahlungsmethod -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Zahlungsweise
        </label>
        <input
          type="text"
          bind:value={formData.payment_method}
          placeholder="z.B. Überweisung"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" on:click={handleClose}>
          Abbrechen
        </Button>
        <Button variant="primary" type="submit" loading={isSubmitting}>
          Erstellen
        </Button>
      </div>
    </form>
  </div>
</div>
