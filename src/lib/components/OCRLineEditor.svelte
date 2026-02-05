<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { OCRLine } from '../types';
  import { getConfidenceColor, getConfidenceLabel, getNextLowConfidenceLine, applyQuickFix } from '../ocrService';

  export let line: OCRLine;
  export let lines: OCRLine[] = [];
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let editText = '';
  let originalText = '';
  let undoStack: string[] = [];
  let redoStack: string[] = [];

  $: if (isOpen && line) {
    // Only reset if it's a different line
    if (originalText !== line.text) {
      editText = line.correctedText || line.text;
      originalText = line.text;
      undoStack = [];
      redoStack = [];
    }
  }

  function handleTextChange() {
    if (undoStack.length === 0 || undoStack[undoStack.length - 1] !== editText) {
      undoStack = [...undoStack, editText];
      redoStack = [];
    }
  }

  function handleUndo() {
    if (undoStack.length > 0) {
      const current = editText;
      const previous = undoStack.pop();
      if (previous !== undefined) {
        redoStack.push(current);
        editText = previous;
        undoStack = undoStack; // trigger reactivity
        redoStack = redoStack;
      }
    }
  }

  function handleRedo() {
    if (redoStack.length > 0) {
      const current = editText;
      const next = redoStack.pop();
      if (next !== undefined) {
        undoStack.push(current);
        editText = next;
        undoStack = undoStack;
        redoStack = redoStack;
      }
    }
  }

  function handleQuickFix(fixType: string) {
    undoStack.push(editText);
    undoStack = undoStack;
    editText = applyQuickFix(editText, fixType);
    redoStack = [];
  }

  function handleCopyOriginal() {
    navigator.clipboard.writeText(originalText);
  }

  function handleSave() {
    dispatch('save', { 
      line: { ...line, correctedText: editText, verified: true },
      nextIndex: null
    });
  }

  function handleSaveAndNext() {
    const currentIndex = lines.findIndex(l => l.id === line.id);
    const nextIndex = getNextLowConfidenceLine(lines, currentIndex);
    
    dispatch('save', { 
      line: { ...line, correctedText: editText, verified: true },
      nextIndex
    });
  }

  function handleCancel() {
    dispatch('cancel');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && isOpen) {
      handleCancel();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      handleUndo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
  }

  $: confidenceColor = line ? getConfidenceColor(line.confidence) : '#ccc';
  $: confidenceLabel = line ? getConfidenceLabel(line.confidence) : 'N/A';
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && line}
  <div class="modal-overlay" on:click={handleCancel} role="dialog" aria-modal="true">
    <div class="modal-content" on:click|stopPropagation role="document">
      <div class="modal-header">
        <h3>OCR Zeilen-Editor</h3>
        <button class="close-btn" on:click={handleCancel} aria-label="Schließen">×</button>
      </div>

      <div class="modal-body">
        <div class="section">
          <div class="section-header">
            <h4>Original-Text (schreibgeschützt)</h4>
            <button class="btn-small" on:click={handleCopyOriginal}>📋 Kopieren</button>
          </div>
          <div class="original-text">{originalText}</div>
        </div>

        <div class="section">
          <h4>Konfidenz-Information</h4>
          <div class="confidence-badge" style="background-color: {confidenceColor}">
            {confidenceLabel} ({Math.round(line.confidence)}%)
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h4>Text bearbeiten</h4>
            <div class="history-controls">
              <button class="btn-icon" on:click={handleUndo} disabled={undoStack.length === 0} title="Rückgängig (Ctrl+Z)">↩</button>
              <button class="btn-icon" on:click={handleRedo} disabled={redoStack.length === 0} title="Wiederholen (Ctrl+Y)">↪</button>
            </div>
          </div>
          <textarea
            class="editor-textarea"
            bind:value={editText}
            on:input={handleTextChange}
            rows="5"
            placeholder="Text hier bearbeiten..."
            autofocus
          ></textarea>
          <div class="quick-fixes">
            <span>Schnellfixes:</span>
            <button class="btn-fix" on:click={() => handleQuickFix('letter-number')}>l→I, O→0</button>
            <button class="btn-fix" on:click={() => handleQuickFix('common-ocr')}>Häufige</button>
            <button class="btn-fix" on:click={() => handleQuickFix('special-chars')}>Sonderzeichen</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={handleCancel}>
          Abbrechen
        </button>
        <div class="footer-right">
          <button class="btn-primary" on:click={handleSaveAndNext}>
            Speichern & Weiter
          </button>
          <button class="btn-primary" on:click={handleSave}>
            Speichern
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 0.5rem;
    width: 90%;
    max-width: 600px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.125rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .section h4 {
    margin: 0;
    font-size: 0.875rem;
    color: #4b5563;
  }

  .original-text {
    background: #f3f4f6;
    padding: 0.75rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    white-space: pre-wrap;
    border: 1px solid #e5e7eb;
  }

  .confidence-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.25rem;
  }

  .editor-textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    resize: vertical;
    font-family: inherit;
  }

  .history-controls {
    display: flex;
    gap: 0.25rem;
  }

  .quick-fixes {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .quick-fixes span {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .btn-fix {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .btn-fix:hover {
    background: #e5e7eb;
  }

  .btn-icon {
    background: none;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .btn-icon:disabled {
    opacity: 0.5;
    cursor: default;
  }

  .btn-small {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    padding: 1rem;
    border-top: 1px solid #e5e7eb;
  }

  .footer-right {
    display: flex;
    gap: 0.5rem;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .btn-primary:hover {
    background: #2563eb;
  }

  .btn-secondary {
    background: white;
    border: 1px solid #d1d5db;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: #f9fafb;
  }
</style>
