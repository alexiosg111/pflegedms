<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Document, DocumentCategory, Patient, DocumentTemplate } from '../types';
  import { DOCUMENT_CATEGORIES } from '../types';
  import { createNewDocument, updateDocument } from '../documentService';
  
  export let document: Document | null = null;
  export let patients: Patient[] = [];
  export let templates: DocumentTemplate[] = [];
  
  const dispatch = createEventDispatcher();
  
  let title = document?.title || '';
  let patientId = document?.patientId || '';
  let category = document?.category || 'sonstiges';
  let notes = document?.notes || '';
  let tags = document?.tags?.join(', ') || '';
  let metadataEntries: Array<{ key: string; value: string }> = 
    document?.metadata ? Object.entries(document.metadata).map(([key, value]) => ({ key, value: String(value) })) : [];
  
  let showMetadataForm = false;
  let newMetadataKey = '';
  let newMetadataValue = '';
  let selectedTemplate = '';
  
  function handleTemplateSelect() {
    if (!selectedTemplate) return;
    
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;
    
    category = template.category;
    notes = template.defaultContent;
    metadataEntries = Object.entries(template.defaultMetadata).map(([key, value]) => ({ 
      key, 
      value: String(value) 
    }));
  }
  
  function addMetadata() {
    if (!newMetadataKey || !newMetadataValue) return;
    
    metadataEntries = [...metadataEntries, { key: newMetadataKey, value: newMetadataValue }];
    newMetadataKey = '';
    newMetadataValue = '';
    showMetadataForm = false;
  }
  
  function removeMetadata(index: number) {
    metadataEntries = metadataEntries.filter((_, i) => i !== index);
  }
  
  function handleSubmit() {
    const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const metadata = Object.fromEntries(metadataEntries.map(e => [e.key, e.value]));
    
    if (document) {
      const updated = updateDocument(
        document,
        { title, patientId, category, notes, tags: tagsArray, metadata },
        'Dokument manuell aktualisiert'
      );
      dispatch('save', updated);
    } else {
      const newDoc = createNewDocument(title, patientId, category, notes);
      newDoc.tags = tagsArray;
      newDoc.metadata = metadata;
      dispatch('save', newDoc);
    }
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
</script>

<div class="document-form">
  <h2>{document ? 'Dokument bearbeiten' : 'Neues Dokument'}</h2>
  
  {#if !document && templates.length > 0}
    <div class="template-selector">
      <label>
        Vorlage verwenden (optional)
        <select bind:value={selectedTemplate} on:change={handleTemplateSelect}>
          <option value="">-- Keine Vorlage --</option>
          {#each templates as template}
            <option value={template.id}>{template.name}</option>
          {/each}
        </select>
      </label>
    </div>
  {/if}
  
  <form on:submit|preventDefault={handleSubmit}>
    <label>
      Titel *
      <input type="text" bind:value={title} required />
    </label>
    
    <label>
      Patient
      <select bind:value={patientId}>
        <option value="">-- Patient auswählen --</option>
        {#each patients as patient}
          <option value={patient.id}>{patient.name}</option>
        {/each}
      </select>
    </label>
    
    <label>
      Kategorie *
      <select bind:value={category} required>
        {#each DOCUMENT_CATEGORIES as cat}
          <option value={cat.value}>{cat.label}</option>
        {/each}
      </select>
    </label>
    
    <label>
      Tags (kommagetrennt)
      <input type="text" bind:value={tags} placeholder="z.B. wichtig, dringend, labor" />
    </label>
    
    <label>
      Inhalt / Notizen
      <textarea bind:value={notes} rows="8"></textarea>
    </label>
    
    <div class="metadata-section">
      <div class="metadata-header">
        <h3>Metadaten</h3>
        <button type="button" class="add-metadata-btn" on:click={() => showMetadataForm = !showMetadataForm}>
          + Feld hinzufügen
        </button>
      </div>
      
      {#if showMetadataForm}
        <div class="metadata-add-form">
          <input type="text" bind:value={newMetadataKey} placeholder="Feldname" />
          <input type="text" bind:value={newMetadataValue} placeholder="Wert" />
          <button type="button" on:click={addMetadata}>Hinzufügen</button>
          <button type="button" on:click={() => showMetadataForm = false}>Abbrechen</button>
        </div>
      {/if}
      
      {#if metadataEntries.length > 0}
        <div class="metadata-list">
          {#each metadataEntries as entry, i}
            <div class="metadata-item">
              <strong>{entry.key}:</strong> {entry.value}
              <button type="button" class="remove-btn" on:click={() => removeMetadata(i)}>×</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>
    
    <div class="form-actions">
      <button type="submit" class="submit-button">Speichern</button>
      <button type="button" class="cancel-button" on:click={handleCancel}>Abbrechen</button>
    </div>
  </form>
</div>

<style>
  .document-form {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 700px;
    margin: 0 auto;
  }
  
  .document-form h2 {
    margin-top: 0;
    margin-bottom: 20px;
    color: #1f2937;
  }
  
  .template-selector {
    margin-bottom: 20px;
    padding: 12px;
    background: #f3f4f6;
    border-radius: 6px;
  }
  
  form label {
    display: block;
    margin-bottom: 16px;
    font-weight: 500;
    color: #374151;
  }
  
  form input,
  form select,
  form textarea {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }
  
  form textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  .metadata-section {
    margin: 20px 0;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
  }
  
  .metadata-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  
  .metadata-header h3 {
    margin: 0;
    font-size: 16px;
    color: #374151;
  }
  
  .add-metadata-btn {
    padding: 6px 12px;
    background: #3b82f6;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  
  .add-metadata-btn:hover {
    background: #2563eb;
  }
  
  .metadata-add-form {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .metadata-add-form input {
    flex: 1;
    margin: 0;
  }
  
  .metadata-add-form button {
    padding: 8px 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
  }
  
  .metadata-add-form button:first-of-type {
    background: #10b981;
    color: white;
  }
  
  .metadata-add-form button:last-of-type {
    background: #6b7280;
    color: white;
  }
  
  .metadata-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .metadata-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .remove-btn {
    padding: 2px 8px;
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    font-weight: bold;
  }
  
  .form-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
  
  .submit-button {
    flex: 1;
    padding: 10px 20px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
  }
  
  .submit-button:hover {
    background: #059669;
  }
  
  .cancel-button {
    flex: 1;
    padding: 10px 20px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 500;
  }
  
  .cancel-button:hover {
    background: #4b5563;
  }
</style>
