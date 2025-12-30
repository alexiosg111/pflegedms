<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { OCRLine, OCRResult, OCRConfidenceStats } from '../types';
  import { 
    calculateVerificationProgress, 
    filterLowConfidenceLines, 
    filterUnverifiedLines,
    autoVerifyHighConfidence,
    getVerifiedText,
    calculateConfidenceStats,
    getConfidenceHistogramData,
    verifyAllLowConfidenceWithSummary,
    getNextLowConfidenceLine
  } from '../ocrService';
  import OCRLineItem from './OCRLineItem.svelte';
  import OCRLineEditor from './OCRLineEditor.svelte';
  
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
  let showHistogram = false;
  let showSummaryModal = false;
  let summaryData: { total: number; autoVerified: number; requiresReview: number } | null = null;
  let histogramFilter: number | null = null;
  
  let imageElement: HTMLImageElement;
  let canvasElement: HTMLCanvasElement;
  let imageContainer: HTMLDivElement;
  
  $: filteredLines = getFilteredLines(lines, filterMode);
  $: progress = calculateVerificationProgress(lines);
  $: stats = calculateConfidenceStats(lines);
  $: histogramData = getConfidenceHistogramData(lines);
  $: selectedLine = selectedLineIndex !== null ? lines[selectedLineIndex] : null;
  $: allVerified = progress.verified === progress.total && progress.total > 0;
  
  function getFilteredLines(allLines: OCRLine[], mode: string): OCRLine[] {
    switch (mode) {
      case 'low-confidence':
        return filterLowConfidenceLines(allLines, 80);
      case 'unverified':
        return filterUnverifiedLines(allLines);
      default:
        return histogramFilter !== null 
          ? allLines.filter(l => {
              const bucket = Math.floor(l.confidence / 10);
              const filterBucket = Math.floor(histogramFilter / 10);
              return bucket === filterBucket;
            })
          : allLines;
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
  
  function handleLineEdit(event: CustomEvent<{ line: OCRLine; nextIndex: number | null }>) {
    const { line, nextIndex } = event.detail;
    const index = lines.findIndex(l => l.id === line.id);
    if (index !== -1) {
      lines[index] = line;
      lines = [...lines];
      drawHighlight();
      if (nextIndex !== null) {
        selectedLineIndex = nextIndex;
        drawHighlight();
      }
    }
  }
  
  function handleLineEditorClose() {
    drawHighlight();
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
    histogramFilter = null;
    const lowConfLines = filterLowConfidenceLines(lines, 80);
    if (lowConfLines.length > 0) {
      const index = lines.findIndex(l => l.id === lowConfLines[0].id);
      selectedLineIndex = index;
      drawHighlight();
    }
  }
  
  function handleVerifyAllWithSummary() {
    const result = verifyAllLowConfidenceWithSummary(lines);
    lines = result.lines;
    summaryData = result.summary;
    showSummaryModal = true;
    lines = [...lines];
    drawHighlight();
  }
  
  function closeSummaryModal() {
    showSummaryModal = false;
    summaryData = null;
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
  
  function handleHistogramClick(bucketValue: number) {
    if (histogramFilter === bucketValue) {
      histogramFilter = null;
      filterMode = 'all';
    } else {
      histogramFilter = bucketValue;
      filterMode = 'all';
    }
  }
  
  function drawHighlight() {
    if (!canvasElement || !imageElement || selectedLineIndex === null) return;
    
    const selectedLine = lines[selectedLineIndex];
    if (!selectedLine) return;
    
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
  
  function getBarColor(value: number): string {
    if (value >= 85) return '#10b981';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
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
    <div class="header-stats">
      <div class="stat-item">
        <span class="stat-label">Durchschnitt</span>
        <span class="stat-value" style="color: {getBarColor(stats.averageConfidence)}">{stats.averageConfidence}%</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Kritisch</span>
        <span class="stat-value" style="color: {stats.criticalCount > 0 ? '#ef4444' : '#10b981'}">{stats.criticalCount}</span>
      </div>
      <button class="btn-histogram" on:click={() => showHistogram = !showHistogram}>
        📊 Histogram {showHistogram ? '▼' : '▶'}
      </button>
    </div>
    <div class="progress-info">
      <div class="progress-bar">
        <div class="progress-fill" style="width: {progress.percentage}%"></div>
      </div>
      <span class="progress-text">{progress.verified} / {progress.total} Zeilen verifiziert ({progress.percentage}%)</span>
    </div>
  </div>
  
  {#if showHistogram}
    <div class="histogram-container">
      <div class="histogram">
        {#each histogramData as bucket}
          <div 
            class="histogram-bar-wrapper"
            class:active={histogramFilter === bucket.value}
            role="button"
            tabindex="0"
            on:click={() => handleHistogramClick(bucket.value)}
            on:keypress={(e) => e.key === 'Enter' && handleHistogramClick(bucket.value)}
          >
            <div class="histogram-bar" style="height: {Math.max(bucket.count * 20, 4)}px; background-color: {getBarColor(bucket.value + 10)}"></div>
            <span class="histogram-label">{bucket.value}</span>
            <span class="histogram-count">{bucket.count}</span>
          </div>
        {/each}
      </div>
      <div class="histogram-legend">
        <span class="legend-item"><span class="legend-dot" style="background: #10b981"></span> >85%</span>
        <span class="legend-item"><span class="legend-dot" style="background: #f59e0b"></span> 60-85%</span>
        <span class="legend-item"><span class="legend-dot" style="background: #ef4444"></span> &lt;60%</span>
      </div>
    </div>
  {/if}
  
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
            on:change={() => histogramFilter = null}
          />
          Alle Zeilen
        </label>
        <label>
          <input 
            type="radio" 
            bind:group={filterMode} 
            value="unverified"
            on:change={() => histogramFilter = null}
          />
          Nur unverifiziert
        </label>
        <label>
          <input 
            type="radio" 
            bind:group={filterMode} 
            value="low-confidence"
            on:change={() => histogramFilter = null}
          />
          Nur niedrige Konfidenz (&lt;80%)
        </label>
      </div>
      
      <div class="stats-summary">
        <div class="stats-row">
          <div class="stat-box high">
            <span class="stat-number">{stats.highConfidenceCount}</span>
            <span class="stat-desc">Sehr hoch (>85%)</span>
          </div>
          <div class="stat-box medium">
            <span class="stat-number">{stats.mediumConfidenceCount}</span>
            <span class="stat-desc">Mittel (60-85%)</span>
          </div>
          <div class="stat-box low">
            <span class="stat-number">{stats.lowConfidenceCount}</span>
            <span class="stat-desc">Niedrig (&lt;60%)</span>
          </div>
        </div>
      </div>
      
      <div class="batch-actions">
        <button class="btn-batch" on:click={handleAutoVerify}>
          ✓ Auto-Verify (>85%)
        </button>
        <button class="btn-batch" on:click={handleSkipToLowConfidence}>
          ⚠️ Zu niedriger Konfidenz springen
        </button>
        <button class="btn-batch" on:click={handleVerifyAllWithSummary}>
          📋 Alle niedrig-konfidenten verifizieren
        </button>
      </div>
      
      <div class="lines-list">
        {#each filteredLines as line, i (line.id)}
          <div data-line-index={lines.findIndex(l => l.id === line.id)}>
            <OCRLineItem 
              {line}
              {lines}
              isSelected={selectedLine?.id === line.id}
              onSelect={handleLineSelect}
              onVerify={handleLineVerify}
              onEdit={() => {}}
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

<OCRLineEditor 
  line={selectedLine || lines[0] || { id: '', text: '', confidence: 0, boundingBox: { x: 0, y: 0, width: 0, height: 0 }, verified: false }}
  {lines}
  isOpen={selectedLineIndex !== null && selectedLine !== undefined}
  on:save={handleLineEdit}
  on:cancel={handleLineEditorClose}
/>

{#if showSummaryModal && summaryData}
  <div class="modal-overlay" on:click={closeSummaryModal} role="dialog" aria-modal="true">
    <div class="modal-content" on:click|stopPropagation role="document">
      <div class="modal-header">
        <h3>Zusammenfassung</h3>
        <button class="close-btn" on:click={closeSummaryModal}>×</button>
      </div>
      <div class="modal-body">
        <div class="summary-stats">
          <div class="summary-item">
            <span class="summary-label">Gesamt:</span>
            <span class="summary-value">{summaryData.total}</span>
          </div>
          <div class="summary-item success">
            <span class="summary-label">Auto-Verifiziert:</span>
            <span class="summary-value">✓ {summaryData.autoVerified}</span>
          </div>
          <div class="summary-item warning">
            <span class="summary-label">Erfordert Prüfung:</span>
            <span class="summary-value">⚠ {summaryData.requiresReview}</span>
          </div>
        </div>
        <p class="summary-text">
          {summaryData.autoVerified} Zeilen mit hoher Konfidenz wurden automatisch verifiziert.
          {summaryData.requiresReview} Zeilen erfordern noch Ihre manuelle Prüfung.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-primary" on:click={closeSummaryModal}>OK</button>
      </div>
    </div>
  </div>
{/if}

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
  
  .header-stats {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .stat-label {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .stat-value {
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .btn-histogram {
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    cursor: pointer;
    font-size: 0.875rem;
    margin-left: auto;
    transition: all 0.2s;
  }
  
  .btn-histogram:hover {
    background: #e5e7eb;
  }
  
  .histogram-container {
    background: white;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .histogram {
    display: flex;
    align-items: flex-end;
    justify-content: center;
    gap: 4px;
    height: 120px;
    padding: 0.5rem 0;
  }
  
  .histogram-bar-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    transition: background 0.2s;
  }
  
  .histogram-bar-wrapper:hover,
  .histogram-bar-wrapper.active {
    background: #f3f4f6;
  }
  
  .histogram-bar {
    width: 24px;
    border-radius: 4px 4px 0 0;
    min-height: 4px;
    transition: height 0.3s ease;
  }
  
  .histogram-label {
    font-size: 0.625rem;
    color: #6b7280;
    margin-top: 4px;
  }
  
  .histogram-count {
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
  }
  
  .histogram-legend {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    margin-top: 0.75rem;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
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
  
  .stats-summary {
    margin-bottom: 1rem;
  }
  
  .stats-row {
    display: flex;
    gap: 0.5rem;
  }
  
  .stat-box {
    flex: 1;
    padding: 0.75rem;
    border-radius: 0.375rem;
    text-align: center;
    display: flex;
    flex-direction: column;
  }
  
  .stat-box.high {
    background: #ecfdf5;
    border: 1px solid #a7f3d0;
  }
  
  .stat-box.medium {
    background: #fffbeb;
    border: 1px solid #fde68a;
  }
  
  .stat-box.low {
    background: #fef2f2;
    border: 1px solid #fecaca;
  }
  
  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #111827;
  }
  
  .stat-desc {
    font-size: 0.625rem;
    color: #6b7280;
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
    padding: 0.75rem 1.5rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-cancel {
    background: white;
    border: 1px solid #d1d5db;
    color: #374151;
  }
  
  .btn-cancel:hover {
    background: #f3f4f6;
  }
  
  .btn-complete {
    flex: 1;
    background: #10b981;
    border: none;
    color: white;
  }
  
  .btn-complete:hover:not(:disabled) {
    background: #059669;
  }
  
  .btn-complete:disabled {
    background: #d1d5db;
    cursor: not-allowed;
  }
  
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
    border-radius: 0.75rem;
    width: 90%;
    max-width: 400px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
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
    padding: 1.5rem;
  }
  
  .summary-stats {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }
  
  .summary-item {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
  }
  
  .summary-item.success {
    background: #ecfdf5;
  }
  
  .summary-item.warning {
    background: #fffbeb;
  }
  
  .summary-label {
    color: #6b7280;
  }
  
  .summary-value {
    font-weight: 600;
  }
  
  .summary-text {
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  .modal-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  
  .btn-primary {
    padding: 0.625rem 1.25rem;
    background: #3b82f6;
    border: none;
    border-radius: 0.375rem;
    color: white;
    font-weight: 500;
    cursor: pointer;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
</style>
