<script lang="ts">
  import { onMount } from 'svelte';
  import { mailboxStore, selectedMailboxItem } from '../stores/mailboxStore';
  import { patientStore } from '@modules/patientenakte/stores/patientStore';
  import { toastStore } from '@core/stores/toastStore';
  import MailboxCard from '../components/MailboxCard.svelte';
  import AssignmentDialog from '../components/AssignmentDialog.svelte';

  let showAssignmentDialog = false;
  let selectedForAssignment: string | null = null;

  const statusTabs = [
    { id: 'new', label: 'Neu', icon: '📮' },
    { id: 'in_progress', label: 'In Bearbeitung', icon: '⏳' },
    { id: 'completed', label: 'Abgeschlossen', icon: '✓' },
  ];

  let activeTab = 'new';

  onMount(async () => {
    await patientStore.loadPatients();
    await mailboxStore.loadByStatus('new');
  });

  async function handleTabChange(status: string) {
    activeTab = status;
    await mailboxStore.loadByStatus(status);
  }

  function handleCardView(e: CustomEvent<string>) {
    const itemId = e.detail;
    mailboxStore.selectItem(itemId);
  }

  function handleCardUpdateStatus(e: CustomEvent<{ id: string; status: string }>) {
    const { id, status } = e.detail;
    mailboxStore.updateStatus(id, status);
  }

  async function handleAssignmentRequest(itemId: string) {
    selectedForAssignment = itemId;
    showAssignmentDialog = true;
  }

  async function handleAssignment(e: CustomEvent) {
    const { type, patientId, module, notes } = e.detail;

    if (type === 'patient') {
      const result = await mailboxStore.assignToPatient(selectedForAssignment!, patientId, notes);
      if (result) {
        toastStore.success('Dokument dem Patienten zugeordnet');
      }
    } else {
      const result = await mailboxStore.assignToModule(
        selectedForAssignment!,
        module,
        undefined,
        notes
      );
      if (result) {
        toastStore.success(`Dokument dem Modul "${module}" zugeordnet`);
      }
    }

    showAssignmentDialog = false;
    selectedForAssignment = null;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Posteingang</h1>
  </div>

  <!-- Stats -->
  {#if $mailboxStore.stats}
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Neu</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{$mailboxStore.stats.new}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">In Bearbeitung</p>
        <p class="text-2xl font-bold text-yellow-600 mt-1">{$mailboxStore.stats.in_progress}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Abgeschlossen</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{$mailboxStore.stats.completed}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-gray-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Gesamt</p>
        <p class="text-2xl font-bold text-gray-600 mt-1">{$mailboxStore.stats.total}</p>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="flex border-b border-gray-200">
    {#each statusTabs as tab (tab.id)}
      <button
        on:click={() => handleTabChange(tab.id)}
        class={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
          activeTab === tab.id
            ? 'border-blue-600 text-blue-600'
            : 'border-transparent text-gray-600 hover:text-gray-900'
        }`}
      >
        {tab.icon} {tab.label}
      </button>
    {/each}
  </div>

  <!-- Loading State -->
  {#if $mailboxStore.isLoading}
    <div class="text-center py-12">
      <p class="text-gray-500">⏳ Dokumente werden geladen...</p>
    </div>
  {:else if $mailboxStore.items.length === 0}
    <div class="bg-white rounded-lg p-12 shadow-sm text-center">
      <p class="text-gray-500 mb-4">📭 Keine Dokumente in diesem Status</p>
      <p class="text-xs text-gray-400">
        {activeTab === 'new'
          ? 'Laden Sie Dokumente in der Patientenakte hoch'
          : 'Alle Dokumente wurden verarbeitet'}
      </p>
    </div>
  {:else}
    <!-- Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $mailboxStore.items as item (item.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div on:click={() => handleAssignmentRequest(item.id)}>
          <MailboxCard
            {item}
            on:view={handleCardView}
            on:updateStatus={handleCardUpdateStatus}
          />
        </div>
      {/each}
    </div>
  {/if}

  <!-- Error Message -->
  {#if $mailboxStore.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$mailboxStore.error}</p>
    </div>
  {/if}
</div>

<!-- Assignment Dialog -->
{#if showAssignmentDialog && selectedForAssignment && $selectedMailboxItem}
  <AssignmentDialog
    item={$selectedMailboxItem}
    on:assign={handleAssignment}
    on:close={() => (showAssignmentDialog = false)}
  />
{/if}
