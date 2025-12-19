<script lang="ts">
  import type { Invoice } from '../types/invoice';

  export let invoice: Invoice;
  export let draggable = true;

  function getStatusColor(status: string): string {
    const colors = {
      open: 'bg-yellow-50 border-yellow-200',
      paid: 'bg-green-50 border-green-200',
      overdue: 'bg-red-50 border-red-200',
    };
    return colors[status as keyof typeof colors] || colors.open;
  }

  function getStatusLabel(status: string): string {
    const labels = {
      open: '📋 Offen',
      paid: '✓ Bezahlt',
      overdue: '⚠ Überfällig',
    };
    return labels[status as keyof typeof labels] || status;
  }

  function getStatusBadgeColor(status: string): string {
    const colors = {
      open: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.open;
  }

  function getDaysOverdue(): number {
    const today = new Date();
    const dueDate = new Date(invoice.due_date);
    const diff = today.getTime() - dueDate.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: invoice.currency || 'EUR',
    }).format(amount);
  }
</script>

<div
  class={`rounded-lg border-2 p-4 shadow-sm hover:shadow-md transition-all ${getStatusColor(
    invoice.status
  )} ${draggable ? 'cursor-move' : ''}`}
  draggable={draggable}
>
  <!-- Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1">
      <h3 class="text-sm font-semibold text-gray-900">{invoice.invoice_number}</h3>
      <p class="text-xs text-gray-600">{invoice.partner_name}</p>
    </div>
    <span
      class={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(
        invoice.status
      )}`}
    >
      {getStatusLabel(invoice.status)}
    </span>
  </div>

  <!-- Amount -->
  <div class="mb-3">
    <p class="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
  </div>

  <!-- Details -->
  <div class="space-y-1 mb-3 text-xs text-gray-600">
    <p>
      <strong>Typ:</strong>
      {invoice.invoice_type === 'incoming' ? '📥 Eingang' : '📤 Ausgang'}
    </p>
    <p>
      <strong>Datum:</strong>
      {new Date(invoice.invoice_date).toLocaleDateString('de-DE')}
    </p>
    <p>
      <strong>Fällig:</strong>
      {new Date(invoice.due_date).toLocaleDateString('de-DE')}
      {#if invoice.status === 'overdue'}
        <span class="text-red-700 font-semibold">({getDaysOverdue()} Tage überfällig)</span>
      {/if}
    </p>
  </div>

  <!-- Description -->
  {#if invoice.description}
    <p class="text-xs text-gray-700 mb-3 p-2 bg-white rounded line-clamp-2 opacity-75">
      {invoice.description}
    </p>
  {/if}

  <!-- Paid Info -->
  {#if invoice.status === 'paid' && invoice.paid_date}
    <div class="mb-3 text-xs text-green-700 bg-white px-2 py-1 rounded">
      ✓ Bezahlt am {new Date(invoice.paid_date).toLocaleDateString('de-DE')}
    </div>
  {/if}

  <!-- Action Slot -->
  <div class="pt-3 border-t border-gray-200">
    <slot />
  </div>
</div>
