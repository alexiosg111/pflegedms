<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { DocumentCategory, DocumentStatus } from '../types';
  import { DOCUMENT_CATEGORIES } from '../types';
  
  export let searchQuery = '';
  export let selectedCategory: DocumentCategory | '' = '';
  export let selectedStatus: DocumentStatus | '' = '';
  export let selectedTags: string[] = [];
  export let availableTags: string[] = [];
  
  const dispatch = createEventDispatcher();
  
  let showAdvancedFilters = false;
  let tagInput = '';
  
  function handleSearch() {
    dispatch('search', {
      query: searchQuery,
      category: selectedCategory || undefined,
      status: selectedStatus || undefined,
      tags: selectedTags
    });
  }
  
  function addTag(tag: string) {
    if (tag && !selectedTags.includes(tag)) {
      selectedTags = [...selectedTags, tag];
      handleSearch();
    }
  }
  
  function removeTag(tag: string) {
    selectedTags = selectedTags.filter(t => t !== tag);
    handleSearch();
  }
  
  function resetFilters() {
    searchQuery = '';
    selectedCategory = '';
    selectedStatus = '';
    selectedTags = [];
    handleSearch();
  }
  
  $: hasActiveFilters = selectedCategory || selectedStatus || selectedTags.length > 0;
</script>

<div class="document-search">
  <div class="search-bar">
    <input 
      type="text" 
      placeholder="🔍 Dokumente durchsuchen (Titel, Inhalt, Tags, Metadaten...)" 
      bind:value={searchQuery}
      on:input={handleSearch}
    />
    <button 
      class="filter-toggle" 
      class:active={showAdvancedFilters}
      on:click={() => showAdvancedFilters = !showAdvancedFilters}
    >
      <span>⚙️</span> Filter
      {#if hasActiveFilters}
        <span class="filter-count">{[selectedCategory, selectedStatus, ...selectedTags].filter(Boolean).length}</span>
      {/if}
    </button>
  </div>
  
  {#if showAdvancedFilters}
    <div class="advanced-filters">
      <div class="filter-row">
        <label>
          Kategorie
          <select bind:value={selectedCategory} on:change={handleSearch}>
            <option value="">Alle Kategorien</option>
            {#each DOCUMENT_CATEGORIES as cat}
              <option value={cat.value}>{cat.label}</option>
            {/each}
          </select>
        </label>
        
        <label>
          Status
          <select bind:value={selectedStatus} on:change={handleSearch}>
            <option value="">Alle Status</option>
            <option value="draft">Entwurf</option>
            <option value="active">Aktiv</option>
            <option value="archived">Archiviert</option>
            <option value="deleted">Gelöscht</option>
          </select>
        </label>
      </div>
      
      <div class="tag-filter">
        <label>Tags</label>
        <div class="tag-input-row">
          <select 
            bind:value={tagInput}
            on:change={() => { addTag(tagInput); tagInput = ''; }}
          >
            <option value="">-- Tag hinzufügen --</option>
            {#each availableTags as tag}
              <option value={tag}>{tag}</option>
            {/each}
          </select>
        </div>
        
        {#if selectedTags.length > 0}
          <div class="selected-tags">
            {#each selectedTags as tag}
              <span class="tag">
                {tag}
                <button on:click={() => removeTag(tag)}>×</button>
              </span>
            {/each}
          </div>
        {/if}
      </div>
      
      {#if hasActiveFilters}
        <button class="reset-filters" on:click={resetFilters}>
          Filter zurücksetzen
        </button>
      {/if}
    </div>
  {/if}
</div>

<style>
  .document-search {
    margin-bottom: 20px;
  }
  
  .search-bar {
    display: flex;
    gap: 12px;
  }
  
  .search-bar input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
  }
  
  .search-bar input:focus {
    outline: none;
    border-color: #3b82f6;
  }
  
  .filter-toggle {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 12px 20px;
    background: white;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    position: relative;
  }
  
  .filter-toggle:hover {
    border-color: #9ca3af;
  }
  
  .filter-toggle.active {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }
  
  .filter-count {
    position: absolute;
    top: -8px;
    right: -8px;
    background: #ef4444;
    color: white;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: bold;
  }
  
  .advanced-filters {
    margin-top: 16px;
    padding: 16px;
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
  }
  
  .filter-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .filter-row label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
  
  .filter-row select {
    width: 100%;
    margin-top: 4px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .tag-filter {
    margin-bottom: 16px;
  }
  
  .tag-filter label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 8px;
  }
  
  .tag-input-row select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
  }
  
  .selected-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
  }
  
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 500;
  }
  
  .tag button {
    background: none;
    border: none;
    color: #1e40af;
    font-size: 18px;
    font-weight: bold;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }
  
  .tag button:hover {
    color: #1e3a8a;
  }
  
  .reset-filters {
    padding: 8px 16px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  .reset-filters:hover {
    background: #4b5563;
  }
</style>
