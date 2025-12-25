import { getConnection } from './connection';

export function initializeDatabase(): void {
    const db = getConnection();
    
    // Create tables if they don't exist
    db.exec(`
        -- Users table for authentication
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Roles table for RBAC
        CREATE TABLE IF NOT EXISTS roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Permissions table
        CREATE TABLE IF NOT EXISTS permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Role-Permission mapping (Many-to-Many)
        CREATE TABLE IF NOT EXISTS role_permissions (
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
        );

        -- User-Role mapping (Many-to-Many)
        CREATE TABLE IF NOT EXISTS user_roles (
            user_id INTEGER NOT NULL,
            role_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, role_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        );

        -- Patients table
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            birth_date TEXT,
            address TEXT,
            phone TEXT,
            insurance TEXT,
            diagnosis TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Staff table
        CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            position TEXT,
            phone TEXT,
            email TEXT,
            qualifications TEXT,
            notes TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Appointments table
        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            appointment_date TEXT NOT NULL,
            appointment_time TEXT,
            patient_id INTEGER,
            staff_id INTEGER,
            notes TEXT,
            status TEXT DEFAULT 'scheduled',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (staff_id) REFERENCES staff(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Documents table
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            document_date TEXT,
            patient_id INTEGER,
            document_type TEXT,
            file_path TEXT,
            file_hash TEXT,
            file_size INTEGER,
            mime_type TEXT,
            notes TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (patient_id) REFERENCES patients(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Document versions for versioning
        CREATE TABLE IF NOT EXISTS document_versions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            version_number INTEGER NOT NULL,
            file_path TEXT,
            file_hash TEXT,
            file_size INTEGER,
            mime_type TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
            FOREIGN KEY (created_by) REFERENCES users(id)
        );

        -- Document metadata
        CREATE TABLE IF NOT EXISTS document_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            key TEXT NOT NULL,
            value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        -- Document tags
        CREATE TABLE IF NOT EXISTS document_tags (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_id INTEGER NOT NULL,
            tag TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
        );

        -- Workflows table
        CREATE TABLE IF NOT EXISTS workflows (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            is_active BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Workflow steps
        CREATE TABLE IF NOT EXISTS workflow_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow_id INTEGER NOT NULL,
            step_name TEXT NOT NULL,
            step_order INTEGER NOT NULL,
            role_id INTEGER,
            is_required BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES roles(id)
        );

        -- Workflow instances
        CREATE TABLE IF NOT EXISTS workflow_instances (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow_id INTEGER NOT NULL,
            document_id INTEGER,
            status TEXT DEFAULT 'pending',
            current_step_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by INTEGER,
            updated_by INTEGER,
            FOREIGN KEY (workflow_id) REFERENCES workflows(id),
            FOREIGN KEY (document_id) REFERENCES documents(id),
            FOREIGN KEY (current_step_id) REFERENCES workflow_steps(id),
            FOREIGN KEY (created_by) REFERENCES users(id),
            FOREIGN KEY (updated_by) REFERENCES users(id)
        );

        -- Workflow history
        CREATE TABLE IF NOT EXISTS workflow_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            workflow_instance_id INTEGER NOT NULL,
            step_id INTEGER NOT NULL,
            status TEXT NOT NULL,
            completed_by INTEGER,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            notes TEXT,
            FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE,
            FOREIGN KEY (step_id) REFERENCES workflow_steps(id),
            FOREIGN KEY (completed_by) REFERENCES users(id)
        );

        -- Audit logs table (unchangeable)
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            table_name TEXT,
            record_id INTEGER,
            old_values TEXT,
            new_values TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        );

        -- System settings
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Indexes for performance
        CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(last_name, first_name);
        CREATE INDEX IF NOT EXISTS idx_documents_patient ON documents(patient_id);
        CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(document_type);
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
        CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
        CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);
    `);
    
    console.log('Database schema initialized');
    
    // Seed initial data if needed
    seedInitialData();
}

function seedInitialData(): void {
    const db = getConnection();
    
    // Check if we have any roles
    const rolesCount = db.prepare('SELECT COUNT(*) as count FROM roles').get().count;
    
    if (rolesCount === 0) {
        console.log('Seeding initial roles and permissions...');
        
        // Insert basic roles
        const roles = [
            { name: 'admin', description: 'System Administrator with full access' },
            { name: 'doctor', description: 'Medical professional with patient access' },
            { name: 'nurse', description: 'Nursing staff with limited access' },
            { name: 'office', description: 'Office staff for administrative tasks' }
        ];
        
        const insertRole = db.prepare('INSERT INTO roles (name, description) VALUES (?, ?)');
        const roleStmt = insertRole;
        
        for (const role of roles) {
            roleStmt.run(role.name, role.description);
        }
        
        // Insert basic permissions
        const permissions = [
            { name: 'create_patient', description: 'Create new patients' },
            { name: 'read_patient', description: 'View patient information' },
            { name: 'update_patient', description: 'Update patient information' },
            { name: 'delete_patient', description: 'Delete patients' },
            { name: 'create_document', description: 'Upload/create documents' },
            { name: 'read_document', description: 'View documents' },
            { name: 'update_document', description: 'Update documents' },
            { name: 'delete_document', description: 'Delete documents' },
            { name: 'create_appointment', description: 'Create appointments' },
            { name: 'read_appointment', description: 'View appointments' },
            { name: 'update_appointment', description: 'Update appointments' },
            { name: 'delete_appointment', description: 'Delete appointments' },
            { name: 'manage_users', description: 'Manage user accounts' },
            { name: 'manage_roles', description: 'Manage roles and permissions' },
            { name: 'view_audit_logs', description: 'View audit logs' },
            { name: 'manage_system_settings', description: 'Manage system settings' }
        ];
        
        const insertPermission = db.prepare('INSERT INTO permissions (name, description) VALUES (?, ?)');
        const permStmt = insertPermission;
        
        for (const permission of permissions) {
            permStmt.run(permission.name, permission.description);
        }
        
        // Assign permissions to admin role
        const adminRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('admin');
        const allPermissions = db.prepare('SELECT id FROM permissions').all();
        
        const insertRolePermission = db.prepare('INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)');
        const rolePermStmt = insertRolePermission;
        
        for (const perm of allPermissions) {
            rolePermStmt.run(adminRole.id, perm.id);
        }
        
        // Assign basic permissions to other roles
        const doctorRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('doctor');
        const nurseRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('nurse');
        const officeRole = db.prepare('SELECT id FROM roles WHERE name = ?').get('office');
        
        const doctorPermissions = [
            'create_patient', 'read_patient', 'update_patient',
            'create_document', 'read_document', 'update_document',
            'create_appointment', 'read_appointment', 'update_appointment'
        ];
        
        const nursePermissions = [
            'read_patient', 'update_patient',
            'read_document', 'create_document',
            'read_appointment', 'update_appointment'
        ];
        
        const officePermissions = [
            'create_patient', 'read_patient', 'update_patient',
            'read_document', 'create_document',
            'create_appointment', 'read_appointment', 'update_appointment', 'delete_appointment'
        ];
        
        function assignPermissionsToRole(roleId: number, permissionNames: string[]): void {
            for (const permName of permissionNames) {
                const perm = db.prepare('SELECT id FROM permissions WHERE name = ?').get(permName);
                if (perm) {
                    rolePermStmt.run(roleId, perm.id);
                }
            }
        }
        
        assignPermissionsToRole(doctorRole.id, doctorPermissions);
        assignPermissionsToRole(nurseRole.id, nursePermissions);
        assignPermissionsToRole(officeRole.id, officePermissions);
        
        console.log('Initial data seeding completed');
    }
}