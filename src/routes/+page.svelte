<script>
  import { onMount } from 'svelte';
  import { formatDate, formatTime } from '../lib/services/utilService';

  let platform = 'web';
  let currentModule = null;
  let currentUser = null;
  let isAuthenticated = false;
  let authToken = null;

  // Data arrays
  let patients = [];
  let appointments = [];
  let documents = [];
  let staff = [];
  let users = [];

  // Editing states
  let editingPatient = null;
  let editingAppointment = null;
  let editingDocument = null;
  let editingStaff = null;
  let editingUser = null;
  let showAddModal = false;

  // Search and filter
  let searchQuery = '';

  // Login form
  let showLoginModal = false;
  let loginUsername = '';
  let loginPassword = '';
  let loginError = '';

  onMount(async () => {
    if (typeof window !== 'undefined' && window.electron) {
      platform = window.electron.platform;
    }
    
    // Check for existing auth token
    const storedToken = localStorage.getItem('pflegedms_auth_token');
    if (storedToken) {
      await verifyToken(storedToken);
    }
    
    // Load initial data if authenticated
    if (isAuthenticated) {
      await loadData();
    } else {
      showLoginModal = true;
    }
  });

  const modules = [
    {
      id: 'patients',
      title: 'Patientenverwaltung',
      icon: '📋',
      description: 'Verwalten Sie Ihre Patienteninformationen',
      color: '#4F46E5',
      permission: 'read_patient'
    },
    {
      id: 'schedule',
      title: 'Terminplanung',
      icon: '📅',
      description: 'Planen und verwalten Sie Termine',
      color: '#059669',
      permission: 'read_appointment'
    },
    {
      id: 'documentation',
      title: 'Dokumentation',
      icon: '📄',
      description: 'Erstellen und verwalten Sie Dokumentationen',
      color: '#DC2626',
      permission: 'read_document'
    },
    {
      id: 'staff',
      title: 'Mitarbeiterverwaltung',
      icon: '👥',
      description: 'Verwalten Sie Ihr Pflegeteam',
      color: '#7C3AED',
      permission: 'manage_users'
    },
    {
      id: 'users',
      title: 'Benutzerverwaltung',
      icon: '👤',
      description: 'Verwalten Sie Benutzer und Berechtigungen',
      color: '#F59E0B',
      permission: 'manage_users'
    },
    {
      id: 'audit',
      title: 'Audit-Logs',
      icon: '📊',
      description: 'Anzeigen von Systemaktivitäten',
      color: '#10B981',
      permission: 'view_audit_logs'
    }
  ];

  async function loadData() {
    try {
      if (!isAuthenticated) return;

      // Load patients
      patients = await window.electron.database.getPatients({ search: searchQuery });
      
      // Load appointments
      appointments = await window.electron.database.getAppointments({ search: searchQuery });
      
      // Load documents
      documents = await window.electron.database.getDocuments({ search: searchQuery });
      
      // Load staff
      staff = await window.electron.database.getStaff({ search: searchQuery });
      
      // Load users (if admin)
      if (currentUser && window.electron.database.hasRole(currentUser.id, 'admin')) {
        users = await window.electron.database.getUsers({ search: searchQuery });
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }

  async function verifyToken(token) {
    try {
      const result = await window.electron.database.verifyToken(token);
      if (result.valid) {
        currentUser = result.user;
        isAuthenticated = true;
        authToken = token;
        localStorage.setItem('pflegedms_auth_token', token);
        await loadData();
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  }

  async function login() {
    try {
      const result = await window.electron.database.login(loginUsername, loginPassword);
      
      if (result.success) {
        currentUser = result.user;
        isAuthenticated = true;
        authToken = result.token;
        localStorage.setItem('pflegedms_auth_token', result.token);
        loginError = '';
        showLoginModal = false;
        await loadData();
      } else {
        loginError = result.error || 'Anmeldung fehlgeschlagen';
      }
    } catch (error) {
      console.error('Login error:', error);
      loginError = 'Anmeldung fehlgeschlagen';
    }
  }

  function logout() {
    currentUser = null;
    isAuthenticated = false;
    authToken = null;
    localStorage.removeItem('pflegedms_auth_token');
    showLoginModal = true;
  }

  function checkPermission(permission) {
    if (!currentUser) return false;
    return window.electron.database.checkPermission(currentUser.id, permission);
  }

  function hasRole(role) {
    if (!currentUser) return false;
    return window.electron.database.hasRole(currentUser.id, role);
  }

  function openModule(moduleId) {
    const module = modules.find(m => m.id === moduleId);
    if (module && module.permission && !checkPermission(module.permission)) {
      alert('Sie haben keine Berechtigung für dieses Modul');
      return;
    }
    currentModule = moduleId;
  }

  function goBack() {
    currentModule = null;
  }

  function openAddModal(type) {
    if (type === 'patient' && !checkPermission('create_patient')) {
      alert('Sie haben keine Berechtigung zum Erstellen von Patienten');
      return;
    }
    
    if (type === 'appointment' && !checkPermission('create_appointment')) {
      alert('Sie haben keine Berechtigung zum Erstellen von Terminen');
      return;
    }
    
    if (type === 'document' && !checkPermission('create_document')) {
      alert('Sie haben keine Berechtigung zum Erstellen von Dokumenten');
      return;
    }
    
    if (type === 'staff' && !checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Erstellen von Mitarbeitern');
      return;
    }
    
    if (type === 'user' && !checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Erstellen von Benutzern');
      return;
    }
    
    if (type === 'patient') {
      editingPatient = { 
        id: null, 
        first_name: '', 
        last_name: '', 
        birth_date: '', 
        address: '', 
        phone: '', 
        insurance: '', 
        diagnosis: '', 
        notes: '' 
      };
    } else if (type === 'appointment') {
      editingAppointment = { 
        id: null,
        title: '', 
        appointment_date: '', 
        appointment_time: '', 
        patient_id: null, 
        staff_id: null, 
        notes: '' 
      };
    } else if (type === 'document') {
      editingDocument = { 
        id: null,
        title: '', 
        document_date: '', 
        patient_id: null, 
        document_type: '', 
        notes: '' 
      };
    } else if (type === 'staff') {
      editingStaff = { 
        id: null,
        first_name: '', 
        last_name: '', 
        position: '', 
        phone: '', 
        email: '', 
        qualifications: '', 
        notes: '' 
      };
    } else if (type === 'user') {
      editingUser = { 
        id: null,
        username: '', 
        email: '', 
        first_name: '', 
        last_name: '', 
        password: '', 
        is_active: true 
      };
    }
    
    showAddModal = true;
  }

  function openEditModal(type, item) {
    if (type === 'patient' && !checkPermission('update_patient')) {
      alert('Sie haben keine Berechtigung zum Bearbeiten von Patienten');
      return;
    }
    
    if (type === 'appointment' && !checkPermission('update_appointment')) {
      alert('Sie haben keine Berechtigung zum Bearbeiten von Terminen');
      return;
    }
    
    if (type === 'document' && !checkPermission('update_document')) {
      alert('Sie haben keine Berechtigung zum Bearbeiten von Dokumenten');
      return;
    }
    
    if (type === 'staff' && !checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Bearbeiten von Mitarbeitern');
      return;
    }
    
    if (type === 'user' && !checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Bearbeiten von Benutzern');
      return;
    }
    
    if (type === 'patient') {
      editingPatient = { ...item };
    } else if (type === 'appointment') {
      editingAppointment = { ...item };
    } else if (type === 'document') {
      editingDocument = { ...item };
    } else if (type === 'staff') {
      editingStaff = { ...item };
    } else if (type === 'user') {
      editingUser = { ...item, password: '' };
    }
    
    showAddModal = true;
  }

  function closeModal() {
    editingPatient = null;
    editingAppointment = null;
    editingDocument = null;
    editingStaff = null;
    editingUser = null;
    showAddModal = false;
  }

  async function savePatient() {
    try {
      if (editingPatient.id) {
        await window.electron.database.updatePatient(editingPatient.id, editingPatient, currentUser.id);
      } else {
        await window.electron.database.createPatient(editingPatient, currentUser.id);
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save patient:', error);
      alert('Fehler beim Speichern des Patienten');
    }
  }

  async function saveAppointment() {
    try {
      if (editingAppointment.id) {
        await window.electron.database.updateAppointment(editingAppointment.id, editingAppointment, currentUser.id);
      } else {
        await window.electron.database.createAppointment(editingAppointment, currentUser.id);
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save appointment:', error);
      alert('Fehler beim Speichern des Termins');
    }
  }

  async function saveDocument() {
    try {
      if (editingDocument.id) {
        await window.electron.database.updateDocument(editingDocument.id, editingDocument, currentUser.id);
      } else {
        await window.electron.database.createDocument(editingDocument, currentUser.id);
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Fehler beim Speichern des Dokuments');
    }
  }

  async function saveStaff() {
    try {
      if (editingStaff.id) {
        await window.electron.database.updateStaff(editingStaff.id, editingStaff, currentUser.id);
      } else {
        await window.electron.database.createStaff(editingStaff, currentUser.id);
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save staff:', error);
      alert('Fehler beim Speichern des Mitarbeiters');
    }
  }

  async function saveUser() {
    try {
      if (editingUser.id) {
        // Update existing user
        const userData = {
          username: editingUser.username,
          email: editingUser.email,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          is_active: editingUser.is_active
        };
        
        await window.electron.database.updateUser(editingUser.id, userData, currentUser.id);
        
        // Update password if provided
        if (editingUser.password) {
          const passwordHash = await window.electron.database.updateUserPassword(
            editingUser.id,
            editingUser.password,
            currentUser.id
          );
        }
      } else {
        // Create new user
        const passwordHash = await bcrypt.hash(editingUser.password, 10);
        const newUser = {
          username: editingUser.username,
          email: editingUser.email,
          password_hash: passwordHash,
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          is_active: editingUser.is_active
        };
        
        await window.electron.database.createUser(newUser);
      }
      
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Fehler beim Speichern des Benutzers');
    }
  }

  async function deletePatient(id) {
    if (!checkPermission('delete_patient')) {
      alert('Sie haben keine Berechtigung zum Löschen von Patienten');
      return;
    }
    
    if (confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      try {
        await window.electron.database.deletePatient(id, currentUser.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete patient:', error);
        alert('Fehler beim Löschen des Patienten');
      }
    }
  }

  async function deleteAppointment(id) {
    if (!checkPermission('delete_appointment')) {
      alert('Sie haben keine Berechtigung zum Löschen von Terminen');
      return;
    }
    
    if (confirm('Möchten Sie diesen Termin wirklich löschen?')) {
      try {
        await window.electron.database.deleteAppointment(id, currentUser.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete appointment:', error);
        alert('Fehler beim Löschen des Termins');
      }
    }
  }

  async function deleteDocument(id) {
    if (!checkPermission('delete_document')) {
      alert('Sie haben keine Berechtigung zum Löschen von Dokumenten');
      return;
    }
    
    if (confirm('Möchten Sie dieses Dokument wirklich löschen?')) {
      try {
        await window.electron.database.deleteDocument(id, currentUser.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Fehler beim Löschen des Dokuments');
      }
    }
  }

  async function deleteStaff(id) {
    if (!checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Löschen von Mitarbeitern');
      return;
    }
    
    if (confirm('Möchten Sie diesen Mitarbeiter wirklich löschen?')) {
      try {
        await window.electron.database.deleteStaff(id, currentUser.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete staff:', error);
        alert('Fehler beim Löschen des Mitarbeiters');
      }
    }
  }

  async function deleteUser(id) {
    if (!checkPermission('manage_users')) {
      alert('Sie haben keine Berechtigung zum Löschen von Benutzern');
      return;
    }
    
    if (confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      try {
        await window.electron.database.deleteUser(id, currentUser.id);
        await loadData();
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Fehler beim Löschen des Benutzers');
      }
    }
  }

  // Filtered data using reactive statements
  $: filteredPatients = patients.filter(p => 
    p.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.diagnosis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredAppointments = appointments.filter(a =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (a.patient_name && a.patient_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  $: filteredDocuments = documents.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.patient_name && d.patient_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  $: filteredStaff = staff.filter(s =>
    s.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.position?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
</script>

<main>
  {#if !isAuthenticated}
    <div class="login-modal">
      <div class="login-content">
        <h2>PflegeDMS Anmeldung</h2>
        <form on:submit|preventDefault={login}>
          <div class="form-group">
            <label>Benutzername</label>
            <input type="text" bind:value={loginUsername} required />
          </div>
          <div class="form-group">
            <label>Passwort</label>
            <input type="password" bind:value={loginPassword} required />
          </div>
          {#if loginError}
            <div class="error-message">{loginError}</div>
          {/if}
          <button type="submit" class="login-button">Anmelden</button>
        </form>
        <div class="login-info">
          <p>Standard-Anmeldung: admin/admin123</p>
        </div>
      </div>
    </div>
  {:else if currentModule}
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
          {#if currentModule !== 'audit'}
            <button class="add-button" on:click={() => openAddModal(currentModule.slice(0, -1))}>
              + Hinzufügen
            </button>
          {/if}
        </header>

        <div class="search-bar">
          <input type="text" placeholder="🔍 Suchen..." bind:value={searchQuery} />
        </div>

        <div class="content-list">
          {#if currentModule === 'patients'}
            {#each filteredPatients as patient}
              <div class="list-item">
                <div class="item-main">
                  <h3>{patient.first_name} {patient.last_name}</h3>
                  <p class="item-detail">{formatDate(patient.birth_date)} | {patient.insurance}</p>
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
                  <p class="item-detail">{formatDate(appointment.appointment_date)} um {formatTime(appointment.appointment_time)}</p>
                  {#if appointment.patient_name}
                    <p class="item-subdetail">Patient: {appointment.patient_name}</p>
                  {/if}
                  {#if appointment.staff_name}
                    <p class="item-subdetail">Mitarbeiter: {appointment.staff_name}</p>
                  {/if}
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
                  <p class="item-detail">{formatDate(document.document_date)} | {document.document_type}</p>
                  {#if document.patient_name}
                    <p class="item-subdetail">Patient: {document.patient_name}</p>
                  {/if}
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
                  <h3>{staffMember.first_name} {staffMember.last_name}</h3>
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
          {:else if currentModule === 'users'}
            {#each filteredUsers as user}
              <div class="list-item">
                <div class="item-main">
                  <h3>{user.username}</h3>
                  <p class="item-detail">{user.email}</p>
                  <p class="item-subdetail">{user.first_name} {user.last_name}</p>
                </div>
                <div class="item-actions">
                  <button class="edit-btn" on:click={() => openEditModal('user', user)}>✏️</button>
                  <button class="delete-btn" on:click={() => deleteUser(user.id)}>🗑️</button>
                </div>
              </div>
            {/each}
            {#if filteredUsers.length === 0}
              <p class="empty-state">Keine Benutzer gefunden</p>
            {/if}
          {:else if currentModule === 'audit'}
            <div class="audit-logs">
              <h3>Audit-Logs</h3>
              <p>Systemaktivitäten und Benutzeraktionen werden hier protokolliert.</p>
              <!-- Audit log display would go here -->
            </div>
          {/if}
        </div>
      </div>
    </div>

    {#if showAddModal}
      <div class="modal-overlay" on:click={closeModal}>
        <div class="modal-content" on:click|stopPropagation>
          <button class="close-modal" on:click={closeModal}>×</button>
          
          {#if editingPatient}
            <h2>{editingPatient?.id ? 'Patient bearbeiten' : 'Neuer Patient'}</h2>
            <form on:submit|preventDefault={savePatient}>
              <div class="form-grid">
                <label>
                  Vorname
                  <input type="text" bind:value={editingPatient.first_name} required />
                </label>
                <label>
                  Nachname
                  <input type="text" bind:value={editingPatient.last_name} required />
                </label>
              </div>
              <label>
                Geburtsdatum
                <input type="date" bind:value={editingPatient.birth_date} />
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
              <div class="form-grid">
                <label>
                  Datum
                  <input type="date" bind:value={editingAppointment.appointment_date} required />
                </label>
                <label>
                  Uhrzeit
                  <input type="time" bind:value={editingAppointment.appointment_time} required />
                </label>
              </div>
              <label>
                Patient
                <select bind:value={editingAppointment.patient_id}>
                  <option value="">-- Patient auswählen --</option>
                  {#each patients as patient}
                    <option value={patient.id}>{patient.first_name} {patient.last_name}</option>
                  {/each}
                </select>
              </label>
              <label>
                Mitarbeiter
                <select bind:value={editingAppointment.staff_id}>
                  <option value="">-- Mitarbeiter auswählen --</option>
                  {#each staff as staffMember}
                    <option value={staffMember.id}>{staffMember.first_name} {staffMember.last_name}</option>
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
                <input type="date" bind:value={editingDocument.document_date} required />
              </label>
              <label>
                Typ
                <select bind:value={editingDocument.document_type}>
                  <option value="">-- Typ auswählen --</option>
                  <option value="Bericht">Bericht</option>
                  <option value="Arztbrief">Arztbrief</option>
                  <option value="Verordnung">Verordnung</option>
                  <option value="Pflegeplan">Pflegeplan</option>
                  <option value="Laborbericht">Laborbericht</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </label>
              <label>
                Patient
                <select bind:value={editingDocument.patient_id}>
                  <option value="">-- Patient auswählen --</option>
                  {#each patients as patient}
                    <option value={patient.id}>{patient.first_name} {patient.last_name}</option>
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
              <div class="form-grid">
                <label>
                  Vorname
                  <input type="text" bind:value={editingStaff.first_name} required />
                </label>
                <label>
                  Nachname
                  <input type="text" bind:value={editingStaff.last_name} required />
                </label>
              </div>
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
          {:else if editingUser}
            <h2>{editingUser?.id ? 'Benutzer bearbeiten' : 'Neuer Benutzer'}</h2>
            <form on:submit|preventDefault={saveUser}>
              <div class="form-grid">
                <label>
                  Benutzername
                  <input type="text" bind:value={editingUser.username} required />
                </label>
                <label>
                  E-Mail
                  <input type="email" bind:value={editingUser.email} required />
                </label>
              </div>
              <div class="form-grid">
                <label>
                  Vorname
                  <input type="text" bind:value={editingUser.first_name} />
                </label>
                <label>
                  Nachname
                  <input type="text" bind:value={editingUser.last_name} />
                </label>
              </div>
              {#if !editingUser.id}
                <label>
                  Passwort
                  <input type="password" bind:value={editingUser.password} required />
                </label>
              {:else}
                <label>
                  Neues Passwort (leer lassen für kein Ändern)
                  <input type="password" bind:value={editingUser.password} />
                </label>
              {/if}
              <label>
                <input type="checkbox" bind:checked={editingUser.is_active} />
                Aktiv
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
        <div class="header-content">
          <h1>PflegeDMS</h1>
          <p class="subtitle">Pflegedienst Management System</p>
          {#if platform !== 'web'}
            <span class="platform-badge">{platform}</span>
          {/if}
        </div>
        <div class="user-info">
          {#if currentUser}
            <span class="user-name">Angemeldet als: {currentUser.username}</span>
            <button class="logout-button" on:click={logout}>Abmelden</button>
          {/if}
        </div>
      </header>

      <div class="welcome-section">
        <h2>Willkommen zu PflegeDMS</h2>
        <p>Ihr umfassendes Management-System für Pflegedienste</p>
      </div>

      <div class="modules-grid">
        {#each modules as module}
          {#if !module.permission || checkPermission(module.permission)}
            <button
              class="module-card"
              style="--module-color: {module.color}"
              on:click={() => openModule(module.id)}
              on:keydown={(e) => e.key === 'Enter' && openModule(module.id)}
              type="button"
            >
              <div class="module-icon">{module.icon}</div>
              <div class="module-info">
                <h3>{module.title}</h3>
                <p>{module.description}</p>
              </div>
            </button>
          {/if}
        {/each}
      </div>

      <footer class="footer">
        <p>Version 1.4.0 - Professionelles DMS mit RBAC und Audit-Logging</p>
      </footer>
    </div>
  {/if}
</main>

<style>
  /* Base styles */
  :global(body) {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f5f7fa;
    color: #333;
  }

  main {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Login Modal */
  .login-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .login-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 400px;
    max-width: 90%;
  }

  .login-content h2 {
    margin-top: 0;
    color: #4F46E5;
    text-align: center;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .login-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #4F46E5;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
  }

  .login-button:hover {
    background-color: #4338CA;
  }

  .error-message {
    color: #DC2626;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .login-info {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #666;
    text-align: center;
  }

  /* Dashboard */
  .dashboard {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
  }

  .header-content {
    flex: 1;
  }

  .header h1 {
    margin: 0;
    font-size: 2rem;
    color: #4F46E5;
  }

  .subtitle {
    margin: 0.5rem 0 0;
    color: #666;
    font-size: 1.1rem;
  }

  .platform-badge {
    background-color: #e0e7ff;
    color: #4F46E5;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    margin-left: 0.5rem;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .user-name {
    font-weight: 500;
    color: #666;
  }

  .logout-button {
    padding: 0.5rem 1rem;
    background-color: #f3f4f6;
    color: #666;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .logout-button:hover {
    background-color: #e5e7eb;
  }

  .welcome-section {
    margin-bottom: 2rem;
  }

  .welcome-section h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
  }

  .welcome-section p {
    margin: 0.5rem 0 0;
    color: #6b7280;
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    flex: 1;
  }

  .module-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    border: 2px solid transparent;
    width: 100%;
    text-align: left;
    border: none;
  }

  .module-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: var(--module-color);
  }

  .module-icon {
    font-size: 2rem;
    margin-bottom: 1rem;
  }

  .module-info h3 {
    margin: 0 0 0.5rem;
    font-size: 1.25rem;
    color: #1f2937;
  }

  .module-info p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .footer {
    margin-top: 2rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
    padding: 1rem 0;
    border-top: 1px solid #e5e7eb;
  }

  /* Module Detail */
  .module-detail {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  .back-button {
    background: none;
    border: none;
    color: #4F46E5;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .back-button:hover {
    text-decoration: underline;
  }

  .module-container {
    flex: 1;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    display: flex;
    flex-direction: column;
  }

  .module-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    padding-bottom: 1rem;
  }

  .module-header h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .module-icon {
    font-size: 1.5rem;
  }

  .add-button {
    padding: 0.5rem 1rem;
    background-color: #4F46E5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }

  .add-button:hover {
    background-color: #4338CA;
  }

  .search-bar {
    margin-bottom: 1.5rem;
  }

  .search-bar input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .content-list {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .list-item {
    background: #f9fafb;
    border-radius: 6px;
    padding: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #e5e7eb;
  }

  .item-main {
    flex: 1;
  }

  .item-main h3 {
    margin: 0 0 0.25rem;
    font-size: 1rem;
    color: #1f2937;
  }

  .item-detail {
    margin: 0;
    font-size: 0.875rem;
    color: #6b7280;
  }

  .item-subdetail {
    margin: 0.25rem 0 0;
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
    margin-left: 1rem;
  }

  .edit-btn, .delete-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
  }

  .edit-btn {
    background-color: #fbbf24;
    color: white;
  }

  .edit-btn:hover {
    background-color: #f59e0b;
  }

  .delete-btn {
    background-color: #ef4444;
    color: white;
  }

  .delete-btn:hover {
    background-color: #dc2626;
  }

  .empty-state {
    text-align: center;
    color: #9ca3af;
    padding: 2rem;
    font-size: 0.875rem;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 600px;
    max-width: 90%;
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
    font-size: 1.5rem;
    cursor: pointer;
    color: #6b7280;
  }

  .close-modal:hover {
    color: #1f2937;
  }

  .modal-content h2 {
    margin-top: 0;
    color: #1f2937;
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
    font-weight: 500;
  }

  .modal-content input,
  .modal-content select,
  .modal-content textarea {
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .modal-content textarea {
    min-height: 100px;
    resize: vertical;
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .submit-button {
    padding: 0.75rem;
    background-color: #4F46E5;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 0.5rem;
    align-self: flex-end;
  }

  .submit-button:hover {
    background-color: #4338CA;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .modules-grid {
      grid-template-columns: 1fr;
    }

    .form-grid {
      grid-template-columns: 1fr;
    }

    .modal-content {
      width: 90%;
    }
  }
</style>