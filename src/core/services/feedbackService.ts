/**
 * Feedback Service
 */

import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

export interface FeedbackInput {
  type: 'bug' | 'feature' | 'general';
  message: string;
  rating?: number;
  contact_email?: string;
}

export interface Feedback extends FeedbackInput {
  id: string;
  user_agent: string;
  app_version: string;
  created_at: string;
  status: 'new' | 'reviewed' | 'implemented' | 'closed';
}

export class FeedbackService {
  /**
   * Submit new feedback
   */
  async submitFeedback(input: FeedbackInput): Promise<Feedback> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const appVersion = await window.api.getAppVersion();
    const userAgent = navigator.userAgent;

    try {
      const sql = `
        INSERT INTO feedback (
          id, type, message, rating, contact_email, 
          user_agent, app_version, created_at, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await window.api.executeDatabase(sql, [
        id,
        input.type,
        input.message,
        input.rating || null,
        input.contact_email || null,
        userAgent,
        appVersion,
        now,
        'new'
      ]);

      logger.info(`Feedback submitted: ${id}`);

      return {
        id,
        ...input,
        user_agent: userAgent,
        app_version: appVersion,
        created_at: now,
        status: 'new'
      };
    } catch (err) {
      logger.error('Failed to submit feedback', err);
      throw err;
    }
  }

  /**
   * Get all feedback (for admin)
   */
  async getAllFeedback(): Promise<Feedback[]> {
    try {
      const sql = `SELECT * FROM feedback ORDER BY created_at DESC`;
      const result = await window.api.queryDatabase(sql);
      return result as unknown as Feedback[];
    } catch (err) {
      logger.error('Failed to fetch feedback', err);
      throw err;
    }
  }
}

export const feedbackService = new FeedbackService();
