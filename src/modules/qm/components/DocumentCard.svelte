<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@core/components/Button.svelte';
  import type { QMDocument } from '../types/qm';

  export let document: QMDocument;

  const dispatch = createEventDispatcher();

  function getStatusBadge(status: string): { label: string; color: string } {
    const badges = {
      draft: { label: '📝 Entwurf', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: '✓ Genehmigt', color: 'bg-green-100 text-green-800' },
      archived: { label: '📦 Archiviert', color: 'bg-gray-100 text-gray-800' },
    };
    return badges[status as keyof typeof badges] || badges.draft;
  }

  function getVersionLabel(): string {
    return `v${document.version_major}.${document.version_minor}`;
  }

  function handleApprove() {
    dispatch('approve', document.id);
  }

  function handleNewVersion() {
    dispatch('newVersion', document.id);
  }

  function handleDelete() {
    dispatch('delete', document.id);
  }

  const badge = getStatusBadge(document.status);
</script>

<div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
  <!-- Header -->
  <div class="flex items-start justify-between mb-2">
    <div class="flex-1">
      <h3 class="text-sm font-semibold text-gray-900 truncate">{document.filename}</h3>
      <p class="text-xs text-gray-500">{getVersionLabel()}</p>
    </div>
    <span class={`inline-block px-2 py-1 text-xs font-medium rounded ${badge.color}`}>
      {badge.label}
    </span>
  </div>

  <!-- Info -->
  <div class="space-y-1 mb-3 text-xs text-gray-600">
    <p>
      <strong>Erstellt:</strong>
      {new Date(document.created_at).toLocaleDateString('de-DE')}
    </p>
    <p>
      <strong>Von:</strong>
      {document.created_by}
    </p>
    {#if document.status === 'approved' && document.approved_at}
      <p class="text-green-700">
        ✓ Genehmigt am {new Date(document.approved_at).toLocaleDateString('de-DE')}
        {#if document.approved_by}
          durch {document.approved_by}
        {/if}
      </p>
    {/if}
  </div>

  <!-- Actions -->
  <div class="flex items-center space-x-2 border-t border-gray-200 pt-3">
    {#if document.status === 'draft'}
      <Button
        variant="primary"
        size="sm"
        on:click={handleApprove}
      >
        ✓ Genehmigen
      </Button>
    {/if}
    <Button
      variant="secondary"
      size="sm"
      on:click={handleNewVersion}
    >
      📋 Neue Version
    </Button>
    <Button
      variant="danger"
      size="sm"
      on:click={handleDelete}
    >
      🗑
    </Button>
  </div>
</div>
