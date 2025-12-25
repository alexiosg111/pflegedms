import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron
  },
  database: {
    // Patient operations
    getPatients: (filter) => ipcRenderer.invoke('database:getPatients', filter),
    getPatientById: (id) => ipcRenderer.invoke('database:getPatientById', id),
    createPatient: (patient, userId) => ipcRenderer.invoke('database:createPatient', patient, userId),
    updatePatient: (id, patient, userId) => ipcRenderer.invoke('database:updatePatient', id, patient, userId),
    deletePatient: (id, userId) => ipcRenderer.invoke('database:deletePatient', id, userId),
    
    // Staff operations
    getStaff: (filter) => ipcRenderer.invoke('database:getStaff', filter),
    getStaffById: (id) => ipcRenderer.invoke('database:getStaffById', id),
    createStaff: (staff, userId) => ipcRenderer.invoke('database:createStaff', staff, userId),
    updateStaff: (id, staff, userId) => ipcRenderer.invoke('database:updateStaff', id, staff, userId),
    deleteStaff: (id, userId) => ipcRenderer.invoke('database:deleteStaff', id, userId),
    
    // Appointment operations
    getAppointments: (filter) => ipcRenderer.invoke('database:getAppointments', filter),
    getAppointmentById: (id) => ipcRenderer.invoke('database:getAppointmentById', id),
    createAppointment: (appointment, userId) => ipcRenderer.invoke('database:createAppointment', appointment, userId),
    updateAppointment: (id, appointment, userId) => ipcRenderer.invoke('database:updateAppointment', id, appointment, userId),
    deleteAppointment: (id, userId) => ipcRenderer.invoke('database:deleteAppointment', id, userId),
    
    // Document operations
    getDocuments: (filter) => ipcRenderer.invoke('database:getDocuments', filter),
    getDocumentById: (id) => ipcRenderer.invoke('database:getDocumentById', id),
    createDocument: (document, userId) => ipcRenderer.invoke('database:createDocument', document, userId),
    updateDocument: (id, document, userId) => ipcRenderer.invoke('database:updateDocument', id, document, userId),
    deleteDocument: (id, userId) => ipcRenderer.invoke('database:deleteDocument', id, userId),
    
    // User operations
    getUsers: (filter) => ipcRenderer.invoke('database:getUsers', filter),
    getUserById: (id) => ipcRenderer.invoke('database:getUserById', id),
    getUserByUsername: (username) => ipcRenderer.invoke('database:getUserByUsername', username),
    getUserByEmail: (email) => ipcRenderer.invoke('database:getUserByEmail', email),
    createUser: (user) => ipcRenderer.invoke('database:createUser', user),
    updateUser: (id, user, currentUserId) => ipcRenderer.invoke('database:updateUser', id, user, currentUserId),
    updateUserPassword: (id, passwordHash, currentUserId) => ipcRenderer.invoke('database:updateUserPassword', id, passwordHash, currentUserId),
    deleteUser: (id, currentUserId) => ipcRenderer.invoke('database:deleteUser', id, currentUserId),
    
    // RBAC operations
    checkPermission: (userId, permissionName) => ipcRenderer.invoke('database:checkPermission', userId, permissionName),
    getUserPermissions: (userId) => ipcRenderer.invoke('database:getUserPermissions', userId),
    getUserRoles: (userId) => ipcRenderer.invoke('database:getUserRoles', userId),
    hasRole: (userId, roleName) => ipcRenderer.invoke('database:hasRole', userId, roleName),
    
    // Audit operations
    getAuditLogs: (filter) => ipcRenderer.invoke('database:getAuditLogs', filter),
    getAuditLogCount: (filter) => ipcRenderer.invoke('database:getAuditLogCount', filter),
    
    // Authentication operations
    login: (username, password) => ipcRenderer.invoke('database:login', username, password),
    verifyToken: (token) => ipcRenderer.invoke('database:verifyToken', token)
  }
});
