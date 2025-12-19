<script lang="ts">
  import { authStore } from '../stores/authStore';
  import Sidebar from './Sidebar.svelte';
  import Dashboard from './Dashboard.svelte';
  import PatientList from '@modules/patientenakte/views/PatientList.svelte';
  import MailboxList from '@modules/posteingang/views/MailboxList.svelte';
  import ContractList from '@modules/vertragsmanagement/views/ContractList.svelte';
  import InvoiceList from '@modules/rechnungsmanagement/views/InvoiceList.svelte';
  import QMList from '@modules/qm/views/QMList.svelte';
  import SearchDialog from '../components/SearchDialog.svelte';
  import FeedbackDialog from '../components/FeedbackDialog.svelte';
  import Settings from './Settings.svelte';

  let currentPage: string = 'dashboard';
  let showSearchDialog = false;
  let showFeedbackDialog = false;
  let showSettings = false;

  const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'patients', label: 'Patientenakte', icon: '👤' },
    { id: 'mailbox', label: 'Posteingang', icon: '📮' },
    { id: 'contracts', label: 'Verträge', icon: '📜' },
    { id: 'invoices', label: 'Rechnungen', icon: '💰' },
    { id: 'qm', label: 'Qualitätsmgmt.', icon: '✅' },
  ];

  function navigateTo(page: string) {
    currentPage = page;
  }

  function handleLogout() {
    authStore.logout();
  }

  function handleSettingsClick() {
    showSettings = true;
  }
</script>

<div class="flex w-full h-full bg-white">
  <!-- Sidebar -->
  <Sidebar
    {modules}
    {currentPage}
    on:navigate={(e) => navigateTo(e.detail)}
    on:logout={handleLogout}
    on:settings={() => (showSettings = true)}
  />

  <!-- Main Content -->
  <main class="flex-1 overflow-hidden flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-gray-900">
          {modules.find((m) => m.id === currentPage)?.label || 'Dashboard'}
        </h1>
        <p class="text-sm text-gray-500">Willkommen zurück!</p>
      </div>
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-600">Administrator</span>
      </div>
    </header>

    <!-- Content Area -->
    <section class="flex-1 overflow-auto bg-gray-50 p-6">
      {#if currentPage === 'dashboard'}
        <Dashboard />
      {:else if currentPage === 'patients'}
        <PatientList />
      {:else if currentPage === 'mailbox'}
        <MailboxList />
      {:else if currentPage === 'contracts'}
        <ContractList />
      {:else if currentPage === 'invoices'}
        <InvoiceList />
      {:else if currentPage === 'qm'}
        <QMList />
      {:else}
        <div class="bg-white rounded-lg p-6 shadow-sm">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">
            {modules.find((m) => m.id === currentPage)?.label}
          </h2>
          <p class="text-gray-600">
            Modul wird in Phase 7 implementiert.
          </p>
        </div>
      {/if}
    </section>
  </main>

  <!-- Feedback Button -->
  <button
    on:click={() => (showFeedbackDialog = true)}
    class="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-40"
    title="Feedback geben"
  >
    💬
  </button>
</div>

<!-- Search Dialog -->
<SearchDialog bind:isOpen={showSearchDialog} />

<!-- Feedback Dialog -->
<FeedbackDialog isOpen={showFeedbackDialog} on:close={() => (showFeedbackDialog = false)} />

<!-- Settings Dialog -->
{#if showSettings}
  <Settings on:close={() => (showSettings = false)} />
{/if}

<style>
  :global(body) {
    margin: 0;
    padding: 0;
  }
</style>
