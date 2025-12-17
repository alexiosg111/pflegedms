<script lang="ts">
  import { authStore } from '../stores/authStore';
  import Button from '../components/Button.svelte';

  let password: string = '';
  let showPassword: boolean = false;
  let isLoading: boolean = false;
  let error: string = '';

  // TODO: In Phase 2 wird die echte Passwort-Verifikation mit Master-Passwort-Hash hinzugefügt

  async function handleLogin() {
    if (!password) {
      error = 'Bitte geben Sie ein Passwort ein.';
      return;
    }

    // TODO: Passwort mit bcrypt gegen Hash vergleichen
    // Für MVP: Temporär akzeptieren wir jedes Passwort (wird in PR2 implementiert)

    isLoading = true;
    error = '';

    try {
      // Simuliere kurze Verzögerung
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Im MVP akzeptieren wir jedes Passwort
      if (password.length > 0) {
        authStore.login('Administrator');
      } else {
        error = 'Ungültiges Passwort.';
      }
    } catch (err) {
      error = 'Fehler bei der Authentifizierung.';
      console.error(err);
    } finally {
      isLoading = false;
    }
  }

  function handleKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<div class="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
  <div class="bg-white rounded-lg shadow-lg p-8 w-96">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900">🏥</h1>
      <h2 class="text-2xl font-bold text-gray-900 mt-2">Pflegedienst Workspace</h2>
      <p class="text-gray-500 text-sm mt-1">Sichere Authentifizierung</p>
    </div>

    <!-- Login Form -->
    <form on:submit|preventDefault={handleLogin} class="space-y-4">
      <!-- Master-Passwort Input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
          Master-Passwort
        </label>
        <div class="relative">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            bind:value={password}
            on:keypress={handleKeyPress}
            placeholder="••••••••"
            class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
            required
          />
          <button
            type="button"
            on:click={() => (showPassword = !showPassword)}
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            disabled={isLoading}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
      </div>

      <!-- Error Message -->
      {#if error}
        <div class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-red-700 text-sm">{error}</p>
        </div>
      {/if}

      <!-- Login Button -->
      <Button
        variant="primary"
        size="lg"
        disabled={isLoading || !password}
        on:click={handleLogin}
        class="w-full mt-6"
      >
        {#if isLoading}
          <span>Wird authentifiziert...</span>
        {:else}
          <span>Entsperren</span>
        {/if}
      </Button>
    </form>

    <!-- Help Text -->
    <p class="text-center text-xs text-gray-500 mt-6">
      🔒 Ihre Daten werden verschlüsselt gespeichert
    </p>
  </div>
</div>

<style>
  :global(html, body) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
</style>
