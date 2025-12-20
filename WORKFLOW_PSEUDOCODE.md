# Pseudocode: Cross-Module-Workflow
## Szenario: Verarbeitung einer Eingangsrechnung vom Sanitätshaus

---

## Workflows-Übersicht

Dieser Pseudocode zeigt den kompletten Prozess, wie eine Rechnung durch die verschiedenen Module der Anwendung fließt, von der Erfassung im Posteingang bis zur finalen Speicherung im Rechnungsmanagement.

---

## Schritt 1: Mitarbeiter öffnet das Modul "Posteingang"

```pseudocode
FUNCTION openMailboxModule()
  // Shell initialisiert das Posteingang-Modul
  
  // UI-Einstiegspunkt wird aufgerufen
  LoadComponent("posteingang/MailboxView.svelte")
  
  // Store wird initialisiert und lädt aktuelle Posteingänge aus der Datenbank
  mailboxStore = InitializeStore()
  mailboxItems = mailboxService.getMailboxItems()
  
  // MailboxView wird mit den Elementen gefüllt und angezeigt
  RenderMailboxView(mailboxItems)
END FUNCTION
```

---

## Schritt 2: Mitarbeiter scannt die Rechnung

```pseudocode
FUNCTION scanInvoiceDocument()
  
  // Mitarbeiter klickt auf den "Scan"-Button
  ON_CLICK("scan-button") {
    
    // Scanner/Datei-Dialog wird geöffnet (Electron API)
    filePath = SelectFileDialog(
      title: "Rechnung auswählen",
      filters: ["PDF (*.pdf)", "Images (*.jpg, *.png)"]
    )
    
    IF filePath IS NOT NULL THEN
      
      // Datei wird hochgeladen in den Posteingang
      invoiceFile = ReadFile(filePath)
      
      // Neues Dokument wird in der documents-Tabelle erstellt
      newDocument = {
        id: GenerateUUID(),
        filename: GetFileName(filePath),
        file_path: SaveToLocalStorage(invoiceFile),  // Speichern auf Disk
        file_size: GetFileSize(invoiceFile),
        mime_type: GetMimeType(invoiceFile),
        entity_type: "mailbox",                      // Noch nicht zugeordnet
        entity_id: NULL,
        document_type: "unknown",                     // Wird später klassifiziert
        status: "active",
        ocr_text: NULL,                              // Wird asynchron gefüllt
        is_ocr_processed: FALSE,
        created_at: NOW(),
        created_by: CurrentUser()
      }
      
      // Dokument wird in die Datenbank eingefügt
      documentId = documentService.createDocument(newDocument)
      
      // Neuer Eintrag im Posteingang wird erstellt
      newMailboxItem = {
        id: GenerateUUID(),
        document_id: documentId,
        status: "new",                        // Markiert als unbearbeitet
        priority: "normal",
        item_type: "unknown",                 // OCR wird versuchen, das zu erkennen
        assigned_to_patient_id: NULL,         // Noch nicht zugeordnet
        assigned_to_module: NULL,             // Noch nicht zugeordnet
        reminder_date: NULL,
        created_at: NOW(),
        notes: NULL
      }
      
      // Mailbox-Item wird eingefügt
      mailboxItemId = mailboxService.createMailboxItem(newMailboxItem)
      
      // Audit-Log-Eintrag
      auditService.log({
        action: "document_scanned",
        entity_type: "mailbox_item",
        entity_id: mailboxItemId,
        description: "Rechnung gescannt: " + invoiceFile.name
      })
      
      // **OCR startet asynchron im Hintergrund**
      ASYNC StartOCRProcessing(documentId, invoiceFile)
      
      // UI wird aktualisiert (neues Item erscheint im Posteingang)
      RefreshMailboxView()
      ShowNotification("Rechnung erfolgreich eingescannt", "success")
    
    END IF
  }
  
END FUNCTION
```

### Asynchrone OCR-Verarbeitung (Nebenablauf):

```pseudocode
ASYNC FUNCTION StartOCRProcessing(documentId, filePath)
  
  // OCR mit Tesseract.js wird initialisiert (läuft im Renderer-Prozess)
  TRY {
    ocrService = InitializeTesseract()
    
    // Bild/PDF wird zu Bild konvertiert (falls erforderlich)
    imageData = ConvertToImage(filePath)
    
    // OCR wird durchgeführt
    extractedText = ocrService.recognize(imageData)
    
    // Extrahierter Text wird in der Datenbank aktualisiert
    documentService.updateDocument(documentId, {
      ocr_text: extractedText,
      is_ocr_processed: TRUE
    })
    
    // **Automatische Klassifizierung** basierend auf OCR-Text
    classifiedType = ClassifyDocumentType(extractedText)  // z.B. "invoice"
    
    // Mailbox-Item wird mit erkanntem Typ aktualisiert
    mailboxService.updateMailboxItem(GetMailboxItemByDocumentId(documentId), {
      item_type: classifiedType
    })
    
    // Audit-Log
    auditService.log({
      action: "ocr_completed",
      entity_type: "document",
      entity_id: documentId,
      description: "OCR erfolgreich abgeschlossen. Erkannter Typ: " + classifiedType
    })
    
  } CATCH error {
    // Fehlerbehandlung
    LogError("OCR-Fehler", error)
    mailboxService.updateMailboxItem(..., {
      status: "error",
      notes: "OCR-Fehler: " + error.message
    })
  }
  
END ASYNC FUNCTION
```

---

## Schritt 3: Mitarbeiter klickt auf die Rechnung im Posteingang

```pseudocode
FUNCTION onMailboxItemClick(mailboxItemId)
  
  // Das Mailbox-Item wird geladen
  mailboxItem = mailboxService.getMailboxItemById(mailboxItemId)
  document = documentService.getDocumentById(mailboxItem.document_id)
  
  // Status wird zu "in_progress" geändert
  mailboxService.updateMailboxItem(mailboxItemId, {
    status: "in_progress"
  })
  
  // Detailansicht wird geöffnet (Modal oder neue View)
  DisplayComponent("posteingang/MailDetail.svelte", {
    mailboxItem: mailboxItem,
    document: document
  })
  
  // Audit-Log
  auditService.log({
    action: "mailbox_item_opened",
    entity_type: "mailbox_item",
    entity_id: mailboxItemId
  })
  
END FUNCTION
```

### MailDetail.svelte - Mini-Formular zur Zuordnung:

```html
<!-- Das Formular zeigt: -->
<!-- 1. Dokumentansicht (PDF/Bild-Viewer) -->
<!-- 2. Erkannten OCR-Text (readonly) -->
<!-- 3. Dropdown "Zielmodul" -->
<!-- 4. Dropdown "Zuordnung" (Patient/Lieferant) -->
<!-- 5. Status-Button -->
```

---

## Schritt 4: Mitarbeiter wählt "Rechnungsmanagement" als Zielmodul

```pseudocode
FUNCTION onModuleSelection(selectedModule)
  
  IF selectedModule == "rechnungsmanagement" THEN
    
    // Verfügbare Sub-Kategorien werden geladen
    subCategories = GetSubCategoriesForModule("rechnungsmanagement")
    // Beispiel: ["incoming", "outgoing"]
    
    // Dropdown wird aktualisiert
    UpdateDropdown("invoice-type", subCategories)
    
    // Speichern im mailboxStore (für spätere Verarbeitung)
    mailboxStore.selectedModule = "rechnungsmanagement"
    
    // Audit-Log
    auditService.log({
      action: "module_selected_for_routing",
      entity_type: "mailbox_item",
      entity_id: CurrentMailboxItemId(),
      description: "Zielmodul ausgewählt: rechnungsmanagement"
    })
  
  END IF
  
END FUNCTION
```

---

## Schritt 5: Mitarbeiter wählt "Eingangsrechnung" (Kategorisierung)

```pseudocode
FUNCTION onInvoiceTypeSelection(invoiceType)
  
  IF invoiceType == "incoming" THEN
    
    // Verfügbare Partner werden geladen (Suppliers/Lieferanten)
    suppliers = supplierService.getAllSuppliers()
    
    // Dropdown wird mit Lieferanten gefüllt
    UpdateDropdown("supplier-select", suppliers)
    
    // Speichern im mailboxStore
    mailboxStore.invoiceType = "incoming"
    
    // Audit-Log
    auditService.log({
      action: "invoice_type_selected",
      entity_type: "mailbox_item",
      entity_id: CurrentMailboxItemId(),
      description: "Rechnungstyp ausgewählt: Eingangsrechnung"
    })
  
  END IF
  
END FUNCTION
```

---

## Schritt 6: Mitarbeiter wählt den Lieferanten aus

```pseudocode
FUNCTION onSupplierSelection(supplierId)
  
  // Lieferant wird geladen
  supplier = supplierService.getSupplierById(supplierId)
  
  // Vorschlag-Felder können basierend auf dem Lieferanten vorausgefüllt werden
  // (z.B. Standardbetrag, falls bekannt)
  
  // Speichern im mailboxStore
  mailboxStore.selectedSupplierId = supplierId
  mailboxStore.selectedSupplier = supplier
  
  // Audit-Log
  auditService.log({
    action: "supplier_selected_for_invoice",
    entity_type: "mailbox_item",
    entity_id: CurrentMailboxItemId(),
    description: "Lieferant ausgewählt: " + supplier.name
  })
  
  // "Weiter"- oder "Speichern"-Button wird aktiviert
  EnableButton("save-button")
  
END FUNCTION
```

---

## Schritt 7: Mitarbeiter klickt "Speichern"

```pseudocode
FUNCTION onSaveInvoice()
  
  // Alle erfassten Daten werden validiert
  IF ValidateInvoiceForm() THEN
    
    // Neue Rechnung wird in der invoices-Tabelle erstellt
    newInvoice = {
      id: GenerateUUID(),
      invoice_type: mailboxStore.invoiceType,           // "incoming"
      invoice_number: GenerateInvoiceNumber(),          // z.B. "INV-2025-0001"
      invoice_date: TODAY(),
      due_date: AddDays(TODAY(), 30),                   // Standard: 30 Tage
      
      partner_type: "supplier",
      partner_id: mailboxStore.selectedSupplierId,
      partner_name: mailboxStore.selectedSupplier.name,
      
      description: mailboxStore.invoiceDescription || "",  // Mitarbeiter kann eingeben
      amount: mailboxStore.invoiceAmount || NULL,
      currency: "EUR",
      
      document_id: CurrentMailboxItem().document_id,    // Verlinkt mit dem Original-Dokument
      
      status: "open",
      paid_date: NULL,
      payment_method: NULL,
      notes: NULL,
      
      reminder_sent: FALSE,
      
      created_at: NOW(),
      updated_at: NOW()
    }
    
    // Rechnung wird in der Datenbank eingefügt
    invoiceId = invoiceService.createInvoice(newInvoice)
    
    // **Wichtig**: Dokument wird neu zugeordnet
    // Das document.entity_type ändert sich von "mailbox" zu "invoice"
    documentService.updateDocument(CurrentDocument().id, {
      entity_type: "invoice",
      entity_id: invoiceId,
      document_type: "invoice"
    })
    
    // **Mailbox-Item wird als "erledigt" markiert**
    mailboxService.updateMailboxItem(CurrentMailboxItemId(), {
      status: "completed",
      assigned_to_module: "rechnungsmanagement",
      assigned_to_invoice_id: invoiceId,  // Zusätzliche Referenz
      completed_at: NOW()
    })
    
    // **Audit-Log-Einträge**
    auditService.log({
      action: "create",
      entity_type: "invoice",
      entity_id: invoiceId,
      description: "Neue Eingangsrechnung erstellt von Lieferant: " + newInvoice.partner_name
    })
    
    auditService.log({
      action: "document_reassigned",
      entity_type: "document",
      entity_id: CurrentDocument().id,
      old_value: JSON.stringify({
        entity_type: "mailbox",
        entity_id: CurrentMailboxItemId()
      }),
      new_value: JSON.stringify({
        entity_type: "invoice",
        entity_id: invoiceId
      }),
      description: "Dokument vom Posteingang zum Rechnungsmanagement verschoben"
    })
    
    auditService.log({
      action: "status_change",
      entity_type: "mailbox_item",
      entity_id: CurrentMailboxItemId(),
      old_value: JSON.stringify({ status: "in_progress" }),
      new_value: JSON.stringify({ status: "completed" }),
      description: "Posteingang-Item als erledigt markiert"
    })
    
    // **Benachrichtigung**: Rechnungsmanagement-Modul wird benachrichtigt
    notificationService.createNotification({
      notification_type: "new_invoice",
      entity_type: "invoice",
      entity_id: invoiceId,
      title: "Neue Eingangsrechnung",
      message: "Rechnung von " + newInvoice.partner_name + " wurde dem Modul zugeordnet",
      scheduled_for: NOW()
    })
    
    // UI wird aktualisiert
    CloseModal("invoice-assignment")
    RefreshMailboxView()
    
    // Bestätigungsmeldung
    ShowNotification(
      "Rechnung erfolgreich zu Rechnungsmanagement verschoben",
      "success"
    )
    
  ELSE
    // Validierungsfehler werden angezeigt
    ShowValidationErrors()
  
  END IF
  
END FUNCTION
```

---

## Schritt 8: System-Prozesse nach dem Speichern

```pseudocode
// Diese Prozesse laufen automatisch im Hintergrund

ASYNC FUNCTION PostSaveProcessing(invoiceId)
  
  // 1. Volltextindex wird aktualisiert
  UpdateFulltextIndex(CurrentDocument().id)
  
  // 2. Falls die Rechnung als überfällig erkannt wird, wird eine Benachrichtigung erstellt
  IF IsInvoiceOverdue(invoiceId) THEN
    notificationService.createNotification({
      notification_type: "invoice_overdue",
      entity_type: "invoice",
      entity_id: invoiceId,
      title: "Überfällige Rechnung",
      message: "Die Rechnung ist bereits überfällig!",
      scheduled_for: NOW()
    })
  END IF
  
  // 3. Der globale Search-Index wird aktualisiert (optional, für Performance)
  // globalSearchService.indexEntity("invoice", invoiceId)
  
END ASYNC FUNCTION
```

---

## Schritt 9: Mitarbeiter öffnet Rechnungsmanagement-Modul

```pseudocode
FUNCTION openInvoiceModule()
  
  // Rechnungsmanagement-Modul wird geladen
  LoadComponent("rechnungsmanagement/InvoiceList.svelte")
  
  // Alle Rechnungen werden aus der Datenbank geladen
  invoices = invoiceService.getAllInvoices()
  
  // Die neu erstellte Rechnung sollte jetzt sichtbar sein
  RenderInvoiceList(invoices)
  
  // Optional: Wenn eine neue Benachrichtigung für diese Rechnung existiert,
  // wird sie als "ungelesen" gekennzeichnet
  unreadNotifications = notificationService.getUnreadNotifications("invoice")
  HighlightNewInvoices(unreadNotifications)
  
END FUNCTION
```

---

## Zusammenfassung des Datenflusses

```
[Scanner]
   ↓
[1. Datei hochladen → documents + mailbox_items]
   ↓
[2. OCR im Hintergrund → ocr_text + document_type]
   ↓
[3. Mitarbeiter öffnet Mailbox-Item]
   ↓
[4. Mitarbeiter wählt Modul & Kategorien]
   ↓
[5. Mitarbeiter wählt Partner (Lieferant)]
   ↓
[6. Speichern → invoices + audit_log]
   ↓
[7. Dokument wird neu zugeordnet → documents.entity_type = "invoice"]
   ↓
[8. Mailbox-Item wird als "completed" markiert]
   ↓
[9. Benachrichtigungen werden erstellt]
   ↓
[10. Mitarbeiter sieht neue Rechnung im Rechnungsmanagement-Modul]
```

---

## Error Handling & Edge Cases

```pseudocode
FUNCTION HandleErrors()
  
  // Fall 1: Datei ist zu groß
  IF fileSize > MAX_FILE_SIZE THEN
    ShowError("Datei ist zu groß. Maximum: 100 MB")
    RETURN
  END IF
  
  // Fall 2: OCR schlägt fehl
  IF ocrProcessing FAILS THEN
    // Rechnungstyp bleibt "unknown"
    // Mitarbeiter muss manuell klassifizieren
    mailboxItem.item_type = "unknown"
    ShowWarning("OCR konnte Text nicht erkennen. Bitte manuell klassifizieren.")
  END IF
  
  // Fall 3: Lieferant existiert nicht
  IF selectedSupplier == NULL THEN
    // Optionally: "Neuen Lieferanten erstellen"-Dialog anzeigen
    ShowDialog("Lieferant nicht gefunden. Möchten Sie einen neuen Lieferanten erstellen?")
  END IF
  
  // Fall 4: Datenbankfehler
  IF databaseError OCCURS THEN
    LogError("Datenbankfehler bei Rechnung-Speichern")
    ShowError("Fehler beim Speichern. Bitte versuchen Sie es erneut.")
    RollbackTransaction()
  END IF
  
END FUNCTION
```

---

## Wichtige technische Details

### Transaktionen
Der gesamte Prozess ab Schritt 7 ("Speichern") sollte in einer **Datenbank-Transaktion** erfolgen:

```sql
BEGIN TRANSACTION;
  -- Insert Invoice
  -- Update Document
  -- Update MailboxItem
  -- Insert Audit Logs
  -- Commit oder Rollback bei Fehler
END TRANSACTION;
```

### Performance-Optimierungen
1. **Lazy Loading**: Nur die ersten 20 Mailbox-Items werden geladen, weitere per Pagination
2. **Indexierung**: `mailbox_items.status`, `mailbox_items.created_at` sind indiziert
3. **Caching**: Lieferanten-Liste wird gecacht (selten aktualisiert)

### Datenschutz (DSGVO)
- Alle Änderungen werden im `audit_log` verzeichnet
- Datenschutz-Export: Alle Dokumente eines Lieferanten können schnell exportiert werden
- Löschung: Bei Lieferanten-Löschung werden Rechnungen auf "archived" gesetzt, nicht wirklich gelöscht

---

Dieser Pseudocode zeigt, wie die Modularität in der Praxis funktioniert: Der Posteingang ist der "Router", der Dokumente zu den richtigen Modulen leitet, und alles wird über die zentrale Datenbank koordiniert.
