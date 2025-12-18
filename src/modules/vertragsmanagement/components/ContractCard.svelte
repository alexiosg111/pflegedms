<script lang="ts">
  import Button from '@core/components/Button.svelte';
  import type { Contract } from '../types/contract';

  export let contract: Contract;

  function getStatusBadge(status: string): { label: string; color: string } {
    const badges = {
      active: { label: '✓ Aktiv', color: 'bg-green-100 text-green-800' },
      inactive: { label: '⏸ Inaktiv', color: 'bg-yellow-100 text-yellow-800' },
      expired: { label: '✕ Abgelaufen', color: 'bg-red-100 text-red-800' },
    };
    return badges[status as keyof typeof badges] || badges.active;
  }

  function getDaysUntilExpiry(): number {
    const today = new Date();
    const endDate = new Date(contract.end_date);
    const diff = endDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  function getExpiryColor(): string {
    const days = getDaysUntilExpiry();
    if (days <= 0) return 'text-red-700 bg-red-50';
    if (days <= 30) return 'text-orange-700 bg-orange-50';
    return 'text-green-700 bg-green-50';
  }

  function getExpiryLabel(): string {
    const days = getDaysUntilExpiry();
    if (days <= 0) return '✕ Abgelaufen';
    if (days === 1) return '⚠ Morgen';
    return `⏳ ${days} Tage`;
  }

  const statusBadge = getStatusBadge(contract.status);
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
  <!-- Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1">
      <h3 class="text-sm font-semibold text-gray-900">{contract.contract_name}</h3>
      <p class="text-xs text-gray-600">{contract.partner_name}</p>
    </div>
    <span class={`inline-block px-2 py-1 text-xs font-medium rounded ${statusBadge.color}`}>
      {statusBadge.label}
    </span>
  </div>

  <!-- Details -->
  <div class="space-y-2 mb-3 text-xs text-gray-600">
    <p>
      <strong>Typ:</strong>
      {contract.partner_type === 'patient' ? '👤 Patient' : '🏢 Lieferant'}
    </p>
    <p>
      <strong>Start:</strong>
      {new Date(contract.start_date).toLocaleDateString('de-DE')}
    </p>
    <p class="flex items-center">
      <strong>Ende:</strong>
      <span class={`ml-2 px-2 py-1 rounded-md font-medium ${getExpiryColor()}`}>
        {new Date(contract.end_date).toLocaleDateString('de-DE')} ({getExpiryLabel()})
      </span>
    </p>
    {#if contract.cancellation_period_days}
      <p>
        <strong>Kündigungsfrist:</strong>
        {contract.cancellation_period_days} Tage
      </p>
    {/if}
  </div>

  <!-- Description -->
  {#if contract.description}
    <p class="text-xs text-gray-700 mb-3 p-2 bg-gray-50 rounded line-clamp-2">
      {contract.description}
    </p>
  {/if}

  <!-- Reminder Status -->
  {#if contract.reminder_sent}
    <div class="mb-3 text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
      🔔 Erinnerung gesendet
    </div>
  {/if}

  <!-- Action Slot -->
  <div class="pt-3 border-t border-gray-200">
    <slot />
  </div>
</div>
