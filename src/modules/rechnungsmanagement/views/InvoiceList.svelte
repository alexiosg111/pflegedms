<script lang="ts">
  import { onMount } from 'svelte';
  import { invoiceStore } from '../stores/invoiceStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import InvoiceCard from '../components/InvoiceCard.svelte';
  import InvoiceForm from '../components/InvoiceForm.svelte';
  import type { Invoice } from '../types/invoice';

  let showForm = false;
  let draggedInvoice: Invoice | null = null;
  let dragSource: string | null = null;

  onMount(async () => {
    await invoiceStore.loadInvoices();
  });

  function handleNewInvoice() {
    showForm = true;
  }

  async function handleDelete(invoiceId: string) {
    if (!confirm('Rechnung wirklich löschen?')) return;
    const success = await invoiceStore.deleteInvoice(invoiceId);
    if (success) {
      toastStore.success('Rechnung gelöscht');
    }
  }

  function handleDragStart(e: DragEvent, invoice: Invoice, source: string) {
    draggedInvoice = invoice;
    dragSource = source;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
  }

  async function handleDrop(e: DragEvent, targetStatus: string) {
    e.preventDefault();

    if (!draggedInvoice || dragSource === targetStatus) {
      draggedInvoice = null;
      dragSource = null;
      return;
    }

    const success = await invoiceStore.updateStatus(draggedInvoice.id, targetStatus);
    if (success) {
      toastStore.success(`Rechnung zu "${targetStatus}" verschoben`);
    }

    draggedInvoice = null;
    dragSource = null;
  }

  function formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  function getColumnSum(status: string): number {
    if (!$invoiceStore.invoicesByStatus) return 0;
    const invoices = $invoiceStore.invoicesByStatus[status as keyof typeof $invoiceStore.invoicesByStatus] || [];
    return invoices.reduce((sum, inv) => sum + inv.amount, 0);
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Rechnungsmanagement</h1>
    <Button variant="primary" on:click={handleNewInvoice}>
      ➕ Neue Rechnung
    </Button>
  </div>

  <!-- Stats -->
  {#if $invoiceStore.stats}
    <div class="grid grid-cols-6 gap-2">
      <div class="bg-yellow-50 rounded-lg p-3 shadow-sm border-l-4 border-yellow-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Offen</p>
        <p class="text-lg font-bold text-yellow-600 mt-1">{$invoiceStore.stats.total_open}</p>
        <p class="text-xs text-gray-500 mt-1">{formatCurrency($invoiceStore.stats.sum_open)}</p>
      </div>
      <div class="bg-green-50 rounded-lg p-3 shadow-sm border-l-4 border-green-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Bezahlt</p>
        <p class="text-lg font-bold text-green-600 mt-1">{$invoiceStore.stats.total_paid}</p>
        <p class="text-xs text-gray-500 mt-1">{formatCurrency($invoiceStore.stats.sum_paid)}</p>
      </div>
      <div class="bg-red-50 rounded-lg p-3 shadow-sm border-l-4 border-red-500">
        <p class="text-xs text-gray-600 uppercase font-semibold">Überfällig</p>
        <p class="text-lg font-bold text-red-600 mt-1">{$invoiceStore.stats.total_overdue}</p>
        <p class="text-xs text-gray-500 mt-1">{formatCurrency($invoiceStore.stats.sum_overdue)}</p>
      </div>
    </div>
  {/if}

  <!-- Loading State -->
  {#if $invoiceStore.isLoading}
    <div class="text-center py-12">
      <p class="text-gray-500">⏳ Rechnungen werden geladen...</p>
    </div>
  {:else if !$invoiceStore.invoicesByStatus || ((!$invoiceStore.invoicesByStatus.open || $invoiceStore.invoicesByStatus.open.length === 0) && (!$invoiceStore.invoicesByStatus.paid || $invoiceStore.invoicesByStatus.paid.length === 0) && (!$invoiceStore.invoicesByStatus.overdue || $invoiceStore.invoicesByStatus.overdue.length === 0))}
    <div class="bg-white rounded-lg p-12 shadow-sm text-center">
      <p class="text-gray-500 mb-4">💼 Keine Rechnungen</p>
      <p class="text-xs text-gray-400 mb-4">Erstellen Sie eine neue Rechnung</p>
      <Button variant="primary" on:click={handleNewInvoice}>
        Neue Rechnung erstellen
      </Button>
    </div>
  {:else}
    <!-- Kanban Board -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Open Column -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-yellow-200 flex flex-col">
        <div class="bg-yellow-50 px-4 py-3 border-b border-yellow-200 rounded-t-lg">
          <h2 class="text-sm font-semibold text-gray-900 mb-1">📋 Offen</h2>
          <p class="text-xs text-gray-600">
            {$invoiceStore.invoicesByStatus?.open.length || 0} Rechnung(en)
          </p>
        </div>

        <div
          class="flex-1 p-4 space-y-3 overflow-y-auto min-h-96"
          on:dragover={handleDragOver}
          on:drop={(e) => handleDrop(e, 'open')}
        >
          {#each $invoiceStore.invoicesByStatus?.open || [] as invoice (invoice.id)}
            <div
              draggable={true}
              on:dragstart={(e) => handleDragStart(e, invoice, 'open')}
              class="cursor-move"
            >
              <InvoiceCard {invoice}>
                <Button
                  variant="danger"
                  size="sm"
                  on:click={() => handleDelete(invoice.id)}
                >
                  🗑 Löschen
                </Button>
              </InvoiceCard>
            </div>
          {/each}
        </div>

        <div class="bg-yellow-50 px-4 py-3 border-t border-yellow-200 text-xs font-semibold text-gray-900">
          Summe: {formatCurrency(getColumnSum('open'))}
        </div>
      </div>

      <!-- Paid Column -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-green-200 flex flex-col">
        <div class="bg-green-50 px-4 py-3 border-b border-green-200 rounded-t-lg">
          <h2 class="text-sm font-semibold text-gray-900 mb-1">✓ Bezahlt</h2>
          <p class="text-xs text-gray-600">
            {$invoiceStore.invoicesByStatus?.paid.length || 0} Rechnung(en)
          </p>
        </div>

        <div
          class="flex-1 p-4 space-y-3 overflow-y-auto min-h-96"
          on:dragover={handleDragOver}
          on:drop={(e) => handleDrop(e, 'paid')}
        >
          {#each $invoiceStore.invoicesByStatus?.paid || [] as invoice (invoice.id)}
            <div
              draggable={true}
              on:dragstart={(e) => handleDragStart(e, invoice, 'paid')}
              class="cursor-move"
            >
              <InvoiceCard {invoice} draggable={false}>
                <Button
                  variant="danger"
                  size="sm"
                  on:click={() => handleDelete(invoice.id)}
                >
                  🗑 Löschen
                </Button>
              </InvoiceCard>
            </div>
          {/each}
        </div>

        <div class="bg-green-50 px-4 py-3 border-t border-green-200 text-xs font-semibold text-gray-900">
          Summe: {formatCurrency(getColumnSum('paid'))}
        </div>
      </div>

      <!-- Overdue Column -->
      <div class="bg-white rounded-lg shadow-sm border-2 border-red-200 flex flex-col">
        <div class="bg-red-50 px-4 py-3 border-b border-red-200 rounded-t-lg">
          <h2 class="text-sm font-semibold text-gray-900 mb-1">⚠ Überfällig</h2>
          <p class="text-xs text-gray-600">
            {$invoiceStore.invoicesByStatus?.overdue.length || 0} Rechnung(en)
          </p>
        </div>

        <div
          class="flex-1 p-4 space-y-3 overflow-y-auto min-h-96"
          on:dragover={handleDragOver}
          on:drop={(e) => handleDrop(e, 'overdue')}
        >
          {#each $invoiceStore.invoicesByStatus?.overdue || [] as invoice (invoice.id)}
            <div
              draggable={true}
              on:dragstart={(e) => handleDragStart(e, invoice, 'overdue')}
              class="cursor-move"
            >
              <InvoiceCard {invoice} draggable={false}>
                <Button
                  variant="danger"
                  size="sm"
                  on:click={() => handleDelete(invoice.id)}
                >
                  🗑 Löschen
                </Button>
              </InvoiceCard>
            </div>
          {/each}
        </div>

        <div class="bg-red-50 px-4 py-3 border-t border-red-200 text-xs font-semibold text-gray-900">
          Summe: {formatCurrency(getColumnSum('overdue'))}
        </div>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if $invoiceStore.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$invoiceStore.error}</p>
    </div>
  {/if}
</div>

<!-- Invoice Form Modal -->
{#if showForm}
  <InvoiceForm on:close={() => (showForm = false)} />
{/if}
