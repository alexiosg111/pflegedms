import { DataService } from './dataService';
import { logAuditAction } from './auditService';

export function migrateFromLocalStorage(): void {
    console.log('Starting data migration from localStorage to SQLite...');
    
    try {
        // Check if we have data in localStorage
        const hasPatients = localStorage.getItem('pflegedms_patients');
        const hasAppointments = localStorage.getItem('pflegedms_appointments');
        const hasDocuments = localStorage.getItem('pflegedms_documents');
        const hasStaff = localStorage.getItem('pflegedms_staff');
        
        if (!hasPatients && !hasAppointments && !hasDocuments && !hasStaff) {
            console.log('No localStorage data found, skipping migration');
            return;
        }
        
        const dataService = DataService.getInstance();
        
        // Migrate patients
        if (hasPatients) {
            const patients = JSON.parse(hasPatients);
            console.log(`Migrating ${patients.length} patients...`);
            
            for (const patient of patients) {
                try {
                    // Convert old format to new format
                    const [firstName, ...lastNameParts] = patient.name.split(' ');
                    const lastName = lastNameParts.join(' ');
                    
                    const newPatient = {
                        first_name: firstName,
                        last_name: lastName || 'Unknown',
                        birth_date: patient.birthDate,
                        address: patient.address,
                        phone: patient.phone,
                        insurance: patient.insurance,
                        diagnosis: patient.diagnosis,
                        notes: patient.notes,
                        created_by: 1, // System user
                        updated_by: 1
                    };
                    
                    dataService.createPatient(newPatient, 1);
                } catch (error) {
                    console.error(`Failed to migrate patient ${patient.id}:`, error);
                }
            }
            
            logAuditAction(1, 'migration', 'patients', null, null, { count: patients.length });
        }
        
        // Migrate staff
        if (hasStaff) {
            const staff = JSON.parse(hasStaff);
            console.log(`Migrating ${staff.length} staff members...`);
            
            for (const staffMember of staff) {
                try {
                    // Convert old format to new format
                    const [firstName, ...lastNameParts] = staffMember.name.split(' ');
                    const lastName = lastNameParts.join(' ');
                    
                    const newStaff = {
                        first_name: firstName,
                        last_name: lastName || 'Unknown',
                        position: staffMember.position,
                        phone: staffMember.phone,
                        email: staffMember.email,
                        qualifications: staffMember.qualifications,
                        notes: staffMember.notes,
                        is_active: 1,
                        created_by: 1, // System user
                        updated_by: 1
                    };
                    
                    dataService.createStaff(newStaff, 1);
                } catch (error) {
                    console.error(`Failed to migrate staff member ${staffMember.id}:`, error);
                }
            }
            
            logAuditAction(1, 'migration', 'staff', null, null, { count: staff.length });
        }
        
        // Migrate appointments
        if (hasAppointments) {
            const appointments = JSON.parse(hasAppointments);
            console.log(`Migrating ${appointments.length} appointments...`);
            
            for (const appointment of appointments) {
                try {
                    // Convert old format to new format
                    const newAppointment = {
                        title: appointment.title,
                        appointment_date: appointment.date,
                        appointment_time: appointment.time,
                        patient_id: appointment.patientId,
                        staff_id: appointment.staffId,
                        notes: appointment.notes,
                        status: 'scheduled',
                        created_by: 1, // System user
                        updated_by: 1
                    };
                    
                    dataService.createAppointment(newAppointment, 1);
                } catch (error) {
                    console.error(`Failed to migrate appointment ${appointment.id}:`, error);
                }
            }
            
            logAuditAction(1, 'migration', 'appointments', null, null, { count: appointments.length });
        }
        
        // Migrate documents
        if (hasDocuments) {
            const documents = JSON.parse(hasDocuments);
            console.log(`Migrating ${documents.length} documents...`);
            
            for (const document of documents) {
                try {
                    // Convert old format to new format
                    const newDocument = {
                        title: document.title,
                        document_date: document.date,
                        patient_id: document.patientId,
                        document_type: document.type,
                        notes: document.notes,
                        status: 'active',
                        created_by: 1, // System user
                        updated_by: 1
                    };
                    
                    dataService.createDocument(newDocument, 1);
                } catch (error) {
                    console.error(`Failed to migrate document ${document.id}:`, error);
                }
            }
            
            logAuditAction(1, 'migration', 'documents', null, null, { count: documents.length });
        }
        
        console.log('Data migration completed successfully');
        
        // Clear localStorage after successful migration
        localStorage.removeItem('pflegedms_patients');
        localStorage.removeItem('pflegedms_appointments');
        localStorage.removeItem('pflegedms_documents');
        localStorage.removeItem('pflegedms_staff');
        
        // Set migration flag
        localStorage.setItem('pflegedms_migration_completed', 'true');
        
    } catch (error) {
        console.error('Data migration failed:', error);
        logAuditAction(1, 'migration_failed', null, null, null, { error: error.message });
    }
}

export function checkMigrationStatus(): boolean {
    return localStorage.getItem('pflegedms_migration_completed') === 'true';
}