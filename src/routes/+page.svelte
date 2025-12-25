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
            <div class="module-info">
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </div>
          </div>
        {/each}
      </div>

      <footer class="footer">
        <p>Version 1.3.0</p>
      </footer>
    </div>
  {/if}
</main>

<style>
  main {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .module-detail {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
  }

  .back-button {
    position: absolute;
    top: 2rem;
    left: 2rem;
    padding: 0.8rem 1.5rem;
    background: white;
    color: #667eea;
    border: none;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .back-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
  }

  .module-content {
    background: white;
    border-radius: 20px;
    padding: 3rem;
    max-width: 600px;
    width: 100%;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .module-content h1 {
    color: #667eea;
    font-size: 2.5rem;
    margin: 0 0 1rem 0;
  }

  .module-description {
    color: #666;
    font-size: 1.2rem;
    margin: 0 0 2rem 0;
  }

  .module-placeholder {
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 15px;
    margin: 2rem 0;
  }

  .placeholder-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .module-placeholder h3 {
    color: #667eea;
    margin: 0 0 0.5rem 0;
  }

  .module-placeholder p {
    color: #666;
    margin: 0;
  }

  .dashboard {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 3rem 2rem;
  }

  .header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
  }

  .header h1 {
    font-size: 3.5rem;
    margin: 0 0 0.5rem 0;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .subtitle {
    font-size: 1.5rem;
    margin: 0;
    opacity: 0.9;
  }

  .platform-badge {
    display: inline-block;
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    margin-top: 1rem;
    font-size: 0.9rem;
  }

  .welcome-section {
    background: white;
    border-radius: 15px;
    padding: 2rem 3rem;
    margin-bottom: 3rem;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .welcome-section h2 {
    color: #667eea;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
  }

  .welcome-section p {
    color: #666;
    margin: 0;
    font-size: 1.2rem;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    width: 100%;
    max-width: 1200px;
  }

  .module-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
  }

  .module-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }

  .module-card:focus {
    outline: 2px solid var(--module-color);
    outline-offset: 2px;
  }

  .module-icon {
    font-size: 3rem;
    flex-shrink: 0;
  }

  .module-info h3 {
    color: var(--module-color);
    margin: 0 0 0.5rem 0;
    font-size: 1.3rem;
  }

  .module-info p {
    color: #666;
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .footer {
    margin-top: 4rem;
    color: white;
    opacity: 0.8;
  }
</style>
