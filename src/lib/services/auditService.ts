import { getConnection } from '../database/connection';

export function logAuditAction(userId: number | null, action: string, tableName: string | null = null, recordId: number | null = null, oldValues: any = null, newValues: any = null): void {
    const db = getConnection();
    
    const auditLog = {
        user_id: userId,
        action: action,
        table_name: tableName,
        record_id: recordId,
        old_values: oldValues ? JSON.stringify(oldValues) : null,
        new_values: newValues ? JSON.stringify(newValues) : null,
        ip_address: 'localhost', // In Electron, we don't have IP by default
        user_agent: navigator?.userAgent || 'Electron App'
    };
    
    try {
        const stmt = db.prepare(`
            INSERT INTO audit_logs 
            (user_id, action, table_name, record_id, old_values, new_values, ip_address, user_agent) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        stmt.run(
            auditLog.user_id,
            auditLog.action,
            auditLog.table_name,
            auditLog.record_id,
            auditLog.old_values,
            auditLog.new_values,
            auditLog.ip_address,
            auditLog.user_agent
        );
        
        console.log(`Audit log created: ${action} by user ${userId}`);
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
}

export function getAuditLogs(filter: {
    userId?: number;
    action?: string;
    tableName?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
} = {}): any[] {
    const db = getConnection();
    
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    
    if (filter.userId !== undefined) {
        query += ' AND user_id = ?';
        params.push(filter.userId);
    }
    
    if (filter.action) {
        query += ' AND action = ?';
        params.push(filter.action);
    }
    
    if (filter.tableName) {
        query += ' AND table_name = ?';
        params.push(filter.tableName);
    }
    
    if (filter.startDate) {
        query += ' AND created_at >= ?';
        params.push(filter.startDate);
    }
    
    if (filter.endDate) {
        query += ' AND created_at <= ?';
        params.push(filter.endDate);
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filter.limit) {
        query += ' LIMIT ?';
        params.push(filter.limit);
        
        if (filter.offset) {
            query += ' OFFSET ?';
            params.push(filter.offset);
        }
    }
    
    try {
        return db.prepare(query).all(...params);
    } catch (error) {
        console.error('Failed to get audit logs:', error);
        return [];
    }
}

export function getAuditLogCount(filter: {
    userId?: number;
    action?: string;
    tableName?: string;
    startDate?: string;
    endDate?: string;
} = {}): number {
    const db = getConnection();
    
    let query = 'SELECT COUNT(*) as count FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    
    if (filter.userId !== undefined) {
        query += ' AND user_id = ?';
        params.push(filter.userId);
    }
    
    if (filter.action) {
        query += ' AND action = ?';
        params.push(filter.action);
    }
    
    if (filter.tableName) {
        query += ' AND table_name = ?';
        params.push(filter.tableName);
    }
    
    if (filter.startDate) {
        query += ' AND created_at >= ?';
        params.push(filter.startDate);
    }
    
    if (filter.endDate) {
        query += ' AND created_at <= ?';
        params.push(filter.endDate);
    }
    
    try {
        const result = db.prepare(query).get(...params);
        return result.count;
    } catch (error) {
        console.error('Failed to get audit log count:', error);
        return 0;
    }
}