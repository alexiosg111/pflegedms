// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
    namespace App {
        // interface Error {}
        // interface Locals {}
        // interface PageData {}
        // interface PageState {}
        // interface Platform {}
    }
    
    interface Window {
        electron: {
            platform: string;
            database: {
                getPatients: (filter?: any) => any[];
                getPatientById: (id: number) => any;
                createPatient: (patient: any, userId?: number) => any;
                updatePatient: (id: number, patient: any, userId?: number) => any;
                deletePatient: (id: number, userId?: number) => boolean;
                
                getStaff: (filter?: any) => any[];
                getStaffById: (id: number) => any;
                createStaff: (staff: any, userId?: number) => any;
                updateStaff: (id: number, staff: any, userId?: number) => any;
                deleteStaff: (id: number, userId?: number) => boolean;
                
                getAppointments: (filter?: any) => any[];
                getAppointmentById: (id: number) => any;
                createAppointment: (appointment: any, userId?: number) => any;
                updateAppointment: (id: number, appointment: any, userId?: number) => any;
                deleteAppointment: (id: number, userId?: number) => boolean;
                
                getDocuments: (filter?: any) => any[];
                getDocumentById: (id: number) => any;
                createDocument: (document: any, userId?: number) => any;
                updateDocument: (id: number, document: any, userId?: number) => any;
                deleteDocument: (id: number, userId?: number) => boolean;
                
                getUsers: (filter?: any) => any[];
                getUserById: (id: number) => any;
                getUserByUsername: (username: string) => any;
                getUserByEmail: (email: string) => any;
                createUser: (user: any) => any;
                updateUser: (id: number, user: any, currentUserId?: number) => any;
                updateUserPassword: (id: number, passwordHash: string, currentUserId?: number) => boolean;
                deleteUser: (id: number, currentUserId?: number) => boolean;
                
                checkPermission: (userId: number, permissionName: string) => boolean;
                getUserPermissions: (userId: number) => string[];
                getUserRoles: (userId: number) => string[];
                hasRole: (userId: number, roleName: string) => boolean;
                
                getAuditLogs: (filter?: any) => any[];
                getAuditLogCount: (filter?: any) => number;
                
                login: (username: string, password: string) => Promise<{ success: boolean; token?: string; error?: string }>;
                verifyToken: (token: string) => Promise<{ valid: boolean; user?: any; error?: string }>;
            };
        };
    }
}

export {};
