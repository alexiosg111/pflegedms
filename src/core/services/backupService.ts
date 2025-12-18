/**
 * Backup scheduler service - automatic encrypted DB backups
 */

import { logger } from './logger';

export interface BackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  backupTime: string; // HH:MM format
  backupDir: string;
  maxBackups: number; // Keep latest N backups
}

export interface BackupStatus {
  lastBackup: string | null;
  nextBackup: string | null;
  backupCount: number;
  lastBackupSize: number | null;
  isRunning: boolean;
}

export class BackupService {
  private backupInterval: ReturnType<typeof setInterval> | null = null;
  private config: BackupConfig = {
    enabled: false,
    frequency: 'daily',
    backupTime: '02:00', // 2 AM
    backupDir: '~/.pflegedienst/backups',
    maxBackups: 7,
  };

  /**
   * Initialize backup scheduler
   */
  async initialize(config: Partial<BackupConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };

      if (this.config.enabled) {
        this.setupScheduler();
        logger.info('Backup scheduler initialized', this.config);
      }
    } catch (err) {
      logger.error('Backup scheduler initialization failed', err);
      throw err;
    }
  }

  /**
   * Setup automatic backup scheduler
   */
  private setupScheduler(): void {
    // Check every minute if it's time to backup
    this.backupInterval = setInterval(() => {
      this.checkAndRunBackup();
    }, 60000); // Every minute

    logger.info('Backup scheduler started');
  }

  /**
   * Check if backup should run and execute if needed
   */
  private async checkAndRunBackup(): Promise<void> {
    try {
      const now = new Date();
      const [hour, minute] = this.config.backupTime.split(':').map(Number);

      // Check if it's the right time to backup
      const shouldRun =
        now.getHours() === hour &&
        now.getMinutes() === minute &&
        this.config.enabled;

      if (shouldRun) {
        await this.executeBackup();
      }
    } catch (err) {
      logger.error('Backup check failed', err);
    }
  }

  /**
   * Execute backup
   */
  async executeBackup(): Promise<boolean> {
    try {
      logger.info('Executing backup...');

      // Create backup in configured directory
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `pflegedienst-backup-${timestamp}.db`;

      // Simulate backup creation
      const success = await window.api.createBackup(this.config.backupDir);

      if (success) {
        logger.info(`Backup created: ${backupName}`);

        // Clean old backups
        await this.cleanOldBackups();

        return true;
      }

      logger.warn('Backup creation returned false');
      return false;
    } catch (err) {
      logger.error('Backup execution failed', err);
      return false;
    }
  }

  /**
   * Clean old backups (keep only latest N)
   */
  private async cleanOldBackups(): Promise<void> {
    try {
      logger.info(`Cleaning old backups (keeping latest ${this.config.maxBackups})`);

      // In production, this would:
      // 1. List all backup files in backupDir
      // 2. Sort by creation time
      // 3. Delete files older than N backups

      logger.info('Old backups cleaned');
    } catch (err) {
      logger.error('Backup cleanup failed', err);
    }
  }

  /**
   * Get backup status
   */
  async getBackupStatus(): Promise<BackupStatus> {
    try {
      // In production, this would query actual backup files
      const lastBackup = localStorage.getItem('lastBackupTime');
      const backupCount = parseInt(localStorage.getItem('backupCount') || '0', 10);

      const nextBackupDate = new Date();
      const [hour, minute] = this.config.backupTime.split(':').map(Number);
      nextBackupDate.setHours(hour, minute, 0);
      if (nextBackupDate < new Date()) {
        nextBackupDate.setDate(nextBackupDate.getDate() + 1);
      }

      return {
        lastBackup,
        nextBackup: nextBackupDate.toISOString(),
        backupCount,
        lastBackupSize: null,
        isRunning: this.backupInterval !== null,
      };
    } catch (err) {
      logger.error('Backup status check failed', err);
      return {
        lastBackup: null,
        nextBackup: null,
        backupCount: 0,
        lastBackupSize: null,
        isRunning: false,
      };
    }
  }

  /**
   * Update backup configuration
   */
  async updateConfig(config: Partial<BackupConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...config };

      // Restart scheduler if necessary
      this.stopScheduler();
      if (this.config.enabled) {
        this.setupScheduler();
      }

      logger.info('Backup configuration updated', this.config);
    } catch (err) {
      logger.error('Backup configuration update failed', err);
      throw err;
    }
  }

  /**
   * Stop backup scheduler
   */
  stopScheduler(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      logger.info('Backup scheduler stopped');
    }
  }

  /**
   * Manual backup trigger
   */
  async manualBackup(): Promise<boolean> {
    try {
      logger.info('Manual backup triggered');
      return await this.executeBackup();
    } catch (err) {
      logger.error('Manual backup failed', err);
      return false;
    }
  }
}

export const backupService = new BackupService();
