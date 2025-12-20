<script lang="ts">
  // TODO: In Phase 7 wird das Dashboard mit echten Daten gefüllt
  // Für MVP: Statisches Placeholder-Dashboard
</script>

<div class="space-y-6">
  <!-- Quick Actions -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div class="text-2xl mb-2">➕</div>
      <h3 class="text-sm font-semibold text-gray-900">Neuer Patient</h3>
      <p class="text-xs text-gray-500">Schnell einen Patienten hinzufügen</p>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div class="text-2xl mb-2">📄</div>
      <h3 class="text-sm font-semibold text-gray-900">Dokument hochladen</h3>
      <p class="text-xs text-gray-500">Datei scannen oder auswählen</p>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div class="text-2xl mb-2">💰</div>
      <h3 class="text-sm font-semibold text-gray-900">Neue Rechnung</h3>
      <p class="text-xs text-gray-500">Rechnung erfassen</p>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div class="text-2xl mb-2">📮</div>
      <h3 class="text-sm font-semibold text-gray-900">Posteingang</h3>
      <p class="text-xs text-gray-500">Eingescannte Dokumente</p>
    </div>
  </div>

  <!-- Statistics -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="bg-white rounded-lg p-6 shadow-sm">
      <p class="text-gray-500 text-sm">Aktive Patienten</p>
      <p class="text-3xl font-bold text-gray-900 mt-2">0</p>
      <p class="text-xs text-gray-500 mt-1">Wird in Phase 2 gefüllt</p>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm">
      <p class="text-gray-500 text-sm">Offene Rechnungen</p>
      <p class="text-3xl font-bold text-red-600 mt-2">€0</p>
      <p class="text-xs text-gray-500 mt-1">Wird in Phase 5 gefüllt</p>
    </div>

    <div class="bg-white rounded-lg p-6 shadow-sm">
      <p class="text-gray-500 text-sm">Laufende Verträge</p>
      <p class="text-3xl font-bold text-blue-600 mt-2">0</p>
      <p class="text-xs text-gray-500 mt-1">Wird in Phase 4 gefüllt</p>
    </div>
  </div>

  <!-- Placeholder Message -->
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
    <h2 class="text-lg font-semibold text-blue-900 mb-2">🎉 Willkommen!</h2>
    <p class="text-blue-800 text-sm">
      Die Anwendung wurde erfolgreich gestartet. Die Module werden in den nächsten Phasen implementiert.
      Siehe Dokumentation (QUICKSTART_GUIDE.md) für die Implementierungs-Roadmap.
    </p>
  </div>
</div>
