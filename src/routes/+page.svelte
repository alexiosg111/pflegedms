<script>
  import { onMount } from 'svelte';

  let platform = 'web';
  let currentModule = null;

  onMount(() => {
    if (typeof window !== 'undefined' && window.electron) {
      platform = window.electron.platform;
    }
  });

  const modules = [
    {
      id: 'patients',
      title: 'Patientenverwaltung',
      icon: '📋',
      description: 'Verwalten Sie Ihre Patienteninformationen',
      color: '#4F46E5'
    },
    {
      id: 'schedule',
      title: 'Terminplanung',
      icon: '📅',
      description: 'Planen und verwalten Sie Termine',
      color: '#059669'
    },
    {
      id: 'documentation',
      title: 'Dokumentation',
      icon: '📄',
      description: 'Erstellen und verwalten Sie Dokumentationen',
      color: '#DC2626'
    },
    {
      id: 'staff',
      title: 'Mitarbeiterverwaltung',
      icon: '👥',
      description: 'Verwalten Sie Ihr Pflegeteam',
      color: '#7C3AED'
    }
  ];

  function openModule(moduleId) {
    currentModule = moduleId;
  }

  function goBack() {
    currentModule = null;
  }
</script>

<main>
  {#if currentModule}
    <!-- Module Detail View -->
    <div class="module-detail">
      <button class="back-button" on:click={goBack}>
        ← Zurück zum Dashboard
      </button>
      
      <div class="module-content">
        <h1>{modules.find(m => m.id === currentModule)?.title}</h1>
        <p class="module-description">{modules.find(m => m.id === currentModule)?.description}</p>
        
        <div class="module-placeholder">
          <div class="placeholder-icon">
            {modules.find(m => m.id === currentModule)?.icon}
          </div>
          <h3>Modul in Entwicklung</h3>
          <p>Dieses Modul wird in Kürze verfügbar sein.</p>
        </div>
      </div>
    </div>
  {:else}
    <!-- Dashboard View -->
    <div class="dashboard">
      <header class="header">
        <h1>PflegeDMS</h1>
        <p class="subtitle">Pflegedienst Management System</p>
        {#if platform !== 'web'}
          <span class="platform-badge">{platform}</span>
        {/if}
      </header>

      <div class="welcome-section">
        <h2>Willkommen zu PflegeDMS</h2>
        <p>Ihr umfassendes Management-System für Pflegedienste</p>
      </div>

      <div class="modules-grid">
        {#each modules as module}
          <div 
            class="module-card" 
            style="--module-color: {module.color}"
            on:click={() => openModule(module.id)}
            on:keydown={(e) => e.key === 'Enter' && openModule(module.id)}
            role="button"
            tabindex="0"
          >
            <div class="module-icon">{module.icon}</div>
            <h3 class="module-title">{module.title}</h3>
            <p class="module-description">{module.description}</p>
            <div class="module-arrow">→</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
  }

  :global(html) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  main {
    min-height: 100vh;
    padding: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dashboard {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    text-align: center;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 4rem;
    font-weight: 800;
    color: white;
    margin: 0 0 1rem 0;
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .subtitle {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.9);
    margin: 0 0 1rem 0;
  }

  .platform-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }

  .welcome-section {
    text-align: center;
    margin-bottom: 3rem;
  }

  .welcome-section h2 {
    font-size: 2.5rem;
    color: white;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  .welcome-section p {
    font-size: 1.3rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .module-card {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    position: relative;
    overflow: hidden;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .module-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
    background: rgba(255, 255, 255, 1);
  }

  .module-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--module-color), rgba(255, 255, 255, 0.3));
  }

  .module-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
  }

  .module-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem 0;
  }

  .module-description {
    color: #6b7280;
    font-size: 1rem;
    line-height: 1.6;
    margin: 0 0 1.5rem 0;
  }

  .module-arrow {
    position: absolute;
    bottom: 1.5rem;
    right: 1.5rem;
    font-size: 1.5rem;
    color: var(--module-color);
    font-weight: bold;
    transition: transform 0.3s ease;
  }

  .module-card:hover .module-arrow {
    transform: translateX(5px);
  }

  /* Module Detail View */
  .module-detail {
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .back-button {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 50px;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 2rem;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
  }

  .back-button:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateX(-5px);
  }

  .module-content {
    background: rgba(255, 255, 255, 0.95);
    border-radius: 20px;
    padding: 3rem;
    backdrop-filter: blur(10px);
  }

  .module-content h1 {
    font-size: 2.5rem;
    color: #1f2937;
    margin: 0 0 1rem 0;
  }

  .module-content .module-description {
    font-size: 1.2rem;
    color: #6b7280;
    margin-bottom: 3rem;
  }

  .module-placeholder {
    text-align: center;
    padding: 4rem 2rem;
    background: #f8fafc;
    border-radius: 15px;
    border: 2px dashed #d1d5db;
  }

  .placeholder-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .module-placeholder h3 {
    font-size: 1.5rem;
    color: #374151;
    margin: 0 0 1rem 0;
  }

  .module-placeholder p {
    color: #6b7280;
    font-size: 1.1rem;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    main {
      padding: 1rem;
    }

    .header h1 {
      font-size: 3rem;
    }

    .welcome-section h2 {
      font-size: 2rem;
    }

    .modules-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .module-card {
      padding: 1.5rem;
    }

    .module-content {
      padding: 2rem;
    }

    .module-content h1 {
      font-size: 2rem;
    }
  }
</style>