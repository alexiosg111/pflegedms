<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@core/components/Button.svelte';
  import { patientStore } from '@modules/patientenakte/stores/patientStore';
  import type { MailboxItem } from '../types/mailbox';

  // unused-export-let: item is required by interface but used implicitly/future
  export const item: MailboxItem = {} as MailboxItem;

  const dispatch = createEventDispatcher();

  let assignmentType: 'patient' | 'module' = 'patient';
  let selectedPatientId: string | null = null;
  let selectedModule: string = 'patients';
  let notes: string = '';
  let isSubmitting: boolean = false;

  $: patients = $patientStore.patients;

  const modules = [
    { id: 'patients', label: 'Patientenakte', icon: '👤' },
    { id: 'contracts', label: 'Verträge', icon: '📜' },
    { id: 'invoices', label: 'Rechnungen', icon: '💰' },
    { id: 'qm', label: 'Qualitätsmanagement', icon: '✅' },
    { id: 'archive', label: 'Archivieren', icon: '📦' },
  ];

  async function handleAssign() {
    if (assignmentType === 'patient' && !selectedPatientId) {
      alert('Bitte wählen Sie einen Patienten');
      return;
    }

    isSubmitting = true;

    try {
      if (assignmentType === 'patient') {
        dispatch('assign', { type: 'patient', patientId: selectedPatientId, notes });
      } else {
        dispatch('assign', { type: 'module', module: selectedModule, notes });
      }
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-lg">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Dokument zuordnen</h2>
      <button
        on:click={handleClose}
        class="text-gray-500 hover:text-gray-700 text-2xl"
      >
        ×
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- Assignment Type Tabs -->
      <div class="flex space-x-4 border-b border-gray-200">
        <button
          on:click={() => (assignmentType = 'patient')}
          class={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            assignmentType === 'patient'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          👤 Patient
        </button>
        <button
          on:click={() => (assignmentType = 'module')}
          class={`pb-3 px-4 font-medium text-sm border-b-2 transition-colors ${
            assignmentType === 'module'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Modul
        </button>
      </div>

      <!-- Patient Selection -->
      {#if assignmentType === 'patient'}
        <div>
          <label for="patient-select" class="block text-sm font-medium text-gray-900 mb-2">
            Patient wählen *
          </label>
          <select
            id="patient-select"
            bind:value={selectedPatientId}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={null}>-- Bitte wählen --</option>
            {#each patients as patient (patient.id)}
              <option value={patient.id}>
                {patient.first_name} {patient.last_name}
              </option>
            {/each}
          </select>
          {#if patients.length === 0}
            <p class="text-sm text-yellow-600 mt-2">
              ⚠️ Keine Patienten vorhanden. Erstellen Sie zuerst einen Patienten.
            </p>
          {/if}
        </div>
      {/if}

      <!-- Module Selection -->
      {#if assignmentType === 'module'}
        <div>
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="block text-sm font-medium text-gray-900 mb-3">
            Ziel-Modul wählen *
          </label>
          <div class="space-y-2">
            {#each modules as mod (mod.id)}
              <button
                on:click={() => (selectedModule = mod.id)}
                class={`w-full flex items-center space-x-3 px-4 py-3 rounded-md border-2 transition-colors ${
                  selectedModule === mod.id
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <span class="text-2xl">{mod.icon}</span>
                <div class="text-left">
                  <p class="font-medium text-gray-900">{mod.label}</p>
                  <p class="text-xs text-gray-500">
                    {mod.id === 'patients'
                      ? 'Der Patientenakte hinzufügen'
                      : mod.id === 'contracts'
                        ? 'Als Vertragsanhang'
                        : mod.id === 'invoices'
                          ? 'Als Rechnung verarbeiten'
                          : mod.id === 'qm'
                            ? 'Zu QM-Dokumenten hinzufügen'
                            : 'In Archiv verschieben'}
                  </p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Notes -->
      <div>
        <label for="assignment-notes" class="block text-sm font-medium text-gray-900 mb-2">
          Notizen (optional)
        </label>
        <textarea
          id="assignment-notes"
          bind:value={notes}
          placeholder="Zusätzliche Hinweise zur Zuordnung..."
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" on:click={handleClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          on:click={handleAssign}
          loading={isSubmitting}
          disabled={assignmentType === 'patient' && !selectedPatientId}
        >
          Zuordnen
        </Button>
      </div>
    </div>
  </div>
</div>
