<script lang="ts">
  import { onMount } from 'svelte';
  import { patientStore, selectedPatient } from '../stores/patientStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import PatientForm from './PatientForm.svelte';
  import PatientDetail from './PatientDetail.svelte';

  let showForm = false;
  let showDetail = false;
  let searchQuery = '';

  onMount(async () => {
    await patientStore.loadPatients();
  });

  async function handleSearch(e: Event) {
    const query = (e.target as HTMLInputElement).value;
    searchQuery = query;

    if (query.length > 2) {
      const results = await patientStore.searchPatients(query);
      if (results.length === 0) {
        toastStore.info('Keine Patienten gefunden');
      }
    }
  }

  function handleNewPatient() {
    patientStore.selectPatient(null);
    showForm = true;
  }

  function handleSelectPatient(patientId: string) {
    patientStore.selectPatient(patientId);
    showDetail = true;
  }

  function handleFormClose() {
    showForm = false;
    patientStore.clearError();
  }

  function handleDetailClose() {
    showDetail = false;
    patientStore.selectPatient(null);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Patientenakte</h1>
    <Button variant="primary" on:click={handleNewPatient}>➕ Neuer Patient</Button>
  </div>

  <!-- Search -->
  <div class="bg-white rounded-lg p-4 shadow-sm">
    <input
      type="text"
      placeholder="Suchen nach Name..."
      value={searchQuery}
      on:input={handleSearch}
      class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>

  <!-- Patients Table -->
  {#if $patientStore.isLoading}
    <div class="text-center py-12">
      <p class="text-gray-500">⏳ Patienten werden geladen...</p>
    </div>
  {:else if $patientStore.patients.length === 0}
    <div class="bg-white rounded-lg p-12 shadow-sm text-center">
      <p class="text-gray-500 mb-4">Noch keine Patienten hinzugefügt</p>
      <Button variant="primary" on:click={handleNewPatient}>Ersten Patient erstellen</Button>
    </div>
  {:else}
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Geburtsdatum</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Versicherung</th>
            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Aktionen</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each $patientStore.patients as patient (patient.id)}
            <tr class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                {patient.first_name} {patient.last_name}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString('de-DE') : '-'}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {patient.insurance_company || '-'}
              </td>
              <td class="px-6 py-4 text-sm">
                <span
                  class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : patient.status === 'inactive'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {patient.status === 'active'
                    ? '✓ Aktiv'
                    : patient.status === 'inactive'
                      ? '⏸ Pausiert'
                      : '📦 Archiv'}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  on:click={() => handleSelectPatient(patient.id)}
                >
                  Bearbeiten
                </Button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <p class="text-sm text-gray-600 text-center">
      {$patientStore.patients.length}
      {$patientStore.patients.length === 1 ? 'Patient' : 'Patienten'} insgesamt
    </p>
  {/if}

  <!-- Error Message -->
  {#if $patientStore.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$patientStore.error}</p>
    </div>
  {/if}
</div>

<!-- Form Modal -->
{#if showForm}
  <PatientForm on:close={handleFormClose} />
{/if}

<!-- Detail Modal -->
{#if showDetail && $selectedPatient}
  <PatientDetail patient={$selectedPatient} on:close={handleDetailClose} />
{/if}
