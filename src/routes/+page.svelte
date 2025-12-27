<script lang="ts">
  import { onMount } from 'svelte';
  import type { Document, DocumentTemplate, Patient, Appointment, Staff, DocumentCategory, DocumentStatus } from '$lib/types';
  import { DOCUMENT_CATEGORIES } from '$lib/types';
  import { StorageService } from '$lib/storageService';
  import { searchDocuments, changeDocumentStatus, addApprovalRecord, restoreVersion, addAuditLog, classifyDocument, extractMetadata } from '$lib/documentService';
  import DocumentForm from '$lib/components/DocumentForm.svelte';
  import DocumentDetail from '$lib/components/DocumentDetail.svelte';
  import DocumentSearch from '$lib/components/DocumentSearch.svelte';

  let platform = 'web';
  let currentModule: string | null = null;
  let currentView: 'list' | 'detail' | 'form' = 'list';
  let selectedDocument: Document | null = null;

  onMount(() => {
    if (typeof window !== 'undefined' && window.electron) {
      platform = window.electron.platform;
    }
    StorageService.init();
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

  let patients: Patient[] = [];
  let appointments: Appointment[] = [];
  let documents: Document[] = [];
  let staff: Staff[] = [];
  let templates: DocumentTemplate[] = [];

  let editingPatient: Patient | null = null;
  let editingAppointment: Appointment | null = null;
  let editingDocument: Document | null = null;
  let editingStaff: Staff | null = null;
  let showAddModal = false;

  let searchQuery = '';
  let docSearchQuery = '';
  let docSelectedCategory: DocumentCategory | '' = '';
  let docSelectedStatus: DocumentStatus | '' = '';
  let docSelectedTags: string[] = [];

  function loadFromStorage() {
    patients = StorageService.getPatients();
    appointments = StorageService.getAppointments();
    documents = StorageService.getDocuments();
    staff = StorageService.getStaff();
    templates = StorageService.getTemplates();
  }

  function savePatients() {
    StorageService.savePatients(patients);
  }

  function saveAppointments() {
    StorageService.saveAppointments(appointments);
  }

  function saveDocuments() {
    StorageService.saveDocuments(documents);
  }

  function saveStaff() {
    StorageService.saveStaff(staff);
  }

  function openModule(moduleId: string) {
    currentModule = moduleId;
    currentView = 'list';
  }

  function goBack() {
    if (currentView === 'detail' || currentView === 'form') {
      currentView = 'list';
      selectedDocument = null;
      editingDocument = null;
    } else {
      currentModule = null;
    }
  }

  function openAddModal(moduleId?: string) {
    const type = moduleId || currentModule;
    
    if (type === 'patients' || type === 'patient') {
      editingPatient = { id: '', name: '', birthDate: '', address: '', phone: '', insurance: '', diagnosis: '', notes: '' };
      showAddModal = true;
    } else if (type === 'schedule' || type === 'appointment') {
      editingAppointment = { id: '', title: '', date: '', time: '', patientId: '', staffId: '', notes: '' };
      showAddModal = true;
    } else if (type === 'documentation' || type === 'document') {
      editingDocument = null;
      currentView = 'form';
    } else if (type === 'staff') {
      editingStaff = { id: '', name: '', position: '', phone: '', email: '', qualifications: '', notes: '' };
      showAddModal = true;
    }
  }

  function openEditModal(type: string, item: any) {
    if (type === 'patient') {
      editingPatient = { ...item };
    } else if (type === 'appointment') {
      editingAppointment = { ...item };
    } else if (type === 'document') {
      editingDocument = item;
      currentView = 'form';
      return;
    } else if (type === 'staff') {
      editingStaff = { ...item };
    }
    showAddModal = true;
  }

  function viewDocument(doc: Document) {
    selectedDocument = addAuditLog(doc, 'view', 'Dokument angezeigt');
    const index = documents.findIndex(d => d.id === doc.id);
    if (index !== -1) {
      documents[index] = selectedDocument;
      saveDocuments();
    }
    currentView = 'detail';
  }

  function closeModal() {
    editingPatient = null;
    editingAppointment = null;
    editingDocument = null;
    editingStaff = null;
    showAddModal = false;
  }

  function savePatient() {
    if (!editingPatient) return;
    
    if (editingPatient.id) {
      const index = patients.findIndex(p => p.id === editingPatient!.id);
      if (index !== -1) patients[index] = editingPatient;
    } else {
      editingPatient.id = Date.now().toString();
      patients = [...patients, editingPatient];
    }
    savePatients();
    closeModal();
  }

  function saveAppointment() {
    if (!editingAppointment) return;
    
    if (editingAppointment.id) {
      const index = appointments.findIndex(a => a.id === editingAppointment!.id);
      if (index !== -1) appointments[index] = editingAppointment;
    } else {
      editingAppointment.id = Date.now().toString();
      appointments = [...appointments, editingAppointment];
    }
    saveAppointments();
    closeModal();
  }

  function handleDocumentSave(event: CustomEvent<Document>) {
    const doc = event.detail;
    
    if (doc.id && documents.find(d => d.id === doc.id)) {
      const index = documents.findIndex(d => d.id === doc.id);
      if (index !== -1) {
        documents[index] = doc;
      }
    } else {
      documents = [...documents, doc];
    }
    
    saveDocuments();
    currentView = 'list';
    editingDocument = null;
  }

  function handleDocumentCancel() {
    currentView = 'list';
    editingDocument = null;
  }

  function handleDocumentEdit(event: CustomEvent<Document>) {
    editingDocument = event.detail;
    currentView = 'form';
  }

  function handleDocumentDelete(event: CustomEvent<string>) {
    const docId = event.detail;
    const doc = documents.find(d => d.id === docId);
    
    if (doc && confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      const updated = changeDocumentStatus(doc, 'deleted', 'Benutzer hat Dokument gelöscht');
      const index = documents.findIndex(d => d.id === docId);
      if (index !== -1) {
        documents[index] = updated;
        saveDocuments();
      }
      currentView = 'list';
    }
  }

  function handleRestoreVersion(event: CustomEvent<{ documentId: string; versionNumber: number }>) {
    const { documentId, versionNumber } = event.detail;
    const doc = documents.find(d => d.id === documentId);
    
    if (doc) {
      try {
        const restored = restoreVersion(doc, versionNumber);
        const index = documents.findIndex(d => d.id === documentId);
        if (index !== -1) {
          documents[index] = restored;
          selectedDocument = restored;
          saveDocuments();
        }
      } catch (error) {
        alert('Fehler beim Wiederherstellen der Version: ' + (error as Error).message);
      }
    }
  }

  function handleApprove(event: CustomEvent<string>) {
    const docId = event.detail;
    const doc = documents.find(d => d.id === docId);
    
    const comment = prompt('Freigabe-Kommentar (optional):');
    if (comment === null) return;
    
    if (doc) {
      const approved = addApprovalRecord(doc, 'system', 'approved', comment || undefined);
      const index = documents.findIndex(d => d.id === docId);
      if (index !== -1) {
        documents[index] = approved;
        selectedDocument = approved;
        saveDocuments();
      }
    }
  }

  function handleReject(event: CustomEvent<string>) {
    const docId = event.detail;
    const doc = documents.find(d => d.id === docId);
    
    const comment = prompt('Ablehnungsgrund (optional):');
    if (comment === null) return;
    
    if (doc) {
      const rejected = addApprovalRecord(doc, 'system', 'rejected', comment || undefined);
      const index = documents.findIndex(d => d.id === docId);
      if (index !== -1) {
        documents[index] = rejected;
        selectedDocument = rejected;
        saveDocuments();
      }
    }
  }

  function saveStaffMember() {
    if (!editingStaff) return;
    
    if (editingStaff.id) {
      const index = staff.findIndex(s => s.id === editingStaff!.id);
      if (index !== -1) staff[index] = editingStaff;
    } else {
      editingStaff.id = Date.now().toString();
      staff = [...staff, editingStaff];
    }
    saveStaff();
    closeModal();
  }

  function deletePatient(id: string) {
    if (confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      patients = patients.filter(p => p.id !== id);
      savePatients();
    }
  }

  function deleteAppointment(id: string) {
    if (confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      appointments = appointments.filter(a => a.id !== id);
      saveAppointments();
    }
  }

  function deleteStaffMember(id: string) {
    if (confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      staff = staff.filter(s => s.id !== id);
      saveStaff();
    }
  }

  $: filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredAppointments = appointments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredDocuments = searchDocuments(documents, docSearchQuery, {
    category: docSelectedCategory || undefined,
    status: docSelectedStatus || undefined,
    tags: docSelectedTags.length > 0 ? docSelectedTags : undefined
  }).filter(d => d.status !== 'deleted');

  $: filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: allTags = Array.from(new Set(documents.flatMap(d => d.tags)));

  function formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function getCategoryLabel(category: DocumentCategory): string {
    return DOCUMENT_CATEGORIES.find(c => c.value === category)?.label || category;
  }

  function getStatusBadge(status: DocumentStatus): string {
    switch (status) {
      case 'draft': return '📝';
      case 'active': return '✅';
      case 'archived': return '📦';
      case 'deleted': return '🗑️';
      default: return '📄';
    }
  }
</script>

<main>
  {#if currentModule}
    <div class="module-detail">
      <button class="back-button" on:click={goBack}>
        ← {currentView === 'list' ? 'Zurück zum Dashboard' : 'Zurück zur Liste'}
      </button>

      <div class="module-container">
        {#if currentView === 'list'}
          <header class="module-header">
            <h1>
              <span class="module-icon">{modules.find(m => m.id === currentModule)?.icon}</span>
              {modules.find(m => m.id === currentModule)?.title}
            </h1>
            <button class="add-button" on:click={() => openAddModal()}>
              + Hinzufügen
            </button>
          </header>

          {#if currentModule === 'documentation'}
            <DocumentSearch
              bind:searchQuery={docSearchQuery}
              bind:selectedCategory={docSelectedCategory}
              bind:selectedStatus={docSelectedStatus}
              bind:selectedTags={docSelectedTags}
              availableTags={allTags}
              on:search={() => {}}
            />
          {:else}
            <div class="search-bar">
              <input type="text" placeholder="🔍 Suchen..." bind:value={searchQuery} />
            </div>
          {/if}

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
                <div class="list-item document-item" on:click={() => viewDocument(document)} role="button" tabindex="0">
                  <div class="item-main">
                    <div class="doc-header">
                      <h3>
                        {getStatusBadge(document.status)} {document.title}
                        <span class="version-badge">v{document.version}</span>
                      </h3>
                      {#if document.approvalStatus === 'approved'}
                        <span class="approval-badge">✓ Freigegeben</span>
                      {:else if document.approvalStatus === 'pending'}
                        <span class="approval-badge pending">⏳ Ausstehend</span>
                      {/if}
                    </div>
                    <p class="item-detail">
                      {getCategoryLabel(document.category)} | {formatDate(document.createdAt)}
                      {#if document.patientId}
                        | {patients.find(p => p.id === document.patientId)?.name || 'Unbekannt'}
                      {/if}
                    </p>
                    {#if document.tags.length > 0}
                      <div class="doc-tags">
                        {#each document.tags.slice(0, 3) as tag}
                          <span class="tag-mini">{tag}</span>
                        {/each}
                        {#if document.tags.length > 3}
                          <span class="tag-mini">+{document.tags.length - 3}</span>
                        {/if}
                      </div>
                    {/if}
                  </div>
                  <div class="item-actions">
                    <button class="view-btn" on:click|stopPropagation={() => viewDocument(document)}>👁️</button>
                    <button class="edit-btn" on:click|stopPropagation={() => openEditModal('document', document)}>✏️</button>
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
                    <button class="delete-btn" on:click={() => deleteStaffMember(staffMember.id)}>🗑️</button>
                  </div>
                </div>
              {/each}
              {#if filteredStaff.length === 0}
                <p class="empty-state">Keine Mitarbeiter gefunden</p>
              {/if}
            {/if}
          </div>
        {:else if currentView === 'form'}
          <DocumentForm
            document={editingDocument}
            {patients}
            {templates}
            on:save={handleDocumentSave}
            on:cancel={handleDocumentCancel}
          />
        {:else if currentView === 'detail' && selectedDocument}
          <DocumentDetail
            document={selectedDocument}
            {patients}
            {staff}
            on:edit={handleDocumentEdit}
            on:delete={handleDocumentDelete}
            on:restoreVersion={handleRestoreVersion}
            on:approve={handleApprove}
            on:reject={handleReject}
          />
        {/if}
      </div>
    </div>

    {#if showAddModal}
      <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
          <button class="close-modal" on:click={closeModal}>×</button>

          {#if editingPatient}
            <h2>{editingPatient?.id ? 'Patient bearbeiten' : 'Neuer Patient'}</h2>
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
          {:else if editingStaff}
            <h2>{editingStaff?.id ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}</h2>
            <form on:submit|preventDefault={saveStaffMember}>
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
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{patients.length}</div>
            <div class="stat-label">Patienten</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{documents.filter(d => d.status !== 'deleted').length}</div>
            <div class="stat-label">Dokumente</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{appointments.length}</div>
            <div class="stat-label">Termine</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{staff.length}</div>
            <div class="stat-label">Mitarbeiter</div>
          </div>
        </div>
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
        <p>Version 1.7.0 • Professional Document Management System</p>
        <div class="footer-links">
          <span>🚀 Powered by PflegeDMS • Made with ❤️</span>
        </div>
      </footer>
    </div>
  {/if}
</main>

<style>
  * {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    background-attachment: fixed;
    min-height: 100vh;
    overflow-x: hidden;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }

  main {
    padding: 20px;
    max-width: 1400px;
    margin: 0 auto;
  }

  .dashboard {
    text-align: center;
    animation: fadeIn 0.6s ease-out;
  }

  .header {
    background: white;
    padding: 50px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;
    position: relative;
    animation: fadeIn 0.8s ease-out;
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  }

  .header h1 {
    margin: 0;
    font-size: 3.5rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -1px;
    animation: slideIn 0.8s ease-out;
  }

  .subtitle {
    margin: 10px 0 0 0;
    color: #666;
    font-size: 1.2rem;
  }

  .platform-badge {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    background: #667eea;
    color: white;
    border-radius: 20px;
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  .welcome-section {
    background: white;
    padding: 40px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    margin-bottom: 40px;
    animation: fadeIn 1s ease-out 0.2s both;
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  }

  .welcome-section h2 {
    margin-top: 0;
    color: #1f2937;
    font-size: 2rem;
    font-weight: 700;
  }
  
  .welcome-section p {
    color: #6b7280;
    font-size: 1.1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .stat-card {
    padding: 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px;
    color: white;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  
  .stat-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  
  .stat-card:hover::before {
    opacity: 1;
  }

  .stat-value {
    font-size: 3rem;
    font-weight: 900;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  }

  .stat-label {
    font-size: 1rem;
    opacity: 0.95;
    margin-top: 8px;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }

  .module-card {
    background: white;
    padding: 35px;
    border-radius: 20px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    border-left: 6px solid var(--module-color);
    position: relative;
    overflow: hidden;
  }
  
  .module-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--module-color) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  .module-card:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.35);
    border-left-width: 8px;
  }
  
  .module-card:hover::before {
    opacity: 0.05;
  }

  .module-icon {
    font-size: 3.5rem;
    margin-bottom: 20px;
    display: inline-block;
    transition: transform 0.3s ease;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
  }
  
  .module-card:hover .module-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .module-info h3 {
    margin: 0 0 12px 0;
    color: #1f2937;
    font-size: 1.5rem;
    font-weight: 700;
    position: relative;
    z-index: 1;
  }

  .module-info p {
    margin: 0;
    color: #6b7280;
    font-size: 1rem;
    line-height: 1.6;
    position: relative;
    z-index: 1;
  }

  .footer {
    background: white;
    padding: 30px;
    border-radius: 20px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    color: #6b7280;
    animation: fadeIn 1.2s ease-out 0.4s both;
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
  }

  .footer p {
    margin: 0 0 10px 0;
    font-weight: 600;
    font-size: 1.1rem;
    color: #374151;
  }
  
  .footer-links {
    margin-top: 10px;
    font-size: 0.95rem;
    opacity: 0.8;
  }

  .module-detail {
    background: white;
    border-radius: 16px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    min-height: 80vh;
  }

  .back-button {
    padding: 10px 20px;
    background: #6b7280;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 20px;
    transition: background 0.2s;
  }

  .back-button:hover {
    background: #4b5563;
  }

  .module-container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e5e7eb;
  }

  .module-header h1 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 15px;
    color: #1f2937;
  }

  .add-button {
    padding: 14px 28px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 700;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
    position: relative;
    overflow: hidden;
  }
  
  .add-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s ease;
  }
  
  .add-button:hover::before {
    left: 100%;
  }

  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
  }
  
  .add-button:active {
    transform: translateY(0);
  }

  .search-bar {
    margin-bottom: 20px;
  }

  .search-bar input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #d1d5db;
    border-radius: 8px;
    font-size: 15px;
  }

  .search-bar input:focus {
    outline: none;
    border-color: #3b82f6;
  }

  .content-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    background: linear-gradient(to right, #f9fafb, #ffffff);
    border-radius: 12px;
    border-left: 5px solid #3b82f6;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    animation: fadeIn 0.5s ease-out;
  }

  .list-item:hover {
    background: linear-gradient(to right, #f3f4f6, #f9fafb);
    transform: translateX(5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    border-left-width: 6px;
  }

  .document-item {
    cursor: pointer;
  }
  
  .document-item:hover {
    border-left-color: #667eea;
  }

  .item-main {
    flex: 1;
  }

  .item-main h3 {
    margin: 0 0 8px 0;
    color: #1f2937;
    font-size: 1.1rem;
  }

  .doc-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .version-badge {
    font-size: 0.75rem;
    padding: 2px 8px;
    background: #e5e7eb;
    color: #6b7280;
    border-radius: 12px;
    font-weight: normal;
  }

  .approval-badge {
    font-size: 0.75rem;
    padding: 4px 10px;
    background: #d1fae5;
    color: #065f46;
    border-radius: 12px;
    font-weight: 600;
  }

  .approval-badge.pending {
    background: #fef3c7;
    color: #92400e;
  }

  .item-detail {
    margin: 0;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .doc-tags {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .tag-mini {
    font-size: 0.75rem;
    padding: 2px 8px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 10px;
  }

  .item-actions {
    display: flex;
    gap: 8px;
  }

  .view-btn,
  .edit-btn,
  .delete-btn {
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 18px;
    background: #e5e7eb;
    transition: background 0.2s;
  }

  .view-btn:hover {
    background: #3b82f6;
  }

  .edit-btn:hover {
    background: #fbbf24;
  }

  .delete-btn:hover {
    background: #ef4444;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: #9ca3af;
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
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 30px;
    border-radius: 16px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
  }

  .close-modal {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    font-size: 30px;
    cursor: pointer;
    color: #6b7280;
    line-height: 1;
  }

  .close-modal:hover {
    color: #1f2937;
  }

  .modal-content h2 {
    margin-top: 0;
    color: #1f2937;
  }

  form label {
    display: block;
    margin-bottom: 16px;
    font-weight: 500;
    color: #374151;
  }

  form input,
  form select,
  form textarea {
    display: block;
    width: 100%;
    margin-top: 4px;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
  }

  form textarea {
    resize: vertical;
    min-height: 80px;
  }

  .submit-button {
    width: 100%;
    padding: 12px;
    background: #10b981;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 16px;
    font-weight: 600;
    margin-top: 10px;
  }

  .submit-button:hover {
    background: #059669;
  }
</style>
