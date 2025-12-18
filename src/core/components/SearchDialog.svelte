<script lang="ts">
  import { onMount } from 'svelte';
  import { searchService } from '../services/searchService';
  import type { SearchResult } from '../services/searchService';

  export let isOpen = false;

  let query = '';
  let results: SearchResult[] = [];
  let isLoading = false;
  let selectedIndex = 0;

  onMount(() => {
    // Listen for Ctrl+K
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        isOpen = true;
        query = '';
        results = [];
        selectedIndex = 0;
        setTimeout(() => {
          const input = document.querySelector('#search-input') as HTMLInputElement;
          input?.focus();
        }, 0);
      }

      // Handle Escape
      if (e.key === 'Escape' && isOpen) {
        isOpen = false;
        query = '';
      }

      // Handle Arrow keys
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          selectedIndex = Math.max(selectedIndex - 1, 0);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleSelectResult(results[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  async function handleSearch() {
    if (query.trim().length < 2) {
      results = [];
      return;
    }

    isLoading = true;
    try {
      results = await searchService.search(query);
      selectedIndex = 0;
    } finally {
      isLoading = false;
    }
  }

  function handleSelectResult(result: SearchResult) {
    console.log('Selected result:', result);
    // TODO: Navigate to result based on type
    isOpen = false;
    query = '';
    results = [];
  }

  function getTypeLabel(type: string): string {
    const labels = {
      patient: '👤 Patient',
      document: '📄 Dokument',
      contract: '📜 Vertrag',
      invoice: '💰 Rechnung',
      qm_folder: '📁 QM-Ordner',
      qm_document: '📋 QM-Dokument',
    };
    return labels[type as keyof typeof labels] || type;
  }

  function getTypeColor(type: string): string {
    const colors = {
      patient: 'text-blue-600',
      document: 'text-purple-600',
      contract: 'text-green-600',
      invoice: 'text-orange-600',
      qm_folder: 'text-yellow-600',
      qm_document: 'text-cyan-600',
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-32 z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-96 flex flex-col">
      <!-- Search Input -->
      <div class="border-b border-gray-200 p-4">
        <input
          id="search-input"
          type="text"
          bind:value={query}
          on:input={handleSearch}
          placeholder="Suche nach Patienten, Dokumenten, Verträgen..."
          class="w-full px-4 py-3 text-lg border-none focus:outline-none"
        />
        <p class="text-xs text-gray-500 mt-2">
          Drücke <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">↓↑</kbd> zum Navigieren,
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> zum Auswählen,
          <kbd class="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> zum Schließen
        </p>
      </div>

      <!-- Results -->
      <div class="flex-1 overflow-y-auto">
        {#if isLoading}
          <div class="p-8 text-center text-gray-500">
            <p>⏳ Suche läuft...</p>
          </div>
        {:else if query.trim().length < 2}
          <div class="p-8 text-center text-gray-500">
            <p>🔍 Geben Sie mindestens 2 Zeichen ein</p>
          </div>
        {:else if results.length === 0}
          <div class="p-8 text-center text-gray-500">
            <p>😕 Keine Ergebnisse gefunden</p>
          </div>
        {:else}
          <div class="divide-y divide-gray-200">
            {#each results as result, index (result.id)}
              <button
                on:click={() => handleSelectResult(result)}
                class={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                  selectedIndex === index ? 'bg-blue-50' : ''
                }`}
              >
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p class="font-medium text-gray-900">{result.title}</p>
                    <p class="text-sm text-gray-600 truncate">{result.content_preview}</p>
                    <p class="text-xs text-gray-500 mt-1">
                      {new Date(result.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <span class={`text-xs font-medium ml-2 ${getTypeColor(result.type)}`}>
                    {getTypeLabel(result.type)}
                  </span>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        {results.length} Ergebnisse
      </div>
    </div>
  </div>
{/if}
