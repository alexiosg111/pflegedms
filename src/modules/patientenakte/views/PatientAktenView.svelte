<script lang="ts">
  import { onMount } from 'svelte';
  import { documentStore } from '../stores/documentStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import DocumentUpload from '../components/DocumentUpload.svelte';
  import DocumentList from '../components/DocumentList.svelte';
  import type { Patient } from '../types/patient';

  export let patient: Patient;

  let showUploadForm = false;

  onMount(async () => {
    await documentStore.loadDocuments(patient.id);
  });

  function handleDocumentUploaded() {
    showUploadForm = false;
    toastStore.success('Dokument erfolgreich hochgeladen');
  }

  async function handleRefresh() {
    await documentStore.loadDocuments(patient.id);
    toastStore.info('Dokumente aktualisiert');
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold text-gray-900">
      Patientenakte: {patient.first_name} {patient.last_name}
    </h2>
    <div class="flex items-center space-x-2">
      <Button variant="ghost" size="sm" on:click={handleRefresh}>
        🔄 Aktualisieren
      </Button>
      <Button variant="primary" on:click={() => (showUploadForm = !showUploadForm)}>
        {showUploadForm ? '❌ Abbrechen' : '📤 Hochladen'}
      </Button>
    </div>
  </div>

  <!-- Patient Info -->
  <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      <div>
        <p class="text-gray-600">Geburtsdatum</p>
        <p class="font-medium text-gray-900">
          {patient.date_of_birth
            ? new Date(patient.date_of_birth).toLocaleDateString('de-DE')
            : '-'}
        </p>
      </div>
      <div>
        <p class="text-gray-600">Versicherung</p>
        <p class="font-medium text-gray-900">{patient.insurance_company || '-'}</p>
      </div>
      <div>
        <p class="text-gray-600">Hausarzt</p>
        <p class="font-medium text-gray-900">{patient.primary_doctor || '-'}</p>
      </div>
      <div>
        <p class="text-gray-600">Telefon</p>
        <p class="font-medium text-gray-900">{patient.phone || '-'}</p>
      </div>
    </div>
  </div>

  <!-- Upload Section -->
  {#if showUploadForm}
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Neues Dokument</h3>
      <DocumentUpload patientId={patient.id} on:uploaded={handleDocumentUploaded} />
    </div>
  {/if}

  <!-- Folder Navigation (Simpler Version für MVP) -->
  <div class="bg-white rounded-lg p-6 shadow-sm">
    <h3 class="text-lg font-semibold text-gray-900 mb-4">Dokumente</h3>
    <DocumentList patientId={patient.id} />
  </div>

  <!-- Statistics -->
  <div class="grid grid-cols-3 gap-4">
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-700">Gesamtdokumente</p>
      <p class="text-2xl font-bold text-blue-900">{$documentStore.documents.length}</p>
    </div>
    <div class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-sm text-green-700">Mit OCR-Text</p>
      <p class="text-2xl font-bold text-green-900">
        {$documentStore.documents.length > 0 ? $documentStore.documents.length : 0}
      </p>
    </div>
    <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
      <p class="text-sm text-purple-700">Speichergröße</p>
      <p class="text-2xl font-bold text-purple-900">-</p>
    </div>
  </div>
</div>
