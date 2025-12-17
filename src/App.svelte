<script lang="ts">
  import { authStore } from './core/stores/authStore';
  import Login from './core/shell/Login.svelte';
  import MainLayout from './core/shell/MainLayout.svelte';
  import Toast from './core/components/Toast.svelte';

  $: isAuthenticated = $authStore.isAuthenticated;
</script>

{#if !isAuthenticated}
  <Login />
{:else}
  <MainLayout />
{/if}

<Toast />


<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
      Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  }

  :global(body) {
    background-color: #f9fafb;
    color: #1f2937;
  }

  :global(*) {
    box-sizing: border-box;
  }
</style>
