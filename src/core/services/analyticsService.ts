/**
 * Analytics Service (Local-First, Privacy-Focused)
 */

import { logger } from '../utils/logger';

export interface AnalyticsEvent {
  eventName: string;
  category?: string;
  properties?: Record<string, any>;
}

export class AnalyticsService {
  private isEnabled: boolean = true;

  constructor() {
    // Check if analytics is disabled in settings (future feature)
    // For now, default to true
  }

  /**
   * Track an event
   */
  async track(eventName: string, properties?: Record<string, any>, category: string = 'action'): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const sql = `
        INSERT INTO analytics_events (event_name, category, properties, timestamp)
        VALUES (?, ?, ?, ?)
      `;

      const now = new Date().toISOString();
      const propsJson = properties ? JSON.stringify(properties) : null;

      await window.api.executeDatabase(sql, [eventName, category, propsJson, now]);
      
      // Don't log every analytics event to console to avoid noise, unless in debug
      if (process.env.NODE_ENV === 'development') {
        logger.debug(`[Analytics] ${eventName}`, properties);
      }
    } catch (err) {
      // Fail silently to not disrupt user experience
      console.error('Failed to track analytics event', err);
    }
  }

  /**
   * Track page view / navigation
   */
  async trackPageView(pageName: string): Promise<void> {
    await this.track('page_view', { page: pageName }, 'navigation');
  }

  /**
   * Track performance metric
   */
  async trackPerformance(metricName: string, durationMs: number, meta?: Record<string, any>): Promise<void> {
    await this.track(metricName, { duration_ms: durationMs, ...meta }, 'performance');
  }

  /**
   * Get basic stats (for admin dashboard)
   */
  async getStats(days: number = 7): Promise<any> {
    try {
      const sql = `
        SELECT event_name, COUNT(*) as count 
        FROM analytics_events 
        WHERE timestamp > date('now', ?) 
        GROUP BY event_name 
        ORDER BY count DESC 
        LIMIT 20
      `;
      return await window.api.queryDatabase(sql, [`-${days} days`]);
    } catch (err) {
      logger.error('Failed to get analytics stats', err);
      return [];
    }
  }
}

export const analyticsService = new AnalyticsService();
