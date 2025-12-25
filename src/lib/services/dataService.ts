import { getConnection } from '../database/connection';
import { logAuditAction } from './auditService';

export class DataService {
    private static instance: DataService;
    private db: any;
    
    private constructor() {
        this.db = getConnection();
    }
    
    public static getInstance(): DataService {
        if (!DataService.instance) {
            DataService.instance = new DataService();
        }
        return DataService.instance;
    }
    
    // Patient operations
    public getPatients(filter: any = {}): any[] {
        let query = 'SELECT * FROM patients WHERE 1=1';
        const params: any[] = [];
        
        if (filter.search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR diagnosis LIKE ?)';
            const searchParam = `%${filter.search}%`;
            params.push(searchParam, searchParam, searchParam);
        }
        
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            
            if (filter.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        
        query += ' ORDER BY last_name, first_name';
        
        return this.db.prepare(query).all(...params);
    }
    
    public getPatientById(id: number): any {
        return this.db.prepare('SELECT * FROM patients WHERE id = ?').get(id);
    }
    
    public createPatient(patient: any, userId: number | null = null): any {
        const stmt = this.db.prepare(`
            INSERT INTO patients 
            (first_name, last_name, birth_date, address, phone, insurance, diagnosis, notes, created_by, updated_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            patient.first_name,
            patient.last_name,
            patient.birth_date,
            patient.address,
            patient.phone,
            patient.insurance,
            patient.diagnosis,
            patient.notes,
            userId,
            userId
        );
        
        const newPatient = this.getPatientById(result.lastInsertRowid);
        
        // Audit log
        logAuditAction(userId, 'create', 'patients', result.lastInsertRowid, null, patient);
        
        return newPatient;
    }
    
    public updatePatient(id: number, patient: any, userId: number | null = null): any {
        const oldPatient = this.getPatientById(id);
        
        const stmt = this.db.prepare(`
            UPDATE patients 
            SET first_name = ?, last_name = ?, birth_date = ?, address = ?, 
                phone = ?, insurance = ?, diagnosis = ?, notes = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            patient.first_name,
            patient.last_name,
            patient.birth_date,
            patient.address,
            patient.phone,
            patient.insurance,
            patient.diagnosis,
            patient.notes,
            userId,
            id
        );
        
        const updatedPatient = this.getPatientById(id);
        
        // Audit log
        logAuditAction(userId, 'update', 'patients', id, oldPatient, updatedPatient);
        
        return updatedPatient;
    }
    
    public deletePatient(id: number, userId: number | null = null): boolean {
        const oldPatient = this.getPatientById(id);
        
        const stmt = this.db.prepare('DELETE FROM patients WHERE id = ?');
        const result = stmt.run(id);
        
        // Audit log
        logAuditAction(userId, 'delete', 'patients', id, oldPatient, null);
        
        return result.changes > 0;
    }
    
    // Staff operations
    public getStaff(filter: any = {}): any[] {
        let query = 'SELECT * FROM staff WHERE 1=1';
        const params: any[] = [];
        
        if (filter.search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR position LIKE ?)';
            const searchParam = `%${filter.search}%`;
            params.push(searchParam, searchParam, searchParam);
        }
        
        if (filter.isActive !== undefined) {
            query += ' AND is_active = ?';
            params.push(filter.isActive ? 1 : 0);
        }
        
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            
            if (filter.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        
        query += ' ORDER BY last_name, first_name';
        
        return this.db.prepare(query).all(...params);
    }
    
    public getStaffById(id: number): any {
        return this.db.prepare('SELECT * FROM staff WHERE id = ?').get(id);
    }
    
    public createStaff(staff: any, userId: number | null = null): any {
        const stmt = this.db.prepare(`
            INSERT INTO staff 
            (first_name, last_name, position, phone, email, qualifications, notes, is_active, created_by, updated_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            staff.first_name,
            staff.last_name,
            staff.position,
            staff.phone,
            staff.email,
            staff.qualifications,
            staff.notes,
            staff.is_active !== undefined ? staff.is_active : 1,
            userId,
            userId
        );
        
        const newStaff = this.getStaffById(result.lastInsertRowid);
        
        // Audit log
        logAuditAction(userId, 'create', 'staff', result.lastInsertRowid, null, staff);
        
        return newStaff;
    }
    
    public updateStaff(id: number, staff: any, userId: number | null = null): any {
        const oldStaff = this.getStaffById(id);
        
        const stmt = this.db.prepare(`
            UPDATE staff 
            SET first_name = ?, last_name = ?, position = ?, phone = ?, email = ?, 
                qualifications = ?, notes = ?, is_active = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            staff.first_name,
            staff.last_name,
            staff.position,
            staff.phone,
            staff.email,
            staff.qualifications,
            staff.notes,
            staff.is_active !== undefined ? staff.is_active : 1,
            userId,
            id
        );
        
        const updatedStaff = this.getStaffById(id);
        
        // Audit log
        logAuditAction(userId, 'update', 'staff', id, oldStaff, updatedStaff);
        
        return updatedStaff;
    }
    
    public deleteStaff(id: number, userId: number | null = null): boolean {
        const oldStaff = this.getStaffById(id);
        
        const stmt = this.db.prepare('DELETE FROM staff WHERE id = ?');
        const result = stmt.run(id);
        
        // Audit log
        logAuditAction(userId, 'delete', 'staff', id, oldStaff, null);
        
        return result.changes > 0;
    }
    
    // Appointment operations
    public getAppointments(filter: any = {}): any[] {
        let query = `
            SELECT a.*, 
                   p.first_name || ' ' || p.last_name as patient_name,
                   s.first_name || ' ' || s.last_name as staff_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN staff s ON a.staff_id = s.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (filter.patientId) {
            query += ' AND a.patient_id = ?';
            params.push(filter.patientId);
        }
        
        if (filter.staffId) {
            query += ' AND a.staff_id = ?';
            params.push(filter.staffId);
        }
        
        if (filter.status) {
            query += ' AND a.status = ?';
            params.push(filter.status);
        }
        
        if (filter.dateRange) {
            query += ' AND a.appointment_date BETWEEN ? AND ?';
            params.push(filter.dateRange.start, filter.dateRange.end);
        }
        
        if (filter.search) {
            query += ' AND (a.title LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ?)';
            const searchParam = `%${filter.search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam, searchParam);
        }
        
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            
            if (filter.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        
        query += ' ORDER BY a.appointment_date, a.appointment_time';
        
        return this.db.prepare(query).all(...params);
    }
    
    public getAppointmentById(id: number): any {
        return this.db.prepare(`
            SELECT a.*, 
                   p.first_name || ' ' || p.last_name as patient_name,
                   s.first_name || ' ' || s.last_name as staff_name
            FROM appointments a
            LEFT JOIN patients p ON a.patient_id = p.id
            LEFT JOIN staff s ON a.staff_id = s.id
            WHERE a.id = ?
        `).get(id);
    }
    
    public createAppointment(appointment: any, userId: number | null = null): any {
        const stmt = this.db.prepare(`
            INSERT INTO appointments 
            (title, appointment_date, appointment_time, patient_id, staff_id, notes, status, created_by, updated_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            appointment.title,
            appointment.appointment_date,
            appointment.appointment_time,
            appointment.patient_id,
            appointment.staff_id,
            appointment.notes,
            appointment.status || 'scheduled',
            userId,
            userId
        );
        
        const newAppointment = this.getAppointmentById(result.lastInsertRowid);
        
        // Audit log
        logAuditAction(userId, 'create', 'appointments', result.lastInsertRowid, null, appointment);
        
        return newAppointment;
    }
    
    public updateAppointment(id: number, appointment: any, userId: number | null = null): any {
        const oldAppointment = this.getAppointmentById(id);
        
        const stmt = this.db.prepare(`
            UPDATE appointments 
            SET title = ?, appointment_date = ?, appointment_time = ?, patient_id = ?, 
                staff_id = ?, notes = ?, status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            appointment.title,
            appointment.appointment_date,
            appointment.appointment_time,
            appointment.patient_id,
            appointment.staff_id,
            appointment.notes,
            appointment.status || 'scheduled',
            userId,
            id
        );
        
        const updatedAppointment = this.getAppointmentById(id);
        
        // Audit log
        logAuditAction(userId, 'update', 'appointments', id, oldAppointment, updatedAppointment);
        
        return updatedAppointment;
    }
    
    public deleteAppointment(id: number, userId: number | null = null): boolean {
        const oldAppointment = this.getAppointmentById(id);
        
        const stmt = this.db.prepare('DELETE FROM appointments WHERE id = ?');
        const result = stmt.run(id);
        
        // Audit log
        logAuditAction(userId, 'delete', 'appointments', id, oldAppointment, null);
        
        return result.changes > 0;
    }
    
    // Document operations
    public getDocuments(filter: any = {}): any[] {
        let query = `
            SELECT d.*, 
                   p.first_name || ' ' || p.last_name as patient_name
            FROM documents d
            LEFT JOIN patients p ON d.patient_id = p.id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (filter.patientId) {
            query += ' AND d.patient_id = ?';
            params.push(filter.patientId);
        }
        
        if (filter.documentType) {
            query += ' AND d.document_type = ?';
            params.push(filter.documentType);
        }
        
        if (filter.status) {
            query += ' AND d.status = ?';
            params.push(filter.status);
        }
        
        if (filter.search) {
            query += ' AND (d.title LIKE ? OR d.notes LIKE ? OR p.first_name LIKE ? OR p.last_name LIKE ?)';
            const searchParam = `%${filter.search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }
        
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            
            if (filter.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        
        query += ' ORDER BY d.document_date DESC, d.created_at DESC';
        
        return this.db.prepare(query).all(...params);
    }
    
    public getDocumentById(id: number): any {
        return this.db.prepare(`
            SELECT d.*, 
                   p.first_name || ' ' || p.last_name as patient_name
            FROM documents d
            LEFT JOIN patients p ON d.patient_id = p.id
            WHERE d.id = ?
        `).get(id);
    }
    
    public createDocument(document: any, userId: number | null = null): any {
        const stmt = this.db.prepare(`
            INSERT INTO documents 
            (title, document_date, patient_id, document_type, file_path, file_hash, file_size, mime_type, notes, status, created_by, updated_by) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            document.title,
            document.document_date,
            document.patient_id,
            document.document_type,
            document.file_path,
            document.file_hash,
            document.file_size,
            document.mime_type,
            document.notes,
            document.status || 'active',
            userId,
            userId
        );
        
        const newDocument = this.getDocumentById(result.lastInsertRowid);
        
        // Audit log
        logAuditAction(userId, 'create', 'documents', result.lastInsertRowid, null, document);
        
        return newDocument;
    }
    
    public updateDocument(id: number, document: any, userId: number | null = null): any {
        const oldDocument = this.getDocumentById(id);
        
        const stmt = this.db.prepare(`
            UPDATE documents 
            SET title = ?, document_date = ?, patient_id = ?, document_type = ?, 
                file_path = ?, file_hash = ?, file_size = ?, mime_type = ?, 
                notes = ?, status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            document.title,
            document.document_date,
            document.patient_id,
            document.document_type,
            document.file_path,
            document.file_hash,
            document.file_size,
            document.mime_type,
            document.notes,
            document.status || 'active',
            userId,
            id
        );
        
        const updatedDocument = this.getDocumentById(id);
        
        // Audit log
        logAuditAction(userId, 'update', 'documents', id, oldDocument, updatedDocument);
        
        return updatedDocument;
    }
    
    public deleteDocument(id: number, userId: number | null = null): boolean {
        const oldDocument = this.getDocumentById(id);
        
        const stmt = this.db.prepare('DELETE FROM documents WHERE id = ?');
        const result = stmt.run(id);
        
        // Audit log
        logAuditAction(userId, 'delete', 'documents', id, oldDocument, null);
        
        return result.changes > 0;
    }
    
    // User operations
    public getUsers(filter: any = {}): any[] {
        let query = 'SELECT * FROM users WHERE 1=1';
        const params: any[] = [];
        
        if (filter.search) {
            query += ' AND (username LIKE ? OR email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
            const searchParam = `%${filter.search}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }
        
        if (filter.isActive !== undefined) {
            query += ' AND is_active = ?';
            params.push(filter.isActive ? 1 : 0);
        }
        
        if (filter.limit) {
            query += ' LIMIT ?';
            params.push(filter.limit);
            
            if (filter.offset) {
                query += ' OFFSET ?';
                params.push(filter.offset);
            }
        }
        
        query += ' ORDER BY username';
        
        return this.db.prepare(query).all(...params);
    }
    
    public getUserById(id: number): any {
        return this.db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    }
    
    public getUserByUsername(username: string): any {
        return this.db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    }
    
    public getUserByEmail(email: string): any {
        return this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    }
    
    public createUser(user: any): any {
        const stmt = this.db.prepare(`
            INSERT INTO users 
            (username, email, password_hash, first_name, last_name, is_active) 
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        
        const result = stmt.run(
            user.username,
            user.email,
            user.password_hash,
            user.first_name,
            user.last_name,
            user.is_active !== undefined ? user.is_active : 1
        );
        
        const newUser = this.getUserById(result.lastInsertRowid);
        
        // Audit log (system user since this is user creation)
        logAuditAction(null, 'create', 'users', result.lastInsertRowid, null, user);
        
        return newUser;
    }
    
    public updateUser(id: number, user: any, currentUserId: number | null = null): any {
        const oldUser = this.getUserById(id);
        
        const stmt = this.db.prepare(`
            UPDATE users 
            SET username = ?, email = ?, first_name = ?, last_name = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `);
        
        stmt.run(
            user.username,
            user.email,
            user.first_name,
            user.last_name,
            user.is_active !== undefined ? user.is_active : 1,
            id
        );
        
        const updatedUser = this.getUserById(id);
        
        // Audit log
        logAuditAction(currentUserId, 'update', 'users', id, oldUser, updatedUser);
        
        return updatedUser;
    }
    
    public updateUserPassword(id: number, passwordHash: string, currentUserId: number | null = null): boolean {
        const oldUser = this.getUserById(id);
        
        const stmt = this.db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
        const result = stmt.run(passwordHash, id);
        
        // Audit log
        logAuditAction(currentUserId, 'update_password', 'users', id, oldUser, { password_updated: true });
        
        return result.changes > 0;
    }
    
    public deleteUser(id: number, currentUserId: number | null = null): boolean {
        const oldUser = this.getUserById(id);
        
        const stmt = this.db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);
        
        // Audit log
        logAuditAction(currentUserId, 'delete', 'users', id, oldUser, null);
        
        return result.changes > 0;
    }
}