<script lang="ts">
  export let items: Array<{ label: string; href?: string }> = [];

  function handleClick(href: string | undefined) {
    if (href) {
      // Emit navigation event or trigger navigation
      window.history.pushState({}, '', href);
    }
  }
</script>

<nav
  aria-label="Breadcrumbs"
  class="flex items-center space-x-2 text-sm text-gray-600 mb-4"
>
  {#each items as item, index (index)}
    {#if index > 0}
      <span class="text-gray-400">/</span>
    {/if}
    {#if item.href}
      <button
        on:click={() => handleClick(item.href)}
        class="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
      >
        {item.label}
      </button>
    {:else}
      <span class="text-gray-900">{item.label}</span>
    {/if}
  {/each}
</nav>
