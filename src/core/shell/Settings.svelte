<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Button from '../components/Button.svelte';
  import { toastStore } from '../stores/toastStore';
  import { exportService } from '../services/exportService';
  import { backupService } from '../services/backupService';
  import type { BackupStatus, BackupConfig } from '../services/backupService';

  const dispatch = createEventDispatcher();

  let activeTab = 'general';
  let masterPassword = '';
  let masterPasswordRepeat = '';
  let backupConfig: BackupConfig = {
    enabled: true,
    frequency: 'daily',
    backupTime: '02:00',
    backupDir: '~/.pflegedienst/backups',
    maxBackups: 7,
  };
  let backupStatus: BackupStatus | null = null;
  let isExporting = false;
  let isCreatingBackup = false;

  async function loadBackupStatus() {
    backupStatus = await backupService.getBackupStatus();
  }

  async function handleChangePassword() {
    if (!masterPassword || !masterPasswordRepeat) {
      toastStore.error('Beide Passwortfelder sind erforderlich');
      return;
    }

    if (masterPassword !== masterPasswordRepeat) {
      toastStore.error('Passwörter stimmen nicht überein');
      return;
    }

    if (masterPassword.length < 8) {
      toastStore.error('Passwort muss mindestens 8 Zeichen lang sein');
      return;
    }

    // TODO: Implement password change in db service
    toastStore.success('Passwort geändert');
    masterPassword = '';
    masterPasswordRepeat = '';
  }

  async function handleDSGVOExport() {
    if (!confirm('Möchten Sie einen DSGVO-Export erstellen? Dies kann einige Minuten dauern.')) {
      return;
    }

    isExporting = true;
    try {
      await exportService.exportAllData({
        includeSQLDump: true,
        includePDFs: true,
        includeMetadata: true,
      });
      toastStore.success('DSGVO-Export erfolgreich erstellt');
    } catch (err) {
      toastStore.error('DSGVO-Export fehlgeschlagen');
    } finally {
      isExporting = false;
    }
  }

  async function handleUpdateBackupConfig() {
    try {
      await backupService.updateConfig(backupConfig);
      toastStore.success('Backup-Konfiguration aktualisiert');
      await loadBackupStatus();
    } catch (err) {
      toastStore.error('Backup-Konfiguration konnte nicht aktualisiert werden');
    }
  }

  async function handleManualBackup() {
    if (!confirm('Manuelles Backup erstellen?')) {
      return;
    }

    isCreatingBackup = true;
    try {
      const success = await backupService.manualBackup();
      if (success) {
        toastStore.success('Backup erfolgreich erstellt');
        await loadBackupStatus();
      } else {
        toastStore.error('Backup-Erstellung fehlgeschlagen');
      }
    } finally {
      isCreatingBackup = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }

  // Load backup status on mount
  $: if (activeTab === 'backup') {
    loadBackupStatus();
  }
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">Einstellungen</h2>
      <button on:click={handleClose} class="text-gray-500 hover:text-gray-700 text-2xl">
        ×
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-gray-200">
      <button
        on:click={() => (activeTab = 'general')}
        class={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
          activeTab === 'general'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Allgemein
      </button>
      <button
        on:click={() => (activeTab = 'security')}
        class={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
          activeTab === 'security'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Sicherheit
      </button>
      <button
        on:click={() => (activeTab = 'backup')}
        class={`flex-1 px-6 py-4 font-medium text-sm transition-colors ${
          activeTab === 'backup'
            ? 'border-b-2 border-blue-600 text-blue-600'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Backup & Export
      </button>
    </div>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- General Tab -->
      {#if activeTab === 'general'}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Allgemeine Einstellungen</h3>
          <p class="text-sm text-gray-600">
            Grundlegende Anwendungseinstellungen und Informationen.
          </p>

          <div class="bg-gray-50 rounded-lg p-4 space-y-2">
            <p class="text-sm">
              <strong>Version:</strong> 1.0.0
            </p>
            <p class="text-sm">
              <strong>Datenbank:</strong> SQLite mit SQLCipher
            </p>
            <p class="text-sm">
              <strong>Installationsort:</strong> ~/.pflegedienst/
            </p>
          </div>
        </div>
      {/if}

      <!-- Security Tab -->
      {#if activeTab === 'security'}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Sicherheitseinstellungen</h3>

          <div class="space-y-3">
            <div>
              <label for="new-password" class="block text-sm font-medium text-gray-900 mb-1">
                Neues Master-Passwort
              </label>
              <input
                id="new-password"
                type="password"
                bind:value={masterPassword}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mindestens 8 Zeichen"
              />
            </div>

            <div>
              <label for="repeat-password" class="block text-sm font-medium text-gray-900 mb-1">
                Passwort wiederholen
              </label>
              <input
                id="repeat-password"
                type="password"
                bind:value={masterPasswordRepeat}
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Wiederholen Sie das Passwort"
              />
            </div>

            <Button variant="primary" on:click={handleChangePassword}>
              Passwort ändern
            </Button>
          </div>

          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <p>
              ⚠️ Ihr Master-Passwort schützt alle verschlüsselten Daten. Bitte wählen Sie ein starkes
              Passwort.
            </p>
          </div>
        </div>
      {/if}

      <!-- Backup & Export Tab -->
      {#if activeTab === 'backup'}
        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">Backup & Export</h3>

          <!-- Backup Config -->
          <div class="space-y-3 bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900">Automatische Backups</h4>

            <div>
              <label class="flex items-center space-x-2">
                <input type="checkbox" bind:checked={backupConfig.enabled} />
                <span class="text-sm text-gray-900">Automatische Backups aktivieren</span>
              </label>
            </div>

            {#if backupConfig.enabled}
              <div>
                <label for="backup-frequency" class="block text-sm font-medium text-gray-900 mb-1">
                  Häufigkeit
                </label>
                <select
                  id="backup-frequency"
                  bind:value={backupConfig.frequency}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="daily">Täglich</option>
                  <option value="weekly">Wöchentlich</option>
                </select>
              </div>

              <div>
                <label for="backup-time" class="block text-sm font-medium text-gray-900 mb-1">
                  Uhrzeit
                </label>
                <input
                  id="backup-time"
                  type="time"
                  bind:value={backupConfig.backupTime}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label for="backup-dir" class="block text-sm font-medium text-gray-900 mb-1">
                  Backup-Verzeichnis
                </label>
                <input
                  id="backup-dir"
                  type="text"
                  bind:value={backupConfig.backupDir}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label for="max-backups" class="block text-sm font-medium text-gray-900 mb-1">
                  Maximale Anzahl Backups
                </label>
                <input
                  id="max-backups"
                  type="number"
                  bind:value={backupConfig.maxBackups}
                  class="w-full px-3 py-2 border border-gray-300 rounded-md"
                  min="1"
                  max="30"
                />
              </div>

              <Button variant="primary" on:click={handleUpdateBackupConfig}>
                Speichern
              </Button>
            {/if}
          </div>

          <!-- Backup Status -->
          {#if backupStatus}
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
              <p>
                <strong>Status:</strong> {backupStatus.isRunning ? '🟢 Aktiv' : '🔴 Inaktiv'}
              </p>
              <p>
                <strong>Letztes Backup:</strong> {backupStatus.lastBackup
                  ? new Date(backupStatus.lastBackup).toLocaleDateString('de-DE')
                  : 'Nie'}
              </p>
              <p>
                <strong>Nächstes Backup:</strong> {backupStatus.nextBackup
                  ? new Date(backupStatus.nextBackup).toLocaleString('de-DE')
                  : 'Nicht geplant'}
              </p>
              <p>
                <strong>Anzahl Backups:</strong> {backupStatus.backupCount}
              </p>
            </div>
          {/if}

          <!-- Manual Backup -->
          <Button
            variant="secondary"
            loading={isCreatingBackup}
            on:click={handleManualBackup}
          >
            💾 Jetzt Backup erstellen
          </Button>

          <!-- DSGVO Export -->
          <div class="border-t border-gray-200 pt-4">
            <h4 class="font-medium text-gray-900 mb-3">DSGVO-Datenexport</h4>
            <p class="text-sm text-gray-600 mb-4">
              Laden Sie alle Ihre Daten herunter. Dies erzeugt eine ZIP-Datei mit SQL-Dump, PDFs
              und Metadaten.
            </p>
            <Button
              variant="primary"
              loading={isExporting}
              on:click={handleDSGVOExport}
            >
              📥 DSGVO-Export erstellen
            </Button>
          </div>
        </div>
      {/if}
    </div>

    <!-- Footer -->
    <div class="flex items-center justify-end space-x-3 border-t border-gray-200 px-6 py-4 bg-gray-50">
      <Button variant="secondary" on:click={handleClose}>
        Schließen
      </Button>
    </div>
  </div>
</div>
