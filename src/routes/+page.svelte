<script>
  import { onMount } from 'svelte';

  let platform = 'web';
  let currentModule = null;

  onMount(() => {
    if (typeof window !== 'undefined' && window.electron) {
      platform = window.electron.platform;
    }
    loadFromStorage();
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

  let patients = [];
  let appointments = [];
  let documents = [];
  let staff = [];

  let editingPatient = null;
  let editingAppointment = null;
  let editingDocument = null;
  let editingStaff = null;
  let showAddModal = false;

  let searchQuery = '';

  function loadFromStorage() {
    try {
      const storedPatients = localStorage.getItem('pflegedms_patients');
      const storedAppointments = localStorage.getItem('pflegedms_appointments');
      const storedDocuments = localStorage.getItem('pflegedms_documents');
      const storedStaff = localStorage.getItem('pflegedms_staff');

      if (storedPatients) patients = JSON.parse(storedPatients);
      if (storedAppointments) appointments = JSON.parse(storedAppointments);
      if (storedDocuments) documents = JSON.parse(storedDocuments);
      if (storedStaff) staff = JSON.parse(storedStaff);
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  }

  function saveToStorage() {
    localStorage.setItem('pflegedms_patients', JSON.stringify(patients));
    localStorage.setItem('pflegedms_appointments', JSON.stringify(appointments));
    localStorage.setItem('pflegedms_documents', JSON.stringify(documents));
    localStorage.setItem('pflegedms_staff', JSON.stringify(staff));
  }

  function openModule(moduleId) {
    currentModule = moduleId;
  }

  function goBack() {
    currentModule = null;
  }

  function openAddModal(type) {
    if (type === 'patient') {
      editingPatient = { id: '', name: '', birthDate: '', address: '', phone: '', insurance: '', diagnosis: '', notes: '' };
    } else if (type === 'appointment') {
      editingAppointment = { id: '', title: '', date: '', time: '', patientId: '', staffId: '', notes: '' };
    } else if (type === 'document') {
      editingDocument = { id: '', title: '', date: '', patientId: '', type: '', notes: '' };
    } else if (type === 'staff') {
      editingStaff = { id: '', name: '', position: '', phone: '', email: '', qualifications: '', notes: '' };
    }
    showAddModal = true;
  }

  function openEditModal(type, item) {
    if (type === 'patient') {
      editingPatient = { ...item };
    } else if (type === 'appointment') {
      editingAppointment = { ...item };
    } else if (type === 'document') {
      editingDocument = { ...item };
    } else if (type === 'staff') {
      editingStaff = { ...item };
    }
    showAddModal = true;
  }

  function closeModal() {
    editingPatient = null;
    editingAppointment = null;
    editingDocument = null;
    editingStaff = null;
    showAddModal = false;
  }

  function savePatient() {
    if (editingPatient.id) {
      const index = patients.findIndex(p => p.id === editingPatient.id);
      if (index !== -1) patients[index] = editingPatient;
    } else {
      editingPatient.id = Date.now().toString();
      patients.push(editingPatient);
    }
    saveToStorage();
    closeModal();
  }

  function saveAppointment() {
    if (editingAppointment.id) {
      const index = appointments.findIndex(a => a.id === editingAppointment.id);
      if (index !== -1) appointments[index] = editingAppointment;
    } else {
      editingAppointment.id = Date.now().toString();
      appointments.push(editingAppointment);
    }
    saveToStorage();
    closeModal();
  }

  function saveDocument() {
    if (editingDocument.id) {
      const index = documents.findIndex(d => d.id === editingDocument.id);
      if (index !== -1) documents[index] = editingDocument;
    } else {
      editingDocument.id = Date.now().toString();
      documents.push(editingDocument);
    }
    saveToStorage();
    closeModal();
  }

  function saveStaff() {
    if (editingStaff.id) {
      const index = staff.findIndex(s => s.id === editingStaff.id);
      if (index !== -1) staff[index] = editingStaff;
    } else {
      editingStaff.id = Date.now().toString();
      staff.push(editingStaff);
    }
    saveToStorage();
    closeModal();
  }

  function deletePatient(id) {
    if (confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      patients = patients.filter(p => p.id !== id);
      saveToStorage();
    }
  }

  function deleteAppointment(id) {
    if (confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      appointments = appointments.filter(a => a.id !== id);
      saveToStorage();
    }
  }

  function deleteDocument(id) {
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      documents = documents.filter(d => d.id !== id);
      saveToStorage();
    }
  }

  function deleteStaff(id) {
    if (confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      staff = staff.filter(s => s.id !== id);
      saveToStorage();
    }
  }

  $: filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredAppointments = appointments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredDocuments = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
</script>

<main>
  {#if currentModule}
    <div class="module-detail">
      <button class="back-button" on:click={goBack}>
        ← Zurück zum Dashboard
      </button>

      <div class="module-container">
        <header class="module-header">
          <h1>
            <span class="module-icon">{modules.find(m => m.id === currentModule)?.icon}</span>
            {modules.find(m => m.id === currentModule)?.title}
          </h1>
          <button class="add-button" on:click={() => openAddModal(currentModule.slice(0, -1))}>
            + Hinzufügen
          </button>
        </header>

        <div class="search-bar">
          <input type="text" placeholder="🔍 Suchen..." bind:value={searchQuery} />
        </div>

        <div class="content-list">
          {#if currentModule === 'patients'}
            {#each filteredPatients as patient}
              <div class="list-item">
                <div class="item-main">
                  <h3>{patient.name}</h3>
                  <p class="item-detail">{formatDate(patient.birthDate)} | {patient.insurance}</p>
                </div>
                <div class="item-actions">
                  <button class="edit-btn" on:click={() => openEditModal('patient', patient)}>✏️</button>
                  <button class="delete-btn" on:click={() => deletePatient(patient.id)}>🗑️</button>
                </div>
              </div>
            {/each}
            {#if filteredPatients.length === 0}
              <p class="empty-state">Keine Patienten gefunden</p>
            {/if}
          {:else if currentModule === 'schedule'}
            {#each filteredAppointments as appointment}
              <div class="list-item">
                <div class="item-main">
                  <h3>{appointment.title}</h3>
                  <p class="item-detail">{formatDate(appointment.date)} um {appointment.time}</p>
                </div>
                <div class="item-actions">
                  <button class="edit-btn" on:click={() => openEditModal('appointment', appointment)}>✏️</button>
                  <button class="delete-btn" on:click={() => deleteAppointment(appointment.id)}>🗑️</button>
                </div>
              </div>
            {/each}
            {#if filteredAppointments.length === 0}
              <p class="empty-state">Keine Termine gefunden</p>
            {/if}
          {:else if currentModule === 'documentation'}
            {#each filteredDocuments as document}
              <div class="list-item">
                <div class="item-main">
                  <h3>{document.title}</h3>
                  <p class="item-detail">{formatDate(document.date)} | {document.type}</p>
                </div>
                <div class="item-actions">
                  <button class="edit-btn" on:click={() => openEditModal('document', document)}>✏️</button>
                  <button class="delete-btn" on:click={() => deleteDocument(document.id)}>🗑️</button>
                </div>
              </div>
            {/each}
            {#if filteredDocuments.length === 0}
              <p class="empty-state">Keine Dokumente gefunden</p>
            {/if}
          {:else if currentModule === 'staff'}
            {#each filteredStaff as staffMember}
              <div class="list-item">
                <div class="item-main">
                  <h3>{staffMember.name}</h3>
                  <p class="item-detail">{staffMember.position} | {staffMember.phone}</p>
                </div>
                <div class="item-actions">
                  <button class="edit-btn" on:click={() => openEditModal('staff', staffMember)}>✏️</button>
                  <button class="delete-btn" on:click={() => deleteStaff(staffMember.id)}>🗑️</button>
                </div>
              </div>
            {/each}
            {#if filteredStaff.length === 0}
              <p class="empty-state">Keine Mitarbeiter gefunden</p>
            {/if}
          {/if}
        </div>
      </div>
    </div>

    {#if showAddModal}
      <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
          <button class="close-modal" on:click={closeModal}>×</button>
          <h2>{editingPatient?.id ? 'Patient bearbeiten' : 'Neuer Patient'}</h2>

          {#if editingPatient}
            <form on:submit|preventDefault={savePatient}>
              <label>
                Name
                <input type="text" bind:value={editingPatient.name} required />
              </label>
              <label>
                Geburtsdatum
                <input type="date" bind:value={editingPatient.birthDate} />
              </label>
              <label>
                Adresse
                <input type="text" bind:value={editingPatient.address} />
              </label>
              <label>
                Telefon
                <input type="tel" bind:value={editingPatient.phone} />
              </label>
              <label>
                Krankenkasse
                <input type="text" bind:value={editingPatient.insurance} />
              </label>
              <label>
                Diagnose
                <input type="text" bind:value={editingPatient.diagnosis} />
              </label>
              <label>
                Notizen
                <textarea bind:value={editingPatient.notes}></textarea>
              </label>
              <button type="submit" class="submit-button">Speichern</button>
            </form>
          {:else if editingAppointment}
            <h2>{editingAppointment?.id ? 'Termin bearbeiten' : 'Neuer Termin'}</h2>
            <form on:submit|preventDefault={saveAppointment}>
              <label>
                Titel
                <input type="text" bind:value={editingAppointment.title} required />
              </label>
              <label>
                Datum
                <input type="date" bind:value={editingAppointment.date} required />
              </label>
              <label>
                Uhrzeit
                <input type="time" bind:value={editingAppointment.time} required />
              </label>
              <label>
                Patient
                <select bind:value={editingAppointment.patientId}>
                  <option value="">-- Patient auswählen --</option>
                  {#each patients as patient}
                    <option value={patient.id}>{patient.name}</option>
                  {/each}
                </select>
              </label>
              <label>
                Mitarbeiter
                <select bind:value={editingAppointment.staffId}>
                  <option value="">-- Mitarbeiter auswählen --</option>
                  {#each staff as staffMember}
                    <option value={staffMember.id}>{staffMember.name}</option>
                  {/each}
                </select>
              </label>
              <label>
                Notizen
                <textarea bind:value={editingAppointment.notes}></textarea>
              </label>
              <button type="submit" class="submit-button">Speichern</button>
            </form>
          {:else if editingDocument}
            <h2>{editingDocument?.id ? 'Dokument bearbeiten' : 'Neues Dokument'}</h2>
            <form on:submit|preventDefault={saveDocument}>
              <label>
                Titel
                <input type="text" bind:value={editingDocument.title} required />
              </label>
              <label>
                Datum
                <input type="date" bind:value={editingDocument.date} required />
              </label>
              <label>
                Typ
                <select bind:value={editingDocument.type}>
                  <option value="">-- Typ auswählen --</option>
                  <option value="Bericht">Bericht</option>
                  <option value="Arztbrief">Arztbrief</option>
                  <option value="Verordnung">Verordnung</option>
                  <option value="Pflegeplan">Pflegeplan</option>
                </select>
              </label>
              <label>
                Patient
                <select bind:value={editingDocument.patientId}>
                  <option value="">-- Patient auswählen --</option>
                  {#each patients as patient}
                    <option value={patient.id}>{patient.name}</option>
                  {/each}
                </select>
              </label>
              <label>
                Notizen
                <textarea bind:value={editingDocument.notes}></textarea>
              </label>
              <button type="submit" class="submit-button">Speichern</button>
            </form>
          {:else if editingStaff}
            <h2>{editingStaff?.id ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}</h2>
            <form on:submit|preventDefault={saveStaff}>
              <label>
                Name
                <input type="text" bind:value={editingStaff.name} required />
              </label>
              <label>
                Position
                <input type="text" bind:value={editingStaff.position} />
              </label>
              <label>
                Telefon
                <input type="tel" bind:value={editingStaff.phone} />
              </label>
              <label>
                E-Mail
                <input type="email" bind:value={editingStaff.email} />
              </label>
              <label>
                Qualifikationen
                <textarea bind:value={editingStaff.qualifications}></textarea>
              </label>
              <label>
                Notizen
                <textarea bind:value={editingStaff.notes}></textarea>
              </label>
              <button type="submit" class="submit-button">Speichern</button>
            </form>
          {/if}
        </div>
      </div>
    {/if}
  {:else}
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
        <p>Version 1.4.0</p>
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
    padding: 2rem;
    padding-top: 6rem;
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

  .module-container {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 1000px;
    margin: 0 auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .module-header h1 {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #667eea;
    margin: 0;
    font-size: 2rem;
  }

  .module-icon {
    font-size: 2.5rem;
  }

  .add-button {
    padding: 0.8rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
  }

  .search-bar input {
    width: 100%;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    font-size: 1rem;
    margin-bottom: 2rem;
    box-sizing: border-box;
  }

  .search-bar input:focus {
    outline: none;
    border-color: #667eea;
  }

  .content-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 10px;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .list-item:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .item-main h3 {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.2rem;
  }

  .item-detail {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
  }

  .edit-btn, .delete-btn {
    padding: 0.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: transform 0.2s;
  }

  .edit-btn:hover, .delete-btn:hover {
    transform: scale(1.1);
  }

  .edit-btn {
    background: #4CAF50;
    color: white;
  }

  .delete-btn {
    background: #f44336;
    color: white;
  }

  .empty-state {
    text-align: center;
    padding: 3rem;
    color: #999;
    font-size: 1.1rem;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-modal {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #666;
  }

  .modal-content h2 {
    color: #667eea;
    margin: 0 0 1.5rem 0;
    padding-right: 2rem;
  }

  .modal-content form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .modal-content label {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .modal-content label input,
  .modal-content label select,
  .modal-content label textarea {
    padding: 0.8rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
  }

  .modal-content label input:focus,
  .modal-content label select:focus,
  .modal-content label textarea:focus {
    outline: none;
    border-color: #667eea;
  }

  .modal-content label textarea {
    min-height: 100px;
    resize: vertical;
  }

  .submit-button {
    padding: 1rem 2rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 10px;
    font-weight: bold;
    font-size: 1.1rem;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .submit-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
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
