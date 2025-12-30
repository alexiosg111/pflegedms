<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { OCRLine } from '../types';
  import { getConfidenceColor, getConfidenceLabel, applyQuickFix, getNextLowConfidenceLine } from '../ocrService';

  export let line: OCRLine;
  export let lines: OCRLine[] = [];
  export let isOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let editText = line.correctedText || line.text;
  let originalText = line.text;
  let undoStack: string[] = [];
  let redoStack: string[] = [];
  let characterCount = 0;
  let showAlternatives = false;
  let selectedAlternative: string | null = null;

  $: {
    characterCount = editText.length;
  }

  $: confidenceColor = getConfidenceColor(line.confidence);
  $: confidenceLabel = getConfidenceLabel(line.confidence);
  $: wordCount = editText.trim() ? editText.trim().split(/\s+/).length : 0;

  function handleTextChange() {
    if (undoStack[undoStack.length - 1] !== editText) {
      undoStack = [...undoStack, editText];
      redoStack = [];
    }
  }

  function handleUndo() {
    if (undoStack.length > 0) {
      const previous = undoStack[undoStack.length - 1];
      redoStack = [...redoStack, editText];
      editText = previous;
      undoStack = undoStack.slice(0, -1);
    }
  }

  function handleRedo() {
    if (redoStack.length > 0) {
      const next = redoStack[redoStack.length - 1];
      undoStack = [...undoStack, editText];
      editText = next;
      redoStack = redoStack.slice(0, -1);
    }
  }

  function handleCopyOriginal() {
    navigator.clipboard.writeText(originalText);
  }

  function handleQuickFix(fixType: string) {
    const fixed = applyQuickFix(editText, fixType);
    undoStack = [...undoStack, editText];
    editText = fixed;
    redoStack = [];
  }

  function handleApplyAlternative(alternative: string) {
    undoStack = [...undoStack, editText];
    editText = alternative;
    selectedAlternative = alternative;
    redoStack = [];
  }

  function handleAutoCorrect() {
    if (line.confidence >= 85) {
      undoStack = [...undoStack, editText];
      editText = applyQuickFix(editText, 'common-ocr');
      redoStack = [];
    }
  }

  function handleSaveAndNext() {
    const currentIndex = lines.findIndex(l => l.id === line.id);
    const nextIndex = getNextLowConfidenceLine(lines, currentIndex);
    
    dispatch('save', { 
      line: { ...line, correctedText: editText, verified: true },
      nextIndex
    });
  }

  function handleSaveAndClose() {
    dispatch('save', { 
      line: { ...line, correctedText: editText, verified: true },
      nextIndex: null
    });
  }

  function handleDiscard() {
    dispatch('cancel');
  }

  function handleClose() {
    dispatch('cancel');
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
      e.preventDefault();
      if (e.shiftKey) {
        handleRedo();
      } else {
        handleUndo();
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    }
  }

  $: if (isOpen) {
    editText = line.correctedText || line.text;
    originalText = line.text;
    undoStack = [];
    redoStack = [];
    selectedAlternative = null;
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <div class="modal-overlay" on:click={handleClose} role="dialog" aria-modal="true">
    <div class="modal-content" on:click|stopPropagation role="document">
      <div class="modal-header">
        <h3>OCR Zeilen-Editor</h3>
        <button class="close-btn" on:click={handleClose} aria-label="Schließen">×</button>
      </div>

      <div class="modal-body">
        <div class="left-column">
          <div class="context-section">
            <h4>Original-Text (schreibgeschützt)</h4>
            <div class="original-text">{originalText}</div>
            <div class="context-actions">
              <button class="btn-small" on:click={handleCopyOriginal} title="Original-Text kopieren">
                📋 Kopieren
              </button>
            </div>
          </div>

          {#if line.alternatives && line.alternatives.length > 0}
            <div class="alternatives-section">
              <h4>
                Vorschläge
                <button 
                  class="btn-toggle" 
                  on:click={() => showAlternatives = !showAlternatives}
                  aria-expanded={showAlternatives}
                >
                  {showAlternatives ? '▼' : '▶'}
                </button>
              </h4>
              {#if showAlternatives}
                <div class="alternatives-list">
                  {#each line.alternatives.slice(0, 5) as alt}
                    <button 
                      class="alternative-btn"
                      class:selected={selectedAlternative === alt}
                      on:click={() => handleApplyAlternative(alt)}
                    >
                      {alt}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}

          <div class="confidence-section">
            <h4>Konfidenz-Information</h4>
            <div class="confidence-info">
              <div class="confidence-badge" style="background-color: {confidenceColor}">
                {confidenceLabel} ({Math.round(line.confidence)}%)
              </div>
              {#if line.wordConfidences && line.wordConfidences.length > 0}
                <div class="word-confidences">
                  <span class="word-label">Wort-Konfidenzen:</span>
                  <div class="word-bars">
                    {#each line.wordConfidences as wc}
                      <div 
                        class="word-bar"
                        style="width: {wc}%; background-color: {getConfidenceColor(wc)}"
                        title="{Math.round(wc)}%"
                      ></div>
                    {/each}
                  </div>
                  <span class="word-avg">
                    Ø {Math.round(line.wordConfidences.reduce((a, b) => a + b, 0) / line.wordConfidences.length)}%
                  </span>
                </div>
              {/if}
            </div>
          </div>
        </div>

        <div class="right-column">
          <div class="editor-section">
            <div class="editor-toolbar">
              <div class="toolbar-group">
                <button 
                  class="toolbar-btn" 
                  on:click={handleUndo} 
                  disabled={undoStack.length === 0}
                  title="Rückgängig (Ctrl+Z)"
                >
                  ↩
                </button>
                <button 
                  class="toolbar-btn" 
                  on:click={handleRedo} 
                  disabled={redoStack.length === 0}
                  title="Wiederholen (Ctrl+Y)"
                >
                  ↪
                </button>
              </div>
              <div class="toolbar-group">
                <button class="toolbar-btn" on:click={() => handleQuickFix('common-ocr')} title="Häufige OCR-Fehler korrigieren">
                  🔧 Fix
                </button>
                <button 
                  class="toolbar-btn" 
                  on:click={handleAutoCorrect}
                  disabled={line.confidence < 85}
                  title={line.confidence < 85 ? 'Konfidenz zu niedrig für Auto-Correct' : 'Auto-Correct anwenden'}
                >
                  ✨ Auto
                </button>
              </div>
              <div class="char-counter">
                {characterCount} Zeichen | {wordCount} Wörter
              </div>
            </div>

            <textarea
              class="editor-textarea"
              bind:value={editText}
              on:input={handleTextChange}
              rows="6"
              placeholder="Text hier bearbeiten..."
            ></textarea>
          </div>

          <div class="quick-fixes">
            <span>Schnellfixes:</span>
            <button class="quick-fix-btn" on:click={() => handleQuickFix('letter-number')}>l→I, O→0</button>
            <button class="quick-fix-btn" on:click={() => handleQuickFix('common-ocr')}>rn→m, vv→w</button>
            <button class="quick-fix-btn" on:click={() => handleQuickFix('special-chars')}>Sonderzeichen</button>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-secondary" on:click={handleDiscard}>
          Änderungen verwerfen
        </button>
        <div class="footer-right">
          <button class="btn-primary" on:click={handleSaveAndNext}>
            Speichern & Weiter
          </button>
          <button class="btn-primary" on:click={handleSaveAndClose}>
            Speichern & Schließen
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
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  .modal-content {
    background: white;
    border-radius: 0.75rem;
    width: 90%;
    max-width: 900px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #111827;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    line-height: 1;
    transition: color 0.2s;
  }

  .close-btn:hover {
    color: #111827;
  }

  .modal-body {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 1.5rem;
    padding: 1.5rem;
    overflow-y: auto;
    flex: 1;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .context-section,
  .alternatives-section,
  .confidence-section {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
  }

  .context-section h4,
  .alternatives-section h4,
  .confidence-section h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.875rem;
    color: #374151;
    font-weight: 600;
  }

  .original-text {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    padding: 0.75rem;
    font-size: 0.875rem;
    color: #6b7280;
    min-height: 60px;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .context-actions {
    margin-top: 0.5rem;
    display: flex;
    justify-content: flex-end;
  }

  .btn-small {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
    background: #e5e7eb;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-small:hover {
    background: #d1d5db;
  }

  .alternatives-section h4 {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .btn-toggle {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .alternatives-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .alternative-btn {
    padding: 0.5rem;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.25rem;
    cursor: pointer;
    text-align: left;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .alternative-btn:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }

  .alternative-btn.selected {
    border-color: #10b981;
    background: #ecfdf5;
  }

  .confidence-info {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .confidence-badge {
    display: inline-block;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
  }

  .word-confidences {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .word-label {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .word-bars {
    display: flex;
    gap: 2px;
    height: 8px;
  }

  .word-bar {
    height: 100%;
    border-radius: 2px;
    min-width: 2px;
  }

  .word-avg {
    font-size: 0.75rem;
    color: #6b7280;
    text-align: right;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .editor-section {
    background: #f9fafb;
    border-radius: 0.5rem;
    padding: 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.75rem;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    gap: 0.25rem;
  }

  .toolbar-btn {
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }

  .toolbar-btn:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .toolbar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .char-counter {
    margin-left: auto;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .editor-textarea {
    width: 100%;
    flex: 1;
    min-height: 150px;
    padding: 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.95rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.2s;
  }

  .editor-textarea:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .quick-fixes {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .quick-fixes span {
    font-size: 0.75rem;
    color: #6b7280;
  }

  .quick-fix-btn {
    padding: 0.375rem 0.625rem;
    font-size: 0.75rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .quick-fix-btn:hover {
    background: #f3f4f6;
    border-color: #3b82f6;
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    background: #f9fafb;
    border-radius: 0 0 0.75rem 0.75rem;
  }

  .footer-right {
    display: flex;
    gap: 0.75rem;
  }

  .btn-secondary {
    padding: 0.625rem 1.25rem;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  .btn-primary {
    padding: 0.625rem 1.25rem;
    background: #3b82f6;
    border: none;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary:hover {
    background: #2563eb;
  }
</style>
