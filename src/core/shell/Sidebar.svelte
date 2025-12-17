<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let modules: Array<{ id: string; label: string; icon: string }> = [];
  export let currentPage: string = 'dashboard';

  const dispatch = createEventDispatcher();

  function handleNavigate(moduleId: string) {
    dispatch('navigate', moduleId);
  }

  function handleLogout() {
    dispatch('logout');
  }

  function handleSearch() {
    // TODO: Globale Suche implementieren
  }
</script>

<aside class="w-sidebar bg-white border-r border-gray-200 flex flex-col h-full shadow-sm">
  <!-- Logo -->
  <div class="px-6 py-4 border-b border-gray-200">
    <h2 class="text-xl font-bold text-blue-600">🏥 Pflegedienst</h2>
    <p class="text-xs text-gray-500">Workspace</p>
  </div>

  <!-- Search Bar -->
  <div class="px-4 py-3 border-b border-gray-200">
    <div class="relative">
      <input
        type="text"
        placeholder="Suche... (Ctrl+K)"
        on:click={handleSearch}
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        readonly
      />
      <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
        🔍
      </span>
    </div>
  </div>

  <!-- Navigation -->
  <nav class="flex-1 overflow-y-auto px-2 py-4 space-y-1">
    {#each modules as module (module.id)}
      <button
        on:click={() => handleNavigate(module.id)}
        class={`w-full flex items-center space-x-3 px-4 py-2 rounded-md transition-colors ${
          currentPage === module.id
            ? 'bg-blue-100 text-blue-700 font-semibold'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <span class="text-lg">{module.icon}</span>
        <span class="text-sm">{module.label}</span>
      </button>
    {/each}
  </nav>

  <!-- Settings Section -->
  <div class="border-t border-gray-200 px-2 py-4 space-y-1">
    <button
      class="w-full flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
    >
      <span>⚙️</span>
      <span class="text-sm">Einstellungen</span>
    </button>
    <button
      on:click={handleLogout}
      class="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
    >
      <span>❌</span>
      <span class="text-sm">Abmelden</span>
    </button>
  </div>

  <!-- User Info -->
  <div class="border-t border-gray-200 px-4 py-3">
    <div class="flex items-center space-x-2">
      <div class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
        A
      </div>
      <div class="text-xs">
        <p class="font-semibold text-gray-900">Administrator</p>
        <p class="text-gray-500">Angemeldet</p>
      </div>
    </div>
  </div>
</aside>

<style>
  .w-sidebar {
    width: 240px;
  }
</style>
