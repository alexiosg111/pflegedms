<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '@core/components/Button.svelte';
  import type { QMFolderTree } from '../types/qm';

  export let folderTree: QMFolderTree[];
  export let selectedFolderId: string | null;
  export let level: number = 0;

  const dispatch = createEventDispatcher();

  function handleSelectFolder(folderId: string) {
    dispatch('selectFolder', folderId);
  }

  function handleCreateFolder(parentId: string) {
    dispatch('createFolder', parentId);
  }

  function handleDeleteFolder(folderId: string) {
    dispatch('deleteFolder', folderId);
  }
</script>

<div class="space-y-1">
  {#each folderTree as folder (folder.id)}
    <div>
      <div class="flex items-center justify-between hover:bg-gray-100 rounded-md p-2 transition-colors">
        <button
          on:click={() => handleSelectFolder(folder.id)}
          class={`flex-1 flex items-center space-x-2 text-sm ${
            selectedFolderId === folder.id
              ? 'font-semibold text-blue-600'
              : 'text-gray-700 hover:text-gray-900'
          }`}
          style={`margin-left: ${level * 16}px`}
        >
          <span>{folder.icon || '📁'}</span>
          <span>{folder.name}</span>
          <span class="text-xs text-gray-500">({folder.document_count})</span>
        </button>
        <div class="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            on:click={() => handleCreateFolder(folder.id)}
          >
            ➕
          </Button>
          <Button
            variant="ghost"
            size="sm"
            on:click={() => handleDeleteFolder(folder.id)}
          >
            🗑
          </Button>
        </div>
      </div>

      <!-- Subfolders -->
      {#if folder.children && folder.children.length > 0}
        <svelte:self
          folderTree={folder.children}
          {selectedFolderId}
          level={level + 1}
          on:selectFolder
          on:createFolder
          on:deleteFolder
        />
      {/if}
    </div>
  {/each}
</div>
