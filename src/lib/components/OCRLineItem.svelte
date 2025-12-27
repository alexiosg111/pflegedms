<script lang="ts">
  import type { OCRLine } from '../types';
  import { getConfidenceColor, getConfidenceLabel } from '../ocrService';
  
  export let line: OCRLine;
  export let isSelected: boolean = false;
  export let onSelect: (line: OCRLine) => void;
  export let onVerify: (line: OCRLine) => void;
  export let onEdit: (line: OCRLine, newText: string) => void;
  
  let isEditing = false;
  let editText = line.correctedText || line.text;
  
  function handleClick() {
    onSelect(line);
  }
  
  function handleEdit() {
    isEditing = true;
  }
  
  function handleSave() {
    onEdit(line, editText);
    isEditing = false;
  }
  
  function handleCancel() {
    editText = line.correctedText || line.text;
    isEditing = false;
  }
  
  function handleVerify() {
    onVerify(line);
  }
  
  $: confidenceColor = getConfidenceColor(line.confidence);
  $: confidenceLabel = getConfidenceLabel(line.confidence);
  $: displayText = line.correctedText || line.text;
</script>

<div 
  class="line-item" 
  class:selected={isSelected}
  class:verified={line.verified}
  on:click={handleClick}
  on:keypress={(e) => e.key === 'Enter' && handleClick()}
  role="button"
  tabindex="0"
>
  <div class="line-header">
    <span class="line-status">
      {#if line.verified}
        <span class="status-icon verified">✓</span>
      {:else}
        <span class="status-icon pending">⏳</span>
      {/if}
    </span>
    <span 
      class="confidence-badge" 
      style="background-color: {confidenceColor};"
      title="Konfidenz: {Math.round(line.confidence)}%"
    >
      {confidenceLabel} ({Math.round(line.confidence)}%)
    </span>
  </div>
  
  <div class="line-content">
    {#if isEditing}
      <div class="edit-form">
        <input 
          type="text" 
          bind:value={editText}
          class="edit-input"
          on:click|stopPropagation
        />
        <div class="edit-actions">
          <button class="btn-save" on:click|stopPropagation={handleSave}>Speichern</button>
          <button class="btn-cancel" on:click|stopPropagation={handleCancel}>Abbrechen</button>
        </div>
      </div>
    {:else}
      <div class="text-display">
        <span class:corrected={line.correctedText}>{displayText}</span>
        {#if !line.verified}
          <div class="quick-actions">
            <button class="btn-edit" on:click|stopPropagation={handleEdit} title="Bearbeiten">✏️</button>
            <button class="btn-verify" on:click|stopPropagation={handleVerify} title="Verifizieren">✓</button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .line-item {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    background: white;
  }
  
  .line-item:hover {
    border-color: #3b82f6;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .line-item.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
  
  .line-item.verified {
    opacity: 0.7;
    background-color: #f0fdf4;
  }
  
  .line-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .line-status {
    font-size: 1.2rem;
  }
  
  .status-icon.verified {
    color: #10b981;
  }
  
  .status-icon.pending {
    opacity: 0.5;
  }
  
  .confidence-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .line-content {
    font-size: 0.95rem;
    color: #374151;
  }
  
  .text-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  
  .text-display span.corrected {
    color: #059669;
    font-weight: 500;
  }
  
  .quick-actions {
    display: flex;
    gap: 0.25rem;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  .line-item:hover .quick-actions {
    opacity: 1;
  }
  
  .btn-edit, .btn-verify {
    padding: 0.25rem 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: background 0.2s;
  }
  
  .btn-edit:hover {
    background: #dbeafe;
  }
  
  .btn-verify:hover {
    background: #dcfce7;
  }
  
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .edit-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.95rem;
  }
  
  .edit-actions {
    display: flex;
    gap: 0.5rem;
  }
  
  .btn-save, .btn-cancel {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-save {
    background-color: #10b981;
    color: white;
  }
  
  .btn-save:hover {
    background-color: #059669;
  }
  
  .btn-cancel {
    background-color: #e5e7eb;
    color: #374151;
  }
  
  .btn-cancel:hover {
    background-color: #d1d5db;
  }
</style>
