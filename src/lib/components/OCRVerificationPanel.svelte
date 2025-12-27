<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { OCRLine, OCRResult } from '../types';
  import { 
    calculateVerificationProgress, 
    filterLowConfidenceLines, 
    filterUnverifiedLines,
    autoVerifyHighConfidence,
    getVerifiedText
  } from '../ocrService';
  import OCRLineItem from './OCRLineItem.svelte';
  
  const dispatch = createEventDispatcher();
  
  export let imageUrl: string;
  export let ocrResult: OCRResult;
  
  let lines: OCRLine[] = [...ocrResult.lines];
  let selectedLineIndex: number | null = null;
  let filterMode: 'all' | 'low-confidence' | 'unverified' = 'all';
  let imageZoom = 1;
  let imageOffsetX = 0;
  let imageOffsetY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  
  let imageElement: HTMLImageElement;
  let canvasElement: HTMLCanvasElement;
  let imageContainer: HTMLDivElement;
  
  $: filteredLines = getFilteredLines(lines, filterMode);
  $: progress = calculateVerificationProgress(lines);
  $: selectedLine = selectedLineIndex !== null ? lines[selectedLineIndex] : null;
  $: allVerified = progress.verified === progress.total && progress.total > 0;
  
  function getFilteredLines(allLines: OCRLine[], mode: string): OCRLine[] {
    switch (mode) {
      case 'low-confidence':
        return filterLowConfidenceLines(allLines, 80);
      case 'unverified':
        return filterUnverifiedLines(allLines);
      default:
        return allLines;
    }
  }
  
  function handleLineSelect(line: OCRLine) {
    const index = lines.findIndex(l => l.id === line.id);
    selectedLineIndex = index;
    drawHighlight();
  }
  
  function handleLineVerify(line: OCRLine) {
    const index = lines.findIndex(l => l.id === line.id);
    if (index !== -1) {
      lines[index] = { ...lines[index], verified: true };
      lines = [...lines];
      moveToNextUnverified();
    }
  }
  
  function handleLineEdit(line: OCRLine, newText: string) {
    const index = lines.findIndex(l => l.id === line.id);
    if (index !== -1) {
      lines[index] = { 
        ...lines[index], 
        correctedText: newText,
        verified: false
      };
      lines = [...lines];
    }
  }
  
  function moveToNextUnverified() {
    const unverified = lines.findIndex((l, i) => i > (selectedLineIndex || -1) && !l.verified);
    if (unverified !== -1) {
      selectedLineIndex = unverified;
      scrollToLine(unverified);
      drawHighlight();
    } else {
      const firstUnverified = lines.findIndex(l => !l.verified);
      if (firstUnverified !== -1) {
        selectedLineIndex = firstUnverified;
        scrollToLine(firstUnverified);
        drawHighlight();
      }
    }
  }
  
  function scrollToLine(index: number) {
    const lineElement = document.querySelector(`[data-line-index="${index}"]`);
    if (lineElement) {
      lineElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
  
  function handleAutoVerify() {
    lines = autoVerifyHighConfidence(lines, 85);
    lines = [...lines];
    drawHighlight();
  }
  
  function handleSkipToLowConfidence() {
    filterMode = 'low-confidence';
    const lowConfLines = filterLowConfidenceLines(lines, 80);
    if (lowConfLines.length > 0) {
      const index = lines.findIndex(l => l.id === lowConfLines[0].id);
      selectedLineIndex = index;
      drawHighlight();
    }
  }
  
  function handleComplete() {
    const verifiedText = getVerifiedText(lines);
    dispatch('complete', { lines, verifiedText });
  }
  
  function handleCancel() {
    dispatch('cancel');
  }
  
  function handleZoomIn() {
    imageZoom = Math.min(imageZoom + 0.25, 3);
    drawHighlight();
  }
  
  function handleZoomOut() {
    imageZoom = Math.max(imageZoom - 0.25, 0.5);
    drawHighlight();
  }
  
  function handleResetZoom() {
    imageZoom = 1;
    imageOffsetX = 0;
    imageOffsetY = 0;
    drawHighlight();
  }
  
  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    dragStartX = e.clientX - imageOffsetX;
    dragStartY = e.clientY - imageOffsetY;
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (isDragging) {
      imageOffsetX = e.clientX - dragStartX;
      imageOffsetY = e.clientY - dragStartY;
      drawHighlight();
    }
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  function drawHighlight() {
    if (!canvasElement || !imageElement || !selectedLine) return;
    
    const ctx = canvasElement.getContext('2d');
    if (!ctx) return;
    
    canvasElement.width = imageContainer.clientWidth;
    canvasElement.height = imageContainer.clientHeight;
    
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    const imgAspectRatio = imageElement.naturalWidth / imageElement.naturalHeight;
    const containerAspectRatio = canvasElement.width / canvasElement.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspectRatio > containerAspectRatio) {
      drawWidth = canvasElement.width;
      drawHeight = drawWidth / imgAspectRatio;
      drawX = 0;
      drawY = (canvasElement.height - drawHeight) / 2;
    } else {
      drawHeight = canvasElement.height;
      drawWidth = drawHeight * imgAspectRatio;
      drawX = (canvasElement.width - drawWidth) / 2;
      drawY = 0;
    }
    
    const scaleX = drawWidth / imageElement.naturalWidth;
    const scaleY = drawHeight / imageElement.naturalHeight;
    
    const box = selectedLine.boundingBox;
    const x = drawX + (box.x * scaleX * imageZoom) + imageOffsetX;
    const y = drawY + (box.y * scaleY * imageZoom) + imageOffsetY;
    const width = box.width * scaleX * imageZoom;
    const height = box.height * scaleY * imageZoom;
    
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, width, height);
    
    ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
    ctx.fillRect(x, y, width, height);
  }
  
  onMount(() => {
    if (lines.length > 0) {
      selectedLineIndex = 0;
    }
    
    if (imageElement) {
      imageElement.onload = () => {
        drawHighlight();
      };
    }
  });
  
  onDestroy(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });
</script>

<svelte:window 
  on:mousemove={handleMouseMove}
  on:mouseup={handleMouseUp}
/>

<div class="verification-panel">
  <div class="panel-header">
    <h2>OCR-Text Verifizierung</h2>
    <div class="progress-info">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress.percentage}%"></div>
      </div>
      <span class="progress-text">{progress.verified} / {progress.total} Zeilen verifiziert ({progress.percentage}%)</span>
    </div>
  </div>
  
  <div class="panel-content">
    <div class="left-panel">
      <div class="image-controls">
        <button on:click={handleZoomIn} title="Vergrößern">🔍+</button>
        <button on:click={handleZoomOut} title="Verkleinern">🔍-</button>
        <button on:click={handleResetZoom} title="Zurücksetzen">↺</button>
        <span class="zoom-level">{Math.round(imageZoom * 100)}%</span>
      </div>
      
      <div 
        class="image-container" 
        bind:this={imageContainer}
        on:mousedown={handleMouseDown}
        role="img"
        aria-label="Dokument Vorschau"
        tabindex="0"
      >
        <img 
          bind:this={imageElement}
          src={imageUrl} 
          alt="Dokumentscan"
          style="transform: scale({imageZoom}) translate({imageOffsetX}px, {imageOffsetY}px);"
          on:load={drawHighlight}
        />
        <canvas 
          bind:this={canvasElement}
          class="highlight-canvas"
        ></canvas>
      </div>
    </div>
    
    <div class="right-panel">
      <div class="filter-controls">
        <label>
          <input 
            type="radio" 
            bind:group={filterMode} 
            value="all"
          />
          Alle Zeilen
        </label>
        <label>
          <input 
            type="radio" 
            bind:group={filterMode} 
            value="unverified"
          />
          Nur unverifiziert
        </label>
        <label>
          <input 
            type="radio" 
            bind:group={filterMode} 
            value="low-confidence"
          />
          Nur niedrige Konfidenz (&lt;80%)
        </label>
      </div>
      
      <div class="batch-actions">
        <button class="btn-batch" on:click={handleAutoVerify}>
          ✓ Hohe Konfidenz verifizieren (&gt;85%)
        </button>
        <button class="btn-batch" on:click={handleSkipToLowConfidence}>
          ⚠️ Zu niedriger Konfidenz springen
        </button>
      </div>
      
      <div class="lines-list">
        {#each filteredLines as line, i (line.id)}
          <div data-line-index={lines.findIndex(l => l.id === line.id)}>
            <OCRLineItem 
              {line}
              isSelected={selectedLine?.id === line.id}
              onSelect={handleLineSelect}
              onVerify={handleLineVerify}
              onEdit={handleLineEdit}
            />
          </div>
        {/each}
      </div>
      
      <div class="panel-actions">
        <button class="btn-cancel" on:click={handleCancel}>Abbrechen</button>
        <button 
          class="btn-complete" 
          on:click={handleComplete}
          disabled={!allVerified}
        >
          {allVerified ? 'Verifizierung abschließen' : 'Alle Zeilen verifizieren erforderlich'}
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .verification-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: #f9fafb;
  }
  
  .panel-header {
    padding: 1.5rem;
    background: white;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .panel-header h2 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    color: #111827;
  }
  
  .progress-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .progress-bar {
    width: 100%;
    height: 1rem;
    background: #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s ease;
  }
  
  .progress-text {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .panel-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    flex: 1;
    overflow: hidden;
    padding: 1rem;
  }
  
  .left-panel, .right-panel {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    overflow: hidden;
  }
  
  .image-controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    align-items: center;
  }
  
  .image-controls button {
    padding: 0.5rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .image-controls button:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
  
  .zoom-level {
    font-size: 0.875rem;
    color: #6b7280;
    margin-left: auto;
  }
  
  .image-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    cursor: move;
  }
  
  .image-container img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    user-select: none;
    -webkit-user-drag: none;
  }
  
  .highlight-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  
  .filter-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }
  
  .filter-controls label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .batch-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  .btn-batch {
    padding: 0.625rem 1rem;
    border: 1px solid #d1d5db;
    background: white;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    text-align: left;
  }
  
  .btn-batch:hover {
    background: #f3f4f6;
    border-color: #3b82f6;
  }
  
  .lines-list {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }
  
  .panel-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
  
  .btn-cancel, .btn-complete {
    flex: 1;
    padding: 0.75rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-cancel {
    background: #e5e7eb;
    color: #374151;
  }
  
  .btn-cancel:hover {
    background: #d1d5db;
  }
  
  .btn-complete {
    background: #10b981;
    color: white;
  }
  
  .btn-complete:hover:not(:disabled) {
    background: #059669;
  }
  
  .btn-complete:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
</style>
