<script lang="ts">
  export let current = 0;
  export let total = 100;
  export let label = '';
  export let showPercentage = true;

  $: percentage = (current / total) * 100;
  $: isComplete = current >= total;
</script>

<div class="space-y-2">
  {#if label}
    <div class="flex items-center justify-between">
      <span class="text-sm font-medium text-gray-700">{label}</span>
      {#if showPercentage}
        <span class="text-sm font-semibold text-gray-600">
          {isComplete ? '✓ Fertig' : `${Math.round(percentage)}%`}
        </span>
      {/if}
    </div>
  {/if}

  <!-- Progress Bar -->
  <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
    <div
      class={`h-3 rounded-full transition-all duration-300 ${
        isComplete ? 'bg-green-500' : 'bg-blue-500'
      }`}
      style={`width: ${percentage}%`}
    />
  </div>

  <!-- Counter -->
  <div class="text-xs text-gray-500 text-right">
    {current} / {total}
  </div>
</div>
