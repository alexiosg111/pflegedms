import { getConnection } from '../database/connection';

export function checkPermission(userId: number, permissionName: string): boolean {
    const db = getConnection();
    
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = ? AND p.name = ?
        `;
        
        const result = db.prepare(query).get(userId, permissionName);
        return result.count > 0;
    } catch (error) {
        console.error('Permission check failed:', error);
        return false;
    }
}

export function getUserPermissions(userId: number): string[] {
    const db = getConnection();
    
    try {
        const query = `
            SELECT p.name as permission
            FROM user_roles ur
            JOIN role_permissions rp ON ur.role_id = rp.role_id
            JOIN permissions p ON rp.permission_id = p.id
            WHERE ur.user_id = ?
        `;
        
        const results = db.prepare(query).all(userId);
        return results.map(row => row.permission);
    } catch (error) {
        console.error('Failed to get user permissions:', error);
        return [];
    }
}

export function getUserRoles(userId: number): string[] {
    const db = getConnection();
    
    try {
        const query = `
            SELECT r.name as role
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ?
        `;
        
        const results = db.prepare(query).all(userId);
        return results.map(row => row.role);
    } catch (error) {
        console.error('Failed to get user roles:', error);
        return [];
    }
}

export function hasRole(userId: number, roleName: string): boolean {
    const db = getConnection();
    
    try {
        const query = `
            SELECT COUNT(*) as count
            FROM user_roles ur
            JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = ? AND r.name = ?
        `;
        
        const result = db.prepare(query).get(userId, roleName);
        return result.count > 0;
    } catch (error) {
        console.error('Role check failed:', error);
        return false;
    }
}

export function getAllRoles(): any[] {
    const db = getConnection();
    
    try {
        return db.prepare('SELECT * FROM roles ORDER BY name').all();
    } catch (error) {
        console.error('Failed to get roles:', error);
        return [];
    }
}

export function getAllPermissions(): any[] {
    const db = getConnection();
    
    try {
        return db.prepare('SELECT * FROM permissions ORDER BY name').all();
    } catch (error) {
        console.error('Failed to get permissions:', error);
        return [];
    }
}

export function getRolePermissions(roleId: number): any[] {
    const db = getConnection();
    
    try {
        const query = `
            SELECT p.*
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ?
            ORDER BY p.name
        `;
        
        return db.prepare(query).all(roleId);
    } catch (error) {
        console.error('Failed to get role permissions:', error);
        return [];
    }
}

export function assignRoleToUser(userId: number, roleId: number): boolean {
    const db = getConnection();
    
    try {
        const query = 'INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)';
        const stmt = db.prepare(query);
        stmt.run(userId, roleId);
        return true;
    } catch (error) {
        console.error('Failed to assign role to user:', error);
        return false;
    }
}

export function removeRoleFromUser(userId: number, roleId: number): boolean {
    const db = getConnection();
    
    try {
        const query = 'DELETE FROM user_roles WHERE user_id = ? AND role_id = ?';
        const stmt = db.prepare(query);
        stmt.run(userId, roleId);
        return true;
    } catch (error) {
        console.error('Failed to remove role from user:', error);
        return false;
    }
}

export function assignPermissionToRole(roleId: number, permissionId: number): boolean {
    const db = getConnection();
    
    try {
        const query = 'INSERT OR IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)';
        const stmt = db.prepare(query);
        stmt.run(roleId, permissionId);
        return true;
    } catch (error) {
        console.error('Failed to assign permission to role:', error);
        return false;
    }
}

export function removePermissionFromRole(roleId: number, permissionId: number): boolean {
    const db = getConnection();
    
    try {
        const query = 'DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?';
        const stmt = db.prepare(query);
        stmt.run(roleId, permissionId);
        return true;
    } catch (error) {
        console.error('Failed to remove permission from role:', error);
        return false;
    }
}