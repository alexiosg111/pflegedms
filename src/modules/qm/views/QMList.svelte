<script lang="ts">
  import { onMount } from 'svelte';
  import { qmStore } from '../stores/qmStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import FolderTree from '../components/FolderTree.svelte';
  import DocumentCard from '../components/DocumentCard.svelte';
  import { QM_FOLDER_TEMPLATES } from '../types/qm';

  let showNewFolderDialog = false;
  let newFolderName = '';
  let newFolderParentId: string | null = null;
  let isCreatingFolder = false;

  onMount(async () => {
    await qmStore.loadFolders();
  });

  async function handleSelectFolder(e: CustomEvent<string>) {
    const folderId = e.detail;
    await qmStore.loadFolderDocuments(folderId);
  }

  async function handleCreateFolder(e: CustomEvent<string>) {
    newFolderParentId = e.detail;
    showNewFolderDialog = true;
  }

  async function handleDeleteFolder(e: CustomEvent<string>) {
    const folderId = e.detail;
    if (!confirm('Ordner wirklich löschen?')) return;
    const success = await qmStore.deleteFolder(folderId);
    if (success) {
      toastStore.success('Ordner gelöscht');
    }
  }

  async function submitNewFolder() {
    if (!newFolderName.trim()) {
      toastStore.error('Ordnername erforderlich');
      return;
    }

    isCreatingFolder = true;
    try {
      const result = await qmStore.createFolder({
        parent_folder_id: newFolderParentId,
        name: newFolderName,
      });

      if (result) {
        toastStore.success('Ordner erstellt');
        showNewFolderDialog = false;
        newFolderName = '';
        newFolderParentId = null;
      }
    } finally {
      isCreatingFolder = false;
    }
  }

  async function createFromTemplate(template: any) {
    const result = await qmStore.createFolder({
      name: template.name,
      description: template.description,
      icon: template.icon,
    });

    if (result) {
      toastStore.success(`Ordner "${template.name}" erstellt`);
    }
  }

  async function handleApprove(e: CustomEvent<string>) {
    const documentId = e.detail;
    const result = await qmStore.approveDocument(documentId);
    if (result) {
      toastStore.success('Dokument genehmigt');
    }
  }

  async function handleNewVersion(e: CustomEvent<string>) {
    const documentId = e.detail;
    // Reload current folder to show new version
    if ($qmStore.currentFolderId) {
      await qmStore.loadFolderDocuments($qmStore.currentFolderId);
    }
    toastStore.info('Neue Version erstellt');
  }

  async function handleDeleteDocument(e: CustomEvent<string>) {
    const documentId = e.detail;
    if (!confirm('Dokument wirklich löschen?')) return;
    const success = await qmStore.deleteDocument(documentId);
    if (success) {
      toastStore.success('Dokument gelöscht');
    }
  }

  function selectTemplate(template: any) {
    newFolderName = template.name;
  }
</script>

<div class="grid grid-cols-4 gap-6 h-full">
  <!-- Sidebar: Folder Tree -->
  <div class="col-span-1 bg-white rounded-lg shadow-sm p-4 overflow-y-auto">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-sm font-semibold text-gray-900">Ordner</h2>
      <Button
        variant="primary"
        size="sm"
        on:click={() => {
          newFolderParentId = null;
          showNewFolderDialog = true;
        }}
      >
        ➕
      </Button>
    </div>

    {#if $qmStore.isLoading}
      <p class="text-sm text-gray-500">⏳ Laden...</p>
    {:else if $qmStore.folderTree.length === 0}
      <p class="text-sm text-gray-500">Keine Ordner vorhanden</p>
    {:else}
      <FolderTree
        folderTree={$qmStore.folderTree}
        selectedFolderId={$qmStore.currentFolderId}
        on:selectFolder={handleSelectFolder}
        on:createFolder={handleCreateFolder}
        on:deleteFolder={handleDeleteFolder}
      />
    {/if}
  </div>

  <!-- Main: Documents -->
  <div class="col-span-3 space-y-4">
    {#if !$qmStore.currentFolderId}
      <!-- Templates -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Schnelleinstieg: Vorlagen</h2>
        <div class="grid grid-cols-2 gap-3">
          {#each QM_FOLDER_TEMPLATES as template}
            <button
              on:click={() => createFromTemplate(template)}
              class="bg-white border-2 border-gray-200 hover:border-blue-500 rounded-lg p-4 text-left transition-colors"
            >
              <p class="text-2xl mb-2">{template.icon}</p>
              <p class="text-sm font-semibold text-gray-900">{template.name}</p>
              <p class="text-xs text-gray-600">{template.description}</p>
            </button>
          {/each}
        </div>
      </div>
    {:else}
      <!-- Documents in Folder -->
      <h2 class="text-lg font-semibold text-gray-900">Dokumente</h2>

      {#if $qmStore.isLoading}
        <p class="text-gray-500">⏳ Dokumente werden geladen...</p>
      {:else if $qmStore.documents.length === 0}
        <div class="bg-white rounded-lg p-6 shadow-sm text-center">
          <p class="text-gray-500 mb-4">📭 Keine Dokumente</p>
          <p class="text-sm text-gray-600">Laden Sie ein Dokument hoch oder erstellen Sie ein neues</p>
        </div>
      {:else}
        <div class="grid grid-cols-2 gap-4">
          {#each $qmStore.documents as document (document.id)}
            <DocumentCard
              {document}
              on:approve={handleApprove}
              on:newVersion={handleNewVersion}
              on:delete={handleDeleteDocument}
            />
          {/each}
        </div>
      {/if}
    {/if}

    <!-- Error -->
    {#if $qmStore.error}
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-red-700 text-sm">{$qmStore.error}</p>
      </div>
    {/if}
  </div>
</div>

<!-- New Folder Dialog -->
{#if showNewFolderDialog}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Neuer Ordner</h2>

      <div class="space-y-4">
        <div>
          <label for="folder-name" class="block text-sm font-medium text-gray-900 mb-1">
            Ordnername *
          </label>
          <input
            id="folder-name"
            type="text"
            bind:value={newFolderName}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="z.B. Hygieneplan"
          />
        </div>

        {#if !newFolderParentId}
          <div>
            <!-- svelte-ignore a11y-label-has-associated-control -->
            <label class="block text-sm font-medium text-gray-900 mb-2">
              Vorlage (optional)
            </label>
            <div class="space-y-1 max-h-32 overflow-y-auto">
              {#each QM_FOLDER_TEMPLATES as template}
                <button
                  on:click={() => selectTemplate(template)}
                  class={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    newFolderName === template.name
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {template.icon} {template.name}
                </button>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          on:click={() => {
            showNewFolderDialog = false;
            newFolderName = '';
            newFolderParentId = null;
          }}
        >
          Abbrechen
        </Button>
        <Button
          variant="primary"
          loading={isCreatingFolder}
          on:click={submitNewFolder}
        >
          Erstellen
        </Button>
      </div>
    </div>
  </div>
{/if}
