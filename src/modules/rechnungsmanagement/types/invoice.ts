/**
 * Invoice data model and types
 */

export interface Invoice {
  id: string;
  invoice_type: 'incoming' | 'outgoing';
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  partner_type: 'patient' | 'supplier';
  partner_id: string;
  partner_name: string;
  description: string | null;
  amount: number;
  currency: string;
  document_id: string | null;
  status: 'open' | 'paid' | 'overdue';
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvoiceInput {
  invoice_type: 'incoming' | 'outgoing';
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  partner_type: 'patient' | 'supplier';
  partner_id: string;
  partner_name: string;
  description?: string;
  amount: number;
  currency?: string;
  payment_method?: string;
  notes?: string;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  status?: 'open' | 'paid' | 'overdue';
  paid_date?: string;
}

export interface InvoiceStats {
  total_open: number;
  total_paid: number;
  total_overdue: number;
  sum_open: number;
  sum_paid: number;
  sum_overdue: number;
}

export interface InvoicesByStatus {
  open: Invoice[];
  paid: Invoice[];
  overdue: Invoice[];
}

export interface OCRExtractedData {
  amount: number | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  confidence: number;
}
