<script lang="ts">
  import { themeStore } from '../stores/themeStore';

  $: theme = $themeStore.theme;
  $: isDark = $themeStore.isDark;

  function toggleTheme() {
    themeStore.setTheme(isDark ? 'light' : 'dark');
  }

  function getThemeIcon() {
    if (theme === 'auto') {
      return '🌗';
    }
    return isDark ? '🌙' : '☀️';
  }
</script>

<button
  on:click={toggleTheme}
  title={`Theme: ${theme}`}
  class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
>
  <span class="text-lg">{getThemeIcon()}</span>
</button>
