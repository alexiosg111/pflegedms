<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { OCRLine } from '../types';
  import { getConfidenceColor, getConfidenceLabel } from '../ocrService';
  
  export let line: OCRLine;
  export let lines: OCRLine[] = [];
  export let isSelected: boolean = false;
  export let onSelect: (line: OCRLine) => void;
  export let onVerify: (line: OCRLine) => void;
  export let onEdit: (line: OCRLine, newText: string) => void;
  
  let showTooltip = false;
  
  function handleClick() {
    onSelect(line);
  }
  
  function handleVerify(e: MouseEvent | KeyboardEvent) {
    e.stopPropagation();
    e.preventDefault();
    onVerify(line);
  }
  
  $: confidenceColor = getConfidenceColor(line.confidence);
  $: confidenceLabel = getConfidenceLabel(line.confidence);
  $: displayText = line.correctedText || line.text;
  $: wordConfidenceAvg = line.wordConfidences 
    ? Math.round(line.wordConfidences.reduce((a, b) => a + b, 0) / line.wordConfidences.length)
    : null;
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
        <span class="status-icon verified" title="Verifiziert">✓</span>
      {:else}
        <span class="status-icon pending" title="Unverifiziert">⏳</span>
      {/if}
    </span>
    <div 
      class="confidence-wrapper"
      on:mouseenter={() => showTooltip = true}
      on:mouseleave={() => showTooltip = false}
      role="tooltip"
    >
      <span 
        class="confidence-badge" 
        style="background-color: {confidenceColor};"
      >
        {confidenceLabel} ({Math.round(line.confidence)}%)
      </span>
      {#if showTooltip}
        <div class="tooltip">
          <div class="tooltip-row">
            <span>Zeilen-Konfidenz:</span>
            <strong>{Math.round(line.confidence)}%</strong>
          </div>
          {#if wordConfidenceAvg !== null}
            <div class="tooltip-row">
              <span>Wort-Durchschnitt:</span>
              <strong>{wordConfidenceAvg}%</strong>
            </div>
          {/if}
          {#if line.wordConfidences && line.wordConfidences.length > 0}
            <div class="word-confidences">
              <span>Wort-Konfidenzen:</span>
              <div class="word-bars">
                {#each line.wordConfidences as wc}
                  <div 
                    class="word-bar"
                    style="width: {wc}%; background-color: {getConfidenceColor(wc)}"
                    title="{Math.round(wc)}%"
                  ></div>
                {/each}
              </div>
            </div>
          {/if}
          {#if line.alternatives && line.alternatives.length > 0}
            <div class="tooltip-alternatives">
              <span>Alternativen:</span>
              <div class="alternatives-list">
                {#each line.alternatives.slice(0, 3) as alt}
                  <span class="alternative">{alt}</span>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
    {#if line.correctedText}
      <span class="corrected-badge" title="Korrigiert">✏️</span>
    {/if}
  </div>
  
  <div class="line-content">
    <span class:text-corrected={line.correctedText}>{displayText}</span>
    {#if !line.verified}
      <button 
        class="btn-verify" 
        on:click={handleVerify} 
        title="Verifizieren"
      >
        ✓
      </button>
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
    border-color: #86efac;
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
  
  .confidence-wrapper {
    position: relative;
    display: inline-block;
  }
  
  .confidence-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }
  
  .tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    min-width: 200px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    margin-bottom: 0.5rem;
  }
  
  .tooltip::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: #1f2937;
  }
  
  .tooltip-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.375rem;
  }
  
  .tooltip-row:last-child {
    margin-bottom: 0;
  }
  
  .tooltip-row span {
    color: #9ca3af;
  }
  
  .word-confidences {
    margin-top: 0.5rem;
  }
  
  .word-confidences span {
    display: block;
    margin-bottom: 0.25rem;
    color: #9ca3af;
  }
  
  .word-bars {
    display: flex;
    gap: 2px;
    height: 6px;
  }
  
  .word-bar {
    height: 100%;
    border-radius: 2px;
    min-width: 2px;
    flex: 1;
  }
  
  .tooltip-alternatives {
    margin-top: 0.5rem;
    border-top: 1px solid #374151;
    padding-top: 0.5rem;
  }
  
  .tooltip-alternatives span {
    display: block;
    margin-bottom: 0.25rem;
    color: #9ca3af;
  }
  
  .alternatives-list {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }
  
  .alternative {
    color: #d1d5db;
    font-size: 0.7rem;
  }
  
  .corrected-badge {
    font-size: 0.875rem;
  }
  
  .line-content {
    font-size: 0.95rem;
    color: #374151;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
  }
  
  .text-corrected {
    color: #059669;
    font-weight: 500;
    flex: 1;
  }
  
  .btn-verify {
    padding: 0.375rem 0.625rem;
    border: none;
    background: #10b981;
    color: white;
    cursor: pointer;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  
  .btn-verify:hover {
    background: #059669;
  }
</style>
