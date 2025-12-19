<script lang="ts">
  import { onMount } from 'svelte';
  import { authStore } from './core/stores/authStore';
  import { errorReportingService } from './core/services/errorReportingService';
  import { analyticsService } from './core/services/analyticsService';
  import Login from './core/shell/Login.svelte';
  import MainLayout from './core/shell/MainLayout.svelte';
  import Toast from './core/components/Toast.svelte';

  $: isAuthenticated = $authStore.isAuthenticated;

  onMount(() => {
    // Initialize error reporting
    errorReportingService.initGlobalHandlers();
    
    // Track app open
    analyticsService.track('app_open', { 
      platform: navigator.platform 
    }, 'system');

    // Track performance
    if (window.performance) {
      setTimeout(() => {
        const entry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (entry) {
          analyticsService.trackPerformance('app_startup', entry.loadEventEnd || entry.domComplete);
        }
      }, 0);
    }
  });
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
