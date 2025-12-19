<script lang="ts">
  import { documentStore } from '../stores/documentStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import { DOCUMENT_CATEGORIES } from '../types/document';

  // unused-export-let: patientId is required by interface but used implicitly/future
  export const patientId: string = '';

  let selectedDocumentId: string | null = null;
  let showFullText = false;

  function getCategoryLabel(categoryId: string): string {
    const cat = DOCUMENT_CATEGORIES.find((c) => c.id === categoryId);
    return cat ? `${cat.icon} ${cat.label}` : '📎 Sonstiges';
  }

  async function handleDelete(documentId: string) {
    if (!confirm('Dokument wirklich löschen?')) return;

    const success = await documentStore.deleteDocument(documentId);
    if (success) {
      toastStore.success('Dokument gelöscht');
    } else {
      toastStore.error('Fehler beim Löschen');
    }
  }

  function handleSelectDocument(documentId: string) {
    selectedDocumentId = selectedDocumentId === documentId ? null : documentId;
  }
</script>

<div class="space-y-4">
  {#if $documentStore.isLoading}
    <div class="text-center py-8">
      <p class="text-gray-500">⏳ Dokumente werden geladen...</p>
    </div>
  {:else if $documentStore.documents.length === 0}
    <div class="bg-white rounded-lg p-8 shadow-sm text-center">
      <p class="text-gray-500 mb-2">Noch keine Dokumente hochgeladen</p>
      <p class="text-xs text-gray-400">Nutze die Upload-Zone oben</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each $documentStore.documents as doc (doc.id)}
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <button
                on:click={() => handleSelectDocument(doc.id)}
                class="text-left w-full"
              >
                <div class="flex items-center space-x-3 mb-2">
                  <span class="text-lg">{getCategoryLabel(doc.category).split(' ')[0]}</span>
                  <div>
                    <p class="font-medium text-gray-900 hover:text-blue-600">
                      {doc.id}
                    </p>
                    <p class="text-xs text-gray-500">
                      {getCategoryLabel(doc.category)} • {new Date(doc.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              </button>

              {#if doc.notes}
                <p class="text-sm text-gray-600 mt-2">
                  <span class="font-semibold">Notizen:</span> {doc.notes}
                </p>
              {/if}
            </div>
            <Button
              variant="danger"
              size="sm"
              on:click={() => handleDelete(doc.document_id)}
            >
              Löschen
            </Button>
          </div>

          <!-- Expanded Detail View -->
          {#if selectedDocumentId === doc.id}
            <div class="mt-4 pt-4 border-t border-gray-200">
              <div class="bg-gray-50 p-3 rounded text-sm text-gray-700">
                <p><strong>Dokument-ID:</strong> {doc.document_id}</p>
                <p><strong>Hochgeladen:</strong> {new Date(doc.created_at).toLocaleString('de-DE')}</p>
                <p><strong>Kategorie:</strong> {getCategoryLabel(doc.category)}</p>
              </div>

              <!-- OCR Text -->
              <div class="mt-3">
                <button
                  on:click={() => (showFullText = !showFullText)}
                  class="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showFullText ? '▼' : '▶'} OCR-Text anzeigen
                </button>

                {#if showFullText}
                  <div class="mt-2 max-h-40 overflow-y-auto bg-gray-100 p-3 rounded text-xs text-gray-700 whitespace-pre-wrap">
                    [OCR-Text würde hier angezeigt werden]
                  </div>
                {/if}
              </div>

              <!-- Download Button -->
              <div class="mt-3">
                <Button variant="ghost" size="sm">
                  📥 Herunterladen
                </Button>
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <p class="text-sm text-gray-600 text-center mt-4">
      {$documentStore.documents.length}
      {$documentStore.documents.length === 1 ? 'Dokument' : 'Dokumente'} insgesamt
    </p>
  {/if}

  {#if $documentStore.error}
    <div class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$documentStore.error}</p>
    </div>
  {/if}
</div>
