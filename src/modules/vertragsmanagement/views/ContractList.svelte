<script lang="ts">
  import { onMount } from 'svelte';
  import { contractStore } from '../stores/contractStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import ContractCard from '../components/ContractCard.svelte';
  import ContractForm from '../components/ContractForm.svelte';

  let showForm = false;

  const statusTabs = [
    { id: 'all', label: 'Alle', icon: '📜' },
    { id: 'active', label: 'Aktiv', icon: '✓' },
    { id: 'expiring', label: 'Läuft aus', icon: '⚠' },
  ];

  let activeTab = 'all';

  onMount(async () => {
    await contractStore.loadContracts();
  });

  function handleNewContract() {
    showForm = true;
  }

  async function handleDelete(contractId: string) {
    if (!confirm('Vertrag wirklich archivieren?')) return;
    const success = await contractStore.deleteContract(contractId);
    if (success) {
      toastStore.success('Vertrag archiviert');
    }
  }

  function getFilteredContracts() {
    if (activeTab === 'all') {
      return $contractStore.contracts;
    } else if (activeTab === 'active') {
      return $contractStore.contracts.filter((c) => c.status === 'active');
    } else if (activeTab === 'expiring') {
      const today = new Date();
      return $contractStore.contracts.filter((c) => {
        const endDate = new Date(c.end_date);
        const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return c.status === 'active' && daysLeft <= 30 && daysLeft > 0;
      });
    }
    return $contractStore.contracts;
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Vertragsmanagement</h1>
    <Button variant="primary" on:click={handleNewContract}>
      ➕ Neuer Vertrag
    </Button>
  </div>

  <!-- Stats -->
  {#if $contractStore.stats}
    <div class="grid grid-cols-4 gap-4">
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Gesamt</p>
        <p class="text-2xl font-bold text-blue-600 mt-1">{$contractStore.stats.total}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Aktiv</p>
        <p class="text-2xl font-bold text-green-600 mt-1">{$contractStore.stats.active}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Läuft aus</p>
        <p class="text-2xl font-bold text-orange-600 mt-1">{$contractStore.stats.expiring_soon}</p>
      </div>
      <div class="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Abgelaufen</p>
        <p class="text-2xl font-bold text-red-600 mt-1">{$contractStore.stats.expired}</p>
      </div>
    </div>
  {/if}

  <!-- Tabs -->
  <div class="flex border-b border-gray-200">
    {#each statusTabs as tab (tab.id)}
      <button
        on:click={() => (activeTab = tab.id)}
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
  {#if $contractStore.isLoading}
    <div class="text-center py-12">
      <p class="text-gray-500">⏳ Verträge werden geladen...</p>
    </div>
  {:else if getFilteredContracts().length === 0}
    <div class="bg-white rounded-lg p-12 shadow-sm text-center">
      <p class="text-gray-500 mb-4">📭 Keine Verträge</p>
      <p class="text-xs text-gray-400 mb-4">
        {activeTab === 'all'
          ? 'Erstellen Sie einen neuen Vertrag'
          : 'Keine Verträge in dieser Kategorie'}
      </p>
      {#if activeTab === 'all'}
        <Button variant="primary" on:click={handleNewContract}>
          Neuen Vertrag erstellen
        </Button>
      {/if}
    </div>
  {:else}
    <!-- Contracts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each getFilteredContracts() as contract (contract.id)}
        <ContractCard {contract}>
          <div class="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              on:click={() => handleDelete(contract.id)}
            >
              🗑 Archivieren
            </Button>
          </div>
        </ContractCard>
      {/each}
    </div>
  {/if}

  <!-- Error Message -->
  {#if $contractStore.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$contractStore.error}</p>
    </div>
  {/if}
</div>

<!-- Contract Form Modal -->
{#if showForm}
  <ContractForm on:close={() => (showForm = false)} />
{/if}
