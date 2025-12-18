<script lang="ts">
  import type { OCRResult } from '../services/ocrEnhancedService';

  export let result: OCRResult;
  export let showDetails = false;

  function getConfidenceColor(confidence: number): string {
    if (confidence >= 95) return 'bg-green-100 text-green-800';
    if (confidence >= 85) return 'bg-yellow-100 text-yellow-800';
    if (confidence >= 75) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  }

  function getConfidenceIcon(confidence: number): string {
    if (confidence >= 95) return '✓';
    if (confidence >= 85) return '⚠';
    return '❌';
  }
</script>

<div class="space-y-2">
  <!-- Confidence Badge -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-gray-700">OCR Confidence</span>
    <div class={`px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1 ${getConfidenceColor(result.confidence)}`}>
      <span>{getConfidenceIcon(result.confidence)}</span>
      <span>{result.confidence.toFixed(1)}%</span>
    </div>
  </div>

  <!-- Confidence Bar -->
  <div class="w-full bg-gray-200 rounded-full h-2">
    <div
      class="h-2 rounded-full transition-all"
      class:bg-green-500={result.confidence >= 95}
      class:bg-yellow-500={result.confidence >= 85 && result.confidence < 95}
      class:bg-orange-500={result.confidence >= 75 && result.confidence < 85}
      class:bg-red-500={result.confidence < 75}
      style={`width: ${result.confidence}%`}
    />
  </div>

  <!-- Review Status -->
  {#if result.requiresReview}
    <div class="bg-orange-50 border border-orange-200 rounded p-2">
      <p class="text-xs text-orange-800">
        ⚠️ <strong>Überprüfung erforderlich:</strong> Die Erkennungsgenauigkeit liegt unter 85%. 
        Bitte überprüfen Sie den OCR-Text vor dem Speichern.
      </p>
    </div>
  {/if}

  <!-- Details Toggle -->
  {#if showDetails}
    <button
      on:click={() => (showDetails = !showDetails)}
      class="text-xs text-blue-600 hover:text-blue-700"
    >
      {showDetails ? '⬆ Details ausblenden' : '⬇ Details anzeigen'}
    </button>

    {#if showDetails}
      <div class="bg-gray-50 rounded p-3 space-y-1 text-xs text-gray-700">
        <p><strong>Sprache:</strong> {result.language}</p>
        <p><strong>Text-Blöcke:</strong> {result.blockCount}</p>
        <p><strong>Status:</strong> {result.requiresReview ? 'Überprüfung ausstehend' : 'Automatisch akzeptiert'}</p>
      </div>
    {/if}
  {/if}
</div>
