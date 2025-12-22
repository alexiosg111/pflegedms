<script>
  import { onMount } from 'svelte';

  let platform = 'web';

  onMount(() => {
    if (typeof window !== 'undefined' && window.electron) {
      platform = window.electron.platform;
    }
  });
</script>

<main>
  <div class="container">
    <h1>PflegeDMS</h1>
    <p>Pflegedienst Management System</p>
    
    <div class="info">
      <p>Willkommen zu PflegeDMS - Ihrem Management-System für Pflegedienste</p>
      {#if platform !== 'web'}
        <p class="platform">Plattform: {platform}</p>
      {/if}
    </div>

    <div class="features">
      <h2>Features</h2>
      <ul>
        <li>📋 Patientenverwaltung</li>
        <li>📅 Terminplanung</li>
        <li>📄 Dokumentation</li>
        <li>👥 Mitarbeiterverwaltung</li>
      </ul>
    </div>
  </div>
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  main {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .container {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    max-width: 600px;
    width: 100%;
  }

  h1 {
    color: #667eea;
    font-size: 3rem;
    margin: 0 0 0.5rem 0;
    text-align: center;
  }

  h2 {
    color: #667eea;
    margin-top: 2rem;
  }

  p {
    color: #666;
    text-align: center;
    font-size: 1.2rem;
    margin: 0 0 2rem 0;
  }

  .info {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 10px;
    margin: 2rem 0;
  }

  .platform {
    font-weight: bold;
    color: #667eea;
    margin-top: 1rem;
  }

  .features ul {
    list-style: none;
    padding: 0;
  }

  .features li {
    padding: 0.8rem;
    margin: 0.5rem 0;
    background: #f8f9fa;
    border-radius: 8px;
    font-size: 1.1rem;
    color: #333;
  }
</style>
