/**
 * Patient data model and types
 */

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: 'male' | 'female' | 'other' | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string;
  insurance_company: string | null;
  insurance_number: string | null;
  primary_doctor: string | null;
  status: 'active' | 'inactive' | 'archived';
  date_registered: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePatientInput {
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  insurance_company?: string;
  insurance_number?: string;
  primary_doctor?: string;
  notes?: string;
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {
  status?: 'active' | 'inactive' | 'archived';
}

export interface PatientDocument {
  id: string;
  patient_id: string;
  document_id: string;
  category: string;
  notes: string | null;
  created_at: string;
}
