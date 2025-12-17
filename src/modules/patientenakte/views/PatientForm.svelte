<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { patientStore, selectedPatient } from '../stores/patientStore';
  import { toastStore } from '@core/stores/toastStore';
  import Button from '@core/components/Button.svelte';
  import type { CreatePatientInput } from '../types/patient';

  const dispatch = createEventDispatcher();

  let isSubmitting = false;
  let formData: CreatePatientInput = {
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: undefined,
    phone: '',
    email: '',
    address: '',
    postal_code: '',
    city: '',
    insurance_company: '',
    insurance_number: '',
    primary_doctor: '',
    notes: '',
  };

  // Load existing patient data if editing
  $: if ($selectedPatient) {
    formData = {
      first_name: $selectedPatient.first_name,
      last_name: $selectedPatient.last_name,
      date_of_birth: $selectedPatient.date_of_birth || '',
      gender: $selectedPatient.gender as 'male' | 'female' | 'other' | undefined,
      phone: $selectedPatient.phone || '',
      email: $selectedPatient.email || '',
      address: $selectedPatient.address || '',
      postal_code: $selectedPatient.postal_code || '',
      city: $selectedPatient.city || '',
      insurance_company: $selectedPatient.insurance_company || '',
      insurance_number: $selectedPatient.insurance_number || '',
      primary_doctor: $selectedPatient.primary_doctor || '',
      notes: $selectedPatient.notes || '',
    };
  }

  async function handleSubmit() {
    if (!formData.first_name || !formData.last_name) {
      toastStore.error('Vorname und Nachname sind erforderlich');
      return;
    }

    isSubmitting = true;

    try {
      if ($selectedPatient) {
        // Update existing patient
        await patientStore.updatePatient($selectedPatient.id, {
          ...formData,
          date_of_birth: formData.date_of_birth || undefined,
        });
        toastStore.success('Patient aktualisiert');
      } else {
        // Create new patient
        await patientStore.createPatient(formData);
        toastStore.success('Patient erstellt');
      }
      dispatch('close');
    } catch (err) {
      toastStore.error('Fehler beim Speichern');
    } finally {
      isSubmitting = false;
    }
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-screen overflow-y-auto">
    <!-- Header -->
    <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      <h2 class="text-xl font-semibold text-gray-900">
        {$selectedPatient ? 'Patient bearbeiten' : 'Neuer Patient'}
      </h2>
      <button
        on:click={handleClose}
        class="text-gray-500 hover:text-gray-700 text-2xl"
      >
        ×
      </button>
    </div>

    <!-- Form -->
    <form on:submit|preventDefault={handleSubmit} class="p-6 space-y-4">
      <!-- Namen -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Vorname *
          </label>
          <input
            type="text"
            bind:value={formData.first_name}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Nachname *
          </label>
          <input
            type="text"
            bind:value={formData.last_name}
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Geburtsdatum & Geschlecht -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Geburtsdatum
          </label>
          <input
            type="date"
            bind:value={formData.date_of_birth}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Geschlecht
          </label>
          <select
            bind:value={formData.gender}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={undefined}>---</option>
            <option value="male">Männlich</option>
            <option value="female">Weiblich</option>
            <option value="other">Sonstiges</option>
          </select>
        </div>
      </div>

      <!-- Kontakt -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Telefon
          </label>
          <input
            type="tel"
            bind:value={formData.phone}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            E-Mail
          </label>
          <input
            type="email"
            bind:value={formData.email}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Adresse -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Adresse
        </label>
        <input
          type="text"
          bind:value={formData.address}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Stadt & PLZ -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Postleitzahl
          </label>
          <input
            type="text"
            bind:value={formData.postal_code}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Stadt
          </label>
          <input
            type="text"
            bind:value={formData.city}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Versicherung -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Versicherung
          </label>
          <input
            type="text"
            bind:value={formData.insurance_company}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-900 mb-1">
            Versichertennummer
          </label>
          <input
            type="text"
            bind:value={formData.insurance_number}
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <!-- Hausarzt -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Hausarzt
        </label>
        <input
          type="text"
          bind:value={formData.primary_doctor}
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <!-- Notizen -->
      <div>
        <label class="block text-sm font-medium text-gray-900 mb-1">
          Notizen
        </label>
        <textarea
          bind:value={formData.notes}
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="flex items-center justify-end space-x-3 border-t border-gray-200 pt-4">
        <Button variant="secondary" on:click={handleClose}>
          Abbrechen
        </Button>
        <Button variant="primary" {loading: isSubmitting} type="submit">
          {$selectedPatient ? 'Aktualisieren' : 'Erstellen'}
        </Button>
      </div>
    </form>
  </div>
</div>
