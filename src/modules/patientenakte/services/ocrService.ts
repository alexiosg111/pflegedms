/**
 * OCR service using Tesseract.js
 * Runs entirely in the browser (no server dependency)
 */

import Tesseract from 'tesseract.js';
import { logger } from '@core/utils/logger';

interface OCRResult {
  text: string;
  confidence: number;
}

export class OCRService {
  private worker: Tesseract.Worker | null = null;
  private isInitialized = false;

  /**
   * Initialize OCR worker
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.worker = await Tesseract.createWorker('deu', 1, {
        logger: (m) => {
          if (m.status === 'recognizing') {
            logger.debug(`OCR progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      this.isInitialized = true;
      logger.info('OCR worker initialized');
    } catch (err) {
      logger.error('Failed to initialize OCR worker', err);
      throw err;
    }
  }

  /**
   * Extract text from image file
   */
  async extractText(imageData: Blob | File | string): Promise<OCRResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.worker) {
      throw new Error('OCR worker not initialized');
    }

    try {
      logger.info('Starting OCR extraction...');

      const result = await this.worker.recognize(imageData);
      const text = result.data.text || '';
      const confidence = result.data.confidence || 0;

      logger.info(`OCR extraction complete. Confidence: ${confidence}%`);

      return {
        text: text.trim(),
        confidence,
      };
    } catch (err) {
      logger.error('OCR extraction failed', err);
      throw err;
    }
  }

  /**
   * Cleanup worker
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      logger.info('OCR worker terminated');
    }
  }

  /**
   * Process image file (from file input)
   */
  async processFile(file: File): Promise<OCRResult> {
    try {
      // Only process images
      if (!file.type.startsWith('image/')) {
        logger.warn(`Skipping OCR for non-image file: ${file.name}`);
        return { text: '', confidence: 0 };
      }

      logger.info(`Processing file for OCR: ${file.name}`);
      return await this.extractText(file);
    } catch (err) {
      logger.error(`Failed to process file ${file.name}`, err);
      throw err;
    }
  }

  /**
   * Classify document type based on OCR text
   */
  classifyDocumentType(ocrText: string): string {
    const text = ocrText.toLowerCase();

    // Simple keyword-based classification
    if (
      text.includes('rezept') ||
      text.includes('verordnung') ||
      text.includes('medikament')
    ) {
      return 'prescription';
    }

    if (text.includes('labor') || text.includes('befund') || text.includes('analyse')) {
      return 'lab_report';
    }

    if (text.includes('arzt') || text.includes('brief') || text.includes('untersuchung')) {
      return 'doctor_letter';
    }

    if (
      text.includes('rechnung') ||
      text.includes('invoice') ||
      text.includes('betrag') ||
      text.includes('euro') ||
      text.includes('€')
    ) {
      return 'invoice';
    }

    if (text.includes('vertrag') || text.includes('vereinbarung')) {
      return 'contract';
    }

    if (text.includes('pflege') || text.includes('betreuung') || text.includes('plan')) {
      return 'care_plan';
    }

    if (text.includes('versicherung') || text.includes('krankenkasse')) {
      return 'insurance';
    }

    return 'other';
  }
}

export const ocrService = new OCRService();
