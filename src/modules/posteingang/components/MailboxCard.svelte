<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@core/components/Button.svelte';
  import type { MailboxItem } from '../types/mailbox';

  export let item: MailboxItem;

  const dispatch = createEventDispatcher();

  function getPriorityColor(priority: string): string {
    const colors = {
      high: 'border-red-300 bg-red-50',
      normal: 'border-blue-300 bg-blue-50',
      low: 'border-gray-300 bg-gray-50',
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  }

  function getPriorityIcon(priority: string): string {
    const icons = {
      high: '🔴',
      normal: '🔵',
      low: '⚪',
    };
    return icons[priority as keyof typeof icons] || '🔵';
  }

  function getStatusLabel(status: string): string {
    const labels = {
      new: 'Neu',
      in_progress: 'In Bearbeitung',
      completed: 'Abgeschlossen',
      rejected: 'Abgelehnt',
    };
    return labels[status as keyof typeof labels] || status;
  }

  function handleView() {
    dispatch('view', item.id);
  }

  function handleMarkProgress() {
    dispatch('updateStatus', { id: item.id, status: 'in_progress' });
  }

  function handleMarkComplete() {
    dispatch('updateStatus', { id: item.id, status: 'completed' });
  }
</script>

<div class={`rounded-lg border-2 p-4 shadow-sm transition-all hover:shadow-md cursor-pointer ${getPriorityColor(item.priority)}`}>
  <!-- Header -->
  <div class="flex items-start justify-between mb-3">
    <div class="flex-1">
      <div class="flex items-center space-x-2 mb-1">
        <span class="text-xl">{getPriorityIcon(item.priority)}</span>
        <span class="text-xs font-semibold text-gray-600">
          {getStatusLabel(item.status)}
        </span>
      </div>
      <p class="text-sm font-medium text-gray-900 truncate">
        Dokument {item.document_id.substring(0, 8)}
      </p>
    </div>
  </div>

  <!-- Details -->
  <div class="text-xs text-gray-600 space-y-1 mb-3">
    <p>
      <strong>Typ:</strong> {item.item_type}
    </p>
    <p>
      <strong>Erstellt:</strong> {new Date(item.created_at).toLocaleDateString('de-DE')}
    </p>
    {#if item.notes}
      <p class="text-gray-700 mt-2 p-2 bg-white rounded truncate">
        💬 {item.notes}
      </p>
    {/if}
  </div>

  <!-- Status Badge -->
  <div class="mb-3">
    {#if item.assigned_to_patient_id}
      <span class="inline-block px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
        ✓ Patient zugeordnet
      </span>
    {:else if item.assigned_to_module}
      <span class="inline-block px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded">
        ✓ {item.assigned_to_module}
      </span>
    {:else}
      <span class="inline-block px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded">
        ⚠ Nicht zugeordnet
      </span>
    {/if}
  </div>

  <!-- Actions -->
  <div class="flex items-center space-x-2">
    <Button variant="ghost" size="sm" on:click={handleView}>
      👁️ Ansehen
    </Button>
    {#if item.status === 'new'}
      <Button variant="secondary" size="sm" on:click={handleMarkProgress}>
        📋 In Arbeit
      </Button>
    {:else if item.status === 'in_progress'}
      <Button variant="secondary" size="sm" on:click={handleMarkComplete}>
        ✓ Fertig
      </Button>
    {/if}
  </div>
</div>
