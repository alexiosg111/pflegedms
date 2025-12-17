<script lang="ts">
  import { toastStore } from '../stores/toastStore';

  $: toasts = $toastStore.toasts;

  function getIcon(type: string) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[type as keyof typeof icons] || 'ℹ';
  }

  function getColor(type: string) {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      error: 'bg-red-50 border-red-200 text-red-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800',
    };
    return colors[type as keyof typeof colors] || colors.info;
  }
</script>

<div class="fixed top-4 right-4 space-y-2 z-50 pointer-events-none">
  {#each toasts as toast (toast.id)}
    <div
      class="flex items-center space-x-3 px-4 py-3 rounded-md border pointer-events-auto shadow-md {getColor(
        toast.type
      )}"
    >
      <span class="text-lg font-bold">{getIcon(toast.type)}</span>
      <p class="text-sm">{toast.message}</p>
      <button
        on:click={() => toastStore.dismiss(toast.id)}
        class="ml-2 opacity-70 hover:opacity-100 transition-opacity"
      >
        ×
      </button>
    </div>
  {/each}
</div>
