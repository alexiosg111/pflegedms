<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { toastStore } from '@core/stores/toastStore';
  import { patientStore } from '../stores/patientStore';
  import Button from '@core/components/Button.svelte';
  import PatientAktenView from './PatientAktenView.svelte';
  import type { Patient } from '../types/patient';

  export let patient: Patient;

  const dispatch = createEventDispatcher();

  let isDeleting = false;
  let showAktenView = false;

  function handleClose() {
    dispatch('close');
  }

  function handleViewAkten() {
    showAktenView = true;
  }

  function handleBackToDetail() {
    showAktenView = false;
  }

  async function handleDelete() {
    if (!confirm('Diesen Patienten wirklich archivieren?')) {
      return;
    }

    isDeleting = true;
    const success = await patientStore.deletePatient(patient.id);
    isDeleting = false;

    if (success) {
      toastStore.success('Patient archiviert');
      handleClose();
    } else {
      toastStore.error('Fehler beim Löschen');
    }
  }
</script>

<!-- Modal Overlay -->
{#if showAktenView}
  <!-- Akte View wird in separatem Modal angezeigt -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-4xl max-h-screen overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <button
          on:click={handleBackToDetail}
          class="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          ← Zurück
        </button>
        <button
          on:click={handleClose}
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <PatientAktenView {patient} />
      </div>
    </div>
  </div>
{:else}
  <!-- Detail View -->
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {patient.first_name} {patient.last_name}
        </h2>
        <button
          on:click={handleClose}
          class="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- Status -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          Status: <span class="font-semibold">{patient.status}</span> | Registriert:{' '}
          {new Date(patient.date_registered).toLocaleDateString('de-DE')}
        </p>
      </div>

      <!-- Persönliche Daten -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Persönliche Daten</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Geburtsdatum</p>
            <p class="text-sm font-medium text-gray-900">
              {patient.date_of_birth
                ? new Date(patient.date_of_birth).toLocaleDateString('de-DE')
                : '-'}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Geschlecht</p>
            <p class="text-sm font-medium text-gray-900">
              {patient.gender === 'male'
                ? 'Männlich'
                : patient.gender === 'female'
                  ? 'Weiblich'
                  : '-'}
            </p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Telefon</p>
            <p class="text-sm font-medium text-gray-900">{patient.phone || '-'}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">E-Mail</p>
            <p class="text-sm font-medium text-gray-900">{patient.email || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Adresse -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Adresse</h3>
        <div class="text-sm text-gray-900">
          <p>{patient.address || '-'}</p>
          <p>{patient.postal_code} {patient.city || '-'}</p>
        </div>
      </div>

      <!-- Versicherung -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Versicherung</h3>
        <div class="space-y-2 text-sm">
          <div>
            <p class="text-gray-600">Versicherung</p>
            <p class="font-medium text-gray-900">{patient.insurance_company || '-'}</p>
          </div>
          <div>
            <p class="text-gray-600">Versichertennummer</p>
            <p class="font-medium text-gray-900">{patient.insurance_number || '-'}</p>
          </div>
        </div>
      </div>

      <!-- Medizinisches -->
      <div>
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Medizinisches</h3>
        <div>
          <p class="text-sm text-gray-600">Hausarzt</p>
          <p class="text-sm font-medium text-gray-900">{patient.primary_doctor || '-'}</p>
        </div>
      </div>

      <!-- Notizen -->
      {#if patient.notes}
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Notizen</h3>
          <p class="text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">{patient.notes}</p>
        </div>
      {/if}

      <!-- Buttons -->
      <div class="flex items-center justify-between border-t border-gray-200 pt-4 space-x-3">
        <Button
          variant="danger"
          on:click={handleDelete}
          loading={isDeleting}
        >
          Archivieren
        </Button>
        <div class="flex items-center space-x-2">
          <Button variant="secondary" on:click={handleViewAkten}>
            📂 Akten anzeigen
          </Button>
          <Button variant="primary" on:click={handleClose}>
            Schließen
          </Button>
        </div>
      </div>
    </div>
  </div>
  </div>
{/if}
