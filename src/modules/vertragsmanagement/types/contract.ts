/**
 * Contract data model and types
 */

export interface Contract {
  id: string;
  partner_type: 'patient' | 'supplier';
  partner_id: string;
  partner_name: string;
  contract_name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  renewal_date: string | null;
  cancellation_period_days: number | null;
  status: 'active' | 'inactive' | 'expired';
  contract_document_id: string | null;
  reminder_days_before_expiry: number;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContractInput {
  partner_type: 'patient' | 'supplier';
  partner_id: string;
  partner_name: string;
  contract_name: string;
  description?: string;
  start_date: string;
  end_date: string;
  renewal_date?: string;
  cancellation_period_days?: number;
  reminder_days_before_expiry?: number;
}

export interface UpdateContractInput extends Partial<CreateContractInput> {
  status?: 'active' | 'inactive' | 'expired';
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  supplier_type: string | null;
  tax_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CreateSupplierInput {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  supplier_type?: string;
  tax_id?: string;
}

export interface ContractStats {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

export interface ExpiringContract {
  id: string;
  contract_name: string;
  partner_name: string;
  end_date: string;
  days_until_expiry: number;
  reminder_sent: boolean;
}
