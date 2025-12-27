<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { extractText, initializeOCRWorker } from '../ocrService';
  import type { OCRResult } from '../types';
  
  const dispatch = createEventDispatcher();
  
  export let language: string = 'deu+eng';
  
  let fileInput: HTMLInputElement;
  let isProcessing = false;
  let progress = 0;
  let selectedFile: File | null = null;
  let imagePreview: string | null = null;
  let ocrResult: OCRResult | null = null;
  let error: string | null = null;
  
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
  
  async function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (!files || files.length === 0) return;
    
    selectedFile = files[0];
    error = null;
    
    if (!supportedFormats.includes(selectedFile.type)) {
      error = 'Nicht unterstütztes Dateiformat. Bitte verwenden Sie JPG, PNG, BMP oder TIFF.';
      selectedFile = null;
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  }
  
  async function handleProcessOCR() {
    if (!selectedFile || !imagePreview) return;
    
    isProcessing = true;
    progress = 0;
    error = null;
    
    try {
      await initializeOCRWorker(language);
      
      const progressInterval = setInterval(() => {
        if (progress < 90) {
          progress += 5;
        }
      }, 500);
      
      ocrResult = await extractText(imagePreview, language, (p) => {
        progress = Math.round(p * 100);
      });
      
      clearInterval(progressInterval);
      progress = 100;
      
      dispatch('ocrComplete', {
        imageUrl: imagePreview,
        ocrResult,
        fileName: selectedFile.name
      });
      
    } catch (err) {
      console.error('OCR-Fehler:', err);
      error = 'Fehler bei der Texterkennung. Bitte versuchen Sie es erneut.';
    } finally {
      isProcessing = false;
    }
  }
  
  function handleReset() {
    selectedFile = null;
    imagePreview = null;
    ocrResult = null;
    error = null;
    progress = 0;
    if (fileInput) {
      fileInput.value = '';
    }
  }
  
  function handleStartVerification() {
    if (ocrResult && imagePreview) {
      dispatch('startVerification', {
        imageUrl: imagePreview,
        ocrResult,
        fileName: selectedFile?.name
      });
    }
  }
</script>

<div class="upload-container">
  <div class="upload-header">
    <h3>Dokument-Scan hochladen</h3>
    <div class="language-selector">
      <label for="language">OCR-Sprache:</label>
      <select id="language" bind:value={language} disabled={isProcessing}>
        <option value="deu">Deutsch</option>
        <option value="eng">Englisch</option>
        <option value="deu+eng">Deutsch + Englisch</option>
      </select>
    </div>
  </div>
  
  <div class="upload-content">
    {#if !selectedFile}
      <div class="dropzone">
        <input 
          type="file" 
          accept="image/*"
          on:change={handleFileSelect}
          bind:this={fileInput}
          id="file-input"
        />
        <label for="file-input" class="dropzone-label">
          <div class="dropzone-icon">📄</div>
          <div class="dropzone-text">
            <strong>Klicken Sie hier</strong> oder ziehen Sie eine Datei hierher
          </div>
          <div class="dropzone-hint">
            Unterstützte Formate: JPG, PNG, BMP, TIFF
          </div>
        </label>
      </div>
    {:else}
      <div class="preview-container">
        {#if imagePreview}
          <div class="image-preview">
            <img src={imagePreview} alt="Vorschau" />
          </div>
        {/if}
        
        <div class="file-info">
          <strong>{selectedFile.name}</strong>
          <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
        </div>
        
        {#if error}
          <div class="error-message">
            ⚠️ {error}
          </div>
        {/if}
        
        {#if isProcessing}
          <div class="processing-indicator">
            <div class="spinner"></div>
            <div class="processing-text">
              Texterkennung läuft... {progress}%
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: {progress}%"></div>
            </div>
          </div>
        {:else if ocrResult}
          <div class="result-preview">
            <div class="result-header">
              <strong>✓ Texterkennung abgeschlossen</strong>
              <span class="result-stats">
                {ocrResult.lines.length} Zeilen erkannt in {(ocrResult.processingTime / 1000).toFixed(1)}s
              </span>
            </div>
            
            <div class="result-text">
              {ocrResult.fullText.substring(0, 200)}{ocrResult.fullText.length > 200 ? '...' : ''}
            </div>
            
            <div class="result-actions">
              <button class="btn-verify" on:click={handleStartVerification}>
                Verifizierung starten
              </button>
              <button class="btn-reset" on:click={handleReset}>
                Neues Dokument
              </button>
            </div>
          </div>
        {:else}
          <div class="actions">
            <button class="btn-process" on:click={handleProcessOCR}>
              🔍 Text erkennen
            </button>
            <button class="btn-reset" on:click={handleReset}>
              Abbrechen
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .upload-container {
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .upload-header {
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .upload-header h3 {
    margin: 0;
    font-size: 1.25rem;
    color: #111827;
  }
  
  .language-selector {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .language-selector label {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .language-selector select {
    padding: 0.375rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .upload-content {
    padding: 1.5rem;
  }
  
  .dropzone {
    position: relative;
  }
  
  .dropzone input[type="file"] {
    position: absolute;
    width: 0;
    height: 0;
    opacity: 0;
  }
  
  .dropzone-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 300px;
    border: 2px dashed #d1d5db;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;
    background: #f9fafb;
  }
  
  .dropzone-label:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
  
  .dropzone-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .dropzone-text {
    font-size: 1rem;
    color: #374151;
    margin-bottom: 0.5rem;
  }
  
  .dropzone-hint {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .preview-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .image-preview {
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    overflow: hidden;
    max-height: 300px;
  }
  
  .image-preview img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  
  .file-info {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .error-message {
    padding: 0.75rem;
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }
  
  .processing-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #e5e7eb;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .processing-text {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .progress-bar {
    width: 100%;
    height: 0.5rem;
    background: #e5e7eb;
    border-radius: 0.25rem;
    overflow: hidden;
  }
  
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    transition: width 0.3s ease;
  }
  
  .result-preview {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .result-header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .result-header strong {
    color: #10b981;
    font-size: 1rem;
  }
  
  .result-stats {
    font-size: 0.875rem;
    color: #6b7280;
  }
  
  .result-text {
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    color: #374151;
    line-height: 1.6;
    max-height: 150px;
    overflow-y: auto;
  }
  
  .result-actions, .actions {
    display: flex;
    gap: 0.75rem;
  }
  
  .btn-process, .btn-verify, .btn-reset {
    flex: 1;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .btn-process, .btn-verify {
    background: #3b82f6;
    color: white;
  }
  
  .btn-process:hover, .btn-verify:hover {
    background: #2563eb;
  }
  
  .btn-reset {
    background: #e5e7eb;
    color: #374151;
  }
  
  .btn-reset:hover {
    background: #d1d5db;
  }
</style>
