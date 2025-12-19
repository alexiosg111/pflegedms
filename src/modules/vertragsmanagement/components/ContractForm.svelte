<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { patientStore } from '@modules/patientenakte/stores/patientStore';
  import { contractStore } from '../stores/contractStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import { contractService } from '../services/contractService';
  import type { CreateContractInput } from '../types/contract';

  const dispatch = createEventDispatcher();

  let isSubmitting = false;
  let suppliers: any[] = [];
  let isLoadingSuppliers = false;

  let formData: CreateContractInput = {
    partner_type: 'patient',
    partner_id: '',
    partner_name: '',
    contract_name: '',
    description: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    renewal_date: '',
    cancellation_period_days: 30,
    reminder_days_before_expiry: 30,
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
    if (!formData.contract_name || !formData.start_date || !formData.end_date) {
      toastStore.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    if (!formData.partner_id) {
      toastStore.error('Bitte wählen Sie einen Partner');
      return;
    }

    isSubmitting = true;

    try {
      const result = await contractStore.createContract(formData);
      if (result) {
        toastStore.success('Vertrag erstellt');
        dispatch('close');
      } else {
        toastStore.error('Fehler beim Erstellen des Vertrags');
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }

  function handlePartnerTypeChange(type: string) {
    formData.partner_type = type as any;
    formData.partner_id = '';
    formData.partner_name = '';
    if (type === 'supplier') {
      loadSuppliers();
    }
  }

  function handlePartnerSelect(id: string, name: string) {
    formData.partner_id = id;
    formData.partner_name = name;
  }
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Neuer Vertrag</h2>
      <button
        on:click={handleClose}
        class="text-gray-500 hover:text-gray-700 text-2xl"
      >
        ×
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
      <!-- Partner Type Selection -->
      <div>
        <span class="block text-sm font-medium text-gray-900 mb-2">
          Vertragspartner Typ *
        </span>
        <div class="flex gap-4">
          <button
            type="button"
            on:click={() => handlePartnerTypeChange('patient')}
            class={`flex-1 px-4 py-2 rounded-md border-2 transition-colors ${
              formData.partner_type === 'patient'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            👤 Patient
          </button>
          <button
            type="button"
            on:click={() => handlePartnerTypeChange('supplier')}
            class={`flex-1 px-4 py-2 rounded-md border-2 transition-colors ${
              formData.partner_type === 'supplier'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            🏢 Lieferant
          </button>
        </div>
      </div>

      <!-- Partner Selection -->
      <div>
        <span class="block text-sm font-medium text-gray-900 mb-2">
          Partner auswählen *
        </span>
        <div class="space-y-1 max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
          {#if formData.partner_type === 'patient'}
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
          {:else}
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
          {/if}
        </div>
      </div>

      <!-- Vertrag Name -->
      <div>
        <label for="contract-name" class="block text-sm font-medium text-gray-900 mb-1">
          Vertrag Name *
        </label>
        <input
          id="contract-name"
          type="text"
          bind:value={formData.contract_name}
          required
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Beschreibung -->
      <div>
        <label for="contract-description" class="block text-sm font-medium text-gray-900 mb-1">
          Beschreibung
        </label>
        <textarea
          id="contract-description"
          bind:value={formData.description}
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Datum Grid -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="contract-start-date" class="block text-sm font-medium text-gray-900 mb-1">
            Start Datum *
          </label>
          <input
            id="contract-start-date"
            type="date"
            bind:value={formData.start_date}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="contract-end-date" class="block text-sm font-medium text-gray-900 mb-1">
            End Datum *
          </label>
          <input
            id="contract-end-date"
            type="date"
            bind:value={formData.end_date}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Optionale Felder -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="contract-cancellation-period" class="block text-sm font-medium text-gray-900 mb-1">
            Kündigungsfrist (Tage)
          </label>
          <input
            id="contract-cancellation-period"
            type="number"
            bind:value={formData.cancellation_period_days}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label for="contract-reminder-days" class="block text-sm font-medium text-gray-900 mb-1">
            Erinnerung vor (Tage)
          </label>
          <input
            id="contract-reminder-days"
            type="number"
            bind:value={formData.reminder_days_before_expiry}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" on:click={handleClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          type="submit"
          loading={isSubmitting}
        >
          Erstellen
        </Button>
      </div>
    </form>
  </div>
</div>
