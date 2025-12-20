<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { documentStore } from '../stores/documentStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import { DOCUMENT_CATEGORIES } from '../types/document';

  export let patientId: string;

  const dispatch = createEventDispatcher();

  let isDragover = false;
  let selectedFile: File | null = null;
  let selectedCategory = 'other';
  let notes = '';
  let isSubmitting = false;

  function handleDragover(e: DragEvent) {
    e.preventDefault();
    isDragover = true;
  }

  function handleDragleave() {
    isDragover = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragover = false;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) {
        toastStore.error('Datei ist zu groß (Max. 50 MB)');
        return;
      }
      selectedFile = file;
    }
  }

  function handleFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 50 * 1024 * 1024) {
        toastStore.error('Datei ist zu groß (Max. 50 MB)');
        return;
      }
      selectedFile = file;
    }
  }

  async function handleSubmit() {
    if (!selectedFile) {
      toastStore.error('Bitte wählen Sie eine Datei');
      return;
    }

    isSubmitting = true;

    try {
      const result = await documentStore.uploadDocument(
        selectedFile,
        patientId,
        selectedCategory,
        notes || undefined
      );

      if (result) {
        toastStore.success('Dokument hochgeladen');
        selectedFile = null;
        selectedCategory = 'other';
        notes = '';
        dispatch('uploaded', result);
      } else {
        toastStore.error('Fehler beim Upload');
      }
    } catch (err) {
      toastStore.error('Upload fehlgeschlagen');
    } finally {
      isSubmitting = false;
    }
  }

  function handleClear() {
    selectedFile = null;
  }
</script>

<div class="bg-white rounded-lg p-6 shadow-sm border-2 border-dashed border-gray-300">
  <!-- Drop Zone -->
  {#if !selectedFile}
    <div
      on:dragover={handleDragover}
      on:dragleave={handleDragleave}
      on:drop={handleDrop}
      class={`p-8 rounded-lg text-center transition-colors ${
        isDragover
          ? 'bg-blue-50 border-blue-400'
          : 'bg-gray-50 border-gray-300'
      } border-2 border-dashed`}
    >
      <div class="text-4xl mb-4">📄</div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Dokument hochladen</h3>
      <p class="text-sm text-gray-600 mb-4">
        Datei ziehen und ablegen oder klicken zum Auswählen
      </p>
      <label class="inline-block">
        <input
          type="file"
          on:change={handleFileInput}
          class="hidden"
          accept="image/*,.pdf"
        />
        <Button variant="primary" type="button" on:click={(e) => e.target.click()}>
          Datei auswählen
        </Button>
      </label>
      <p class="text-xs text-gray-500 mt-4">
        Maximal 50 MB • PNG, JPEG, PDF
      </p>
    </div>
  {:else}
    <!-- File Selected -->
    <div class="space-y-4">
      <!-- File Preview -->
      <div class="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
        <div class="text-3xl">📎</div>
        <div class="flex-1">
          <p class="font-medium text-gray-900">{selectedFile.name}</p>
          <p class="text-sm text-gray-600">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <button
          on:click={handleClear}
          class="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <!-- Form Fields -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Kategorie *
        </label>
        <select
          bind:value={selectedCategory}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {#each DOCUMENT_CATEGORIES as category}
            <option value={category.id}>
              {category.icon} {category.label}
            </option>
          {/each}
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-900 mb-2">
          Notizen
        </label>
        <textarea
          bind:value={notes}
          placeholder="Optionale Notizen..."
          rows="2"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Upload Progress -->
      {#if $documentStore.uploadProgress > 0 && $documentStore.uploadProgress < 100}
        <div>
          <p class="text-sm text-gray-600 mb-2">
            Upload läuft... {$documentStore.uploadProgress}%
          </p>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="bg-blue-600 h-2 rounded-full transition-all"
              style="width: {$documentStore.uploadProgress}%"
            ></div>
          </div>
        </div>
      {/if}

      <!-- Buttons -->
      <div class="flex space-x-3">
        <Button variant="secondary" on:click={handleClear}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          on:click={handleSubmit}
          loading={isSubmitting}
        >
          Hochladen
        </Button>
      </div>
    </div>
  {/if}

  <!-- Error Message -->
  {#if $documentStore.error}
    <div class="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-700 text-sm">{$documentStore.error}</p>
    </div>
  {/if}
</div>
