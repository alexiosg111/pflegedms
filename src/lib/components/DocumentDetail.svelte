<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { Document, Patient, Staff } from '../types';
  import { DOCUMENT_CATEGORIES } from '../types';
  
  export let document: Document;
  export let patients: Patient[] = [];
  export let staff: Staff[] = [];
  
  const dispatch = createEventDispatcher();
  
  let activeTab: 'content' | 'versions' | 'audit' | 'approval' = 'content';
  let showVersionComparison = false;
  let selectedVersion: number | null = null;
  
  $: patient = patients.find(p => p.id === document.patientId);
  $: categoryLabel = DOCUMENT_CATEGORIES.find(c => c.value === document.category)?.label || document.category;
  
  function formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  function handleEdit() {
    dispatch('edit', document);
  }
  
  function handleDelete() {
    dispatch('delete', document.id);
  }
  
  function handleRestore(versionNumber: number) {
    dispatch('restoreVersion', { documentId: document.id, versionNumber });
  }
  
  function handleApprove() {
    dispatch('approve', document.id);
  }
  
  function handleReject() {
    dispatch('reject', document.id);
  }
  
  function getStaffName(userId: string): string {
    const staffMember = staff.find(s => s.id === userId);
    return staffMember?.name || userId;
  }
  
  function getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'draft': return 'badge-draft';
      case 'active': return 'badge-active';
      case 'archived': return 'badge-archived';
      case 'deleted': return 'badge-deleted';
      default: return 'badge-default';
    }
  }
  
  function getApprovalBadgeClass(status: string): string {
    switch (status) {
      case 'approved': return 'badge-approved';
      case 'rejected': return 'badge-rejected';
      case 'pending': return 'badge-pending';
      default: return 'badge-default';
    }
  }
</script>

<div class="document-detail">
  <div class="detail-header">
    <div class="header-main">
      <h2>{document.title}</h2>
      <div class="badges">
        <span class="badge {getStatusBadgeClass(document.status)}">
          {document.status}
        </span>
        {#if document.approvalStatus}
          <span class="badge {getApprovalBadgeClass(document.approvalStatus)}">
            {document.approvalStatus}
          </span>
        {/if}
      </div>
    </div>
    <div class="header-actions">
      <button class="btn-primary" on:click={handleEdit}>Bearbeiten</button>
      {#if document.status !== 'deleted'}
        <button class="btn-danger" on:click={handleDelete}>Löschen</button>
      {/if}
    </div>
  </div>
  
  <div class="detail-meta">
    <div class="meta-item">
      <strong>Kategorie:</strong> {categoryLabel}
    </div>
    <div class="meta-item">
      <strong>Patient:</strong> {patient?.name || 'Nicht zugeordnet'}
    </div>
    <div class="meta-item">
      <strong>Version:</strong> {document.version}
    </div>
    <div class="meta-item">
      <strong>Erstellt:</strong> {formatTimestamp(document.createdAt)}
    </div>
    <div class="meta-item">
      <strong>Aktualisiert:</strong> {formatTimestamp(document.updatedAt)}
    </div>
  </div>
  
  {#if document.tags.length > 0}
    <div class="tags-section">
      <strong>Tags:</strong>
      {#each document.tags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  {/if}
  
  <div class="tabs">
    <button 
      class:active={activeTab === 'content'} 
      on:click={() => activeTab = 'content'}
    >
      Inhalt
    </button>
    <button 
      class:active={activeTab === 'versions'} 
      on:click={() => activeTab = 'versions'}
    >
      Versionen ({document.versions.length})
    </button>
    <button 
      class:active={activeTab === 'audit'} 
      on:click={() => activeTab = 'audit'}
    >
      Audit-Log ({document.auditLog.length})
    </button>
    {#if document.approvalRecords.length > 0 || document.approvalStatus}
      <button 
        class:active={activeTab === 'approval'} 
        on:click={() => activeTab = 'approval'}
      >
        Freigabe
      </button>
    {/if}
  </div>
  
  <div class="tab-content">
    {#if activeTab === 'content'}
      <div class="content-section">
        {#if Object.keys(document.metadata).length > 0}
          <div class="metadata-display">
            <h3>Metadaten</h3>
            <dl>
              {#each Object.entries(document.metadata) as [key, value]}
                <dt>{key}</dt>
                <dd>{value}</dd>
              {/each}
            </dl>
          </div>
        {/if}
        
        <div class="notes-display">
          <h3>Inhalt</h3>
          <pre>{document.notes || 'Kein Inhalt'}</pre>
        </div>
        
        {#if document.ocrText}
          <div class="ocr-display">
            <h3>OCR-Text</h3>
            <pre>{document.ocrText}</pre>
          </div>
        {/if}
      </div>
    {:else if activeTab === 'versions'}
      <div class="versions-section">
        {#each document.versions.sort((a, b) => b.versionNumber - a.versionNumber) as version}
          <div class="version-item">
            <div class="version-header">
              <strong>Version {version.versionNumber}</strong>
              <span class="version-date">{formatTimestamp(version.changedAt)}</span>
            </div>
            <div class="version-meta">
              <span>Geändert von: {getStaffName(version.changedBy)}</span>
              <span class="version-log">{version.changeLog}</span>
            </div>
            {#if version.versionNumber !== document.version}
              <button 
                class="btn-restore" 
                on:click={() => handleRestore(version.versionNumber)}
              >
                Wiederherstellen
              </button>
            {/if}
          </div>
        {/each}
      </div>
    {:else if activeTab === 'audit'}
      <div class="audit-section">
        {#each document.auditLog.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) as entry}
          <div class="audit-item">
            <div class="audit-header">
              <span class="audit-action {entry.action}">{entry.action}</span>
              <span class="audit-date">{formatTimestamp(entry.timestamp)}</span>
            </div>
            <div class="audit-meta">
              <span>Benutzer: {getStaffName(entry.userId)}</span>
              {#if entry.details}
                <span>{entry.details}</span>
              {/if}
            </div>
            {#if entry.deviceInfo}
              <div class="audit-device">
                <small>{entry.deviceInfo}</small>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    {:else if activeTab === 'approval'}
      <div class="approval-section">
        <div class="approval-status">
          <h3>Freigabestatus</h3>
          {#if document.approvalStatus}
            <span class="badge {getApprovalBadgeClass(document.approvalStatus)}">
              {document.approvalStatus}
            </span>
          {:else}
            <span class="badge badge-default">Keine Freigabe erforderlich</span>
          {/if}
        </div>
        
        {#if document.approvalRecords.length > 0}
          <div class="approval-records">
            <h3>Freigabe-Verlauf</h3>
            {#each document.approvalRecords as record}
              <div class="approval-record">
                <div class="record-header">
                  <span class="badge {getApprovalBadgeClass(record.status)}">
                    {record.status}
                  </span>
                  <span class="record-date">{formatTimestamp(record.timestamp)}</span>
                </div>
                <div class="record-meta">
                  <span>Prüfer: {getStaffName(record.approverId)}</span>
                  {#if record.comment}
                    <p class="record-comment">{record.comment}</p>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        {/if}
        
        {#if document.status === 'active' && document.approvalStatus !== 'approved'}
          <div class="approval-actions">
            <button class="btn-approve" on:click={handleApprove}>Freigeben</button>
            <button class="btn-reject" on:click={handleReject}>Ablehnen</button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .document-detail {
    background: white;
    border-radius: 8px;
    padding: 24px;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .detail-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .header-main h2 {
    margin: 0 0 8px 0;
    color: #1f2937;
  }
  
  .badges {
    display: flex;
    gap: 8px;
  }
  
  .badge {
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .badge-draft { background: #fef3c7; color: #92400e; }
  .badge-active { background: #d1fae5; color: #065f46; }
  .badge-archived { background: #e5e7eb; color: #374151; }
  .badge-deleted { background: #fee2e2; color: #991b1b; }
  .badge-approved { background: #d1fae5; color: #065f46; }
  .badge-rejected { background: #fee2e2; color: #991b1b; }
  .badge-pending { background: #fef3c7; color: #92400e; }
  .badge-default { background: #e5e7eb; color: #6b7280; }
  
  .header-actions {
    display: flex;
    gap: 8px;
  }
  
  .btn-primary, .btn-danger, .btn-restore, .btn-approve, .btn-reject {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  .btn-primary {
    background: #3b82f6;
    color: white;
  }
  
  .btn-primary:hover {
    background: #2563eb;
  }
  
  .btn-danger {
    background: #ef4444;
    color: white;
  }
  
  .btn-danger:hover {
    background: #dc2626;
  }
  
  .btn-restore {
    background: #10b981;
    color: white;
    margin-top: 8px;
  }
  
  .btn-approve {
    background: #10b981;
    color: white;
  }
  
  .btn-reject {
    background: #ef4444;
    color: white;
  }
  
  .detail-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  
  .meta-item {
    font-size: 14px;
    color: #4b5563;
  }
  
  .meta-item strong {
    color: #1f2937;
  }
  
  .tags-section {
    margin-bottom: 16px;
    font-size: 14px;
  }
  
  .tag {
    display: inline-block;
    padding: 4px 10px;
    margin-left: 8px;
    background: #dbeafe;
    color: #1e40af;
    border-radius: 12px;
    font-size: 12px;
  }
  
  .tabs {
    display: flex;
    gap: 4px;
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 20px;
  }
  
  .tabs button {
    padding: 10px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }
  
  .tabs button:hover {
    color: #3b82f6;
  }
  
  .tabs button.active {
    color: #3b82f6;
    border-bottom-color: #3b82f6;
  }
  
  .tab-content {
    min-height: 300px;
  }
  
  .content-section h3 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #374151;
    font-size: 16px;
  }
  
  .metadata-display {
    margin-bottom: 24px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 6px;
  }
  
  .metadata-display dl {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 8px 16px;
    margin: 0;
  }
  
  .metadata-display dt {
    font-weight: 600;
    color: #374151;
  }
  
  .metadata-display dd {
    margin: 0;
    color: #6b7280;
  }
  
  .notes-display pre,
  .ocr-display pre {
    background: #f9fafb;
    padding: 16px;
    border-radius: 6px;
    white-space: pre-wrap;
    word-wrap: break-word;
    font-family: inherit;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
  }
  
  .version-item,
  .audit-item,
  .approval-record {
    padding: 12px;
    margin-bottom: 12px;
    background: #f9fafb;
    border-radius: 6px;
    border-left: 3px solid #3b82f6;
  }
  
  .version-header,
  .audit-header,
  .record-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
  }
  
  .version-date,
  .audit-date,
  .record-date {
    font-size: 13px;
    color: #6b7280;
  }
  
  .version-meta,
  .audit-meta,
  .record-meta {
    font-size: 14px;
    color: #4b5563;
  }
  
  .version-log {
    display: block;
    margin-top: 4px;
    font-style: italic;
    color: #6b7280;
  }
  
  .audit-action {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .audit-action.create { background: #d1fae5; color: #065f46; }
  .audit-action.edit { background: #dbeafe; color: #1e40af; }
  .audit-action.delete { background: #fee2e2; color: #991b1b; }
  .audit-action.view { background: #e5e7eb; color: #374151; }
  .audit-action.approve { background: #d1fae5; color: #065f46; }
  .audit-action.reject { background: #fee2e2; color: #991b1b; }
  
  .audit-device {
    margin-top: 8px;
    font-size: 12px;
    color: #9ca3af;
  }
  
  .approval-section h3 {
    margin-top: 0;
    margin-bottom: 12px;
  }
  
  .approval-status {
    margin-bottom: 24px;
  }
  
  .approval-records {
    margin-bottom: 24px;
  }
  
  .record-comment {
    margin-top: 8px;
    padding: 8px;
    background: white;
    border-radius: 4px;
    font-style: italic;
  }
  
  .approval-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }
</style>
