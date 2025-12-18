/**
 * Enhanced OCR Service with Confidence Scoring and Batch Processing
 */

import { logger } from '../../../core/utils/logger';
import Tesseract from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number; // 0-100
  language: string;
  blockCount: number;
  requiresReview: boolean;
}

export interface OCRBatchJob {
  id: string;
  fileIds: string[];
  totalFiles: number;
  processedFiles: number;
  results: Map<string, OCRResult>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

const CONFIDENCE_THRESHOLD = 85; // Files < 85% confidence need review
const OCR_CACHE = new Map<string, OCRResult>();

export class OCREnhancedService {
  private static worker: Tesseract.Worker | null = null;
  private static batchJobs = new Map<string, OCRBatchJob>();

  /**
   * Initialize OCR worker (singleton pattern)
   */
  static async initWorker(): Promise<Tesseract.Worker> {
    if (this.worker) {
      return this.worker;
    }

    try {
      this.worker = await Tesseract.createWorker('deu', 1, {
        cacheType: 'indexeddb',
      });
      logger.info('OCR worker initialized');
      return this.worker;
    } catch (err) {
      logger.error('Failed to initialize OCR worker', err);
      throw new Error('OCR service unavailable');
    }
  }

  /**
   * Terminate OCR worker
   */
  static async terminateWorker(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      logger.info('OCR worker terminated');
    }
  }

  /**
   * Process single file with confidence scoring
   */
  static async processFile(
    fileId: string,
    fileBlob: Blob
  ): Promise<OCRResult> {
    // Check cache first
    const cached = OCR_CACHE.get(fileId);
    if (cached) {
      logger.info(`OCR cache hit for ${fileId}`);
      return cached;
    }

    try {
      const worker = await this.initWorker();
      const result = await worker.recognize(fileBlob);

      const ocrResult: OCRResult = {
        text: result.data.text,
        confidence: Math.round(result.data.confidence * 100) / 100,
        language: result.data.paragraphs?.[0]?.languages?.[0] || 'deu',
        blockCount: result.data.blocks?.length || 0,
        requiresReview: result.data.confidence < CONFIDENCE_THRESHOLD / 100,
      };

      // Cache result
      OCR_CACHE.set(fileId, ocrResult);

      logger.info(`OCR processed: ${fileId} (${ocrResult.confidence}%)`);
      return ocrResult;
    } catch (err) {
      logger.error(`OCR failed for ${fileId}`, err);
      throw new Error('OCR processing failed');
    }
  }

  /**
   * Batch process multiple files
   */
  static async processBatch(fileIds: string[], files: Blob[]): Promise<string> {
    const jobId = `batch-${Date.now()}`;
    const job: OCRBatchJob = {
      id: jobId,
      fileIds,
      totalFiles: fileIds.length,
      processedFiles: 0,
      results: new Map(),
      status: 'processing',
    };

    this.batchJobs.set(jobId, job);

    // Process files sequentially
    for (let i = 0; i < fileIds.length; i++) {
      try {
        const result = await this.processFile(fileIds[i], files[i]);
        job.results.set(fileIds[i], result);
        job.processedFiles++;
      } catch (err) {
        logger.error(`Batch OCR failed at file ${i}`, err);
        job.error = String(err);
      }
    }

    job.status = job.error ? 'failed' : 'completed';
    return jobId;
  }

  /**
   * Get batch job status
   */
  static getBatchStatus(jobId: string): OCRBatchJob | undefined {
    return this.batchJobs.get(jobId);
  }

  /**
   * Get all files requiring human review
   */
  static getFilesRequiringReview(jobId: string): Array<{
    fileId: string;
    result: OCRResult;
  }> {
    const job = this.batchJobs.get(jobId);
    if (!job) return [];

    const reviewFiles: Array<{ fileId: string; result: OCRResult }> = [];
    job.results.forEach((result, fileId) => {
      if (result.requiresReview) {
        reviewFiles.push({ fileId, result });
      }
    });

    return reviewFiles;
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    OCR_CACHE.clear();
    logger.info('OCR cache cleared');
  }

  /**
   * Get cache statistics
   */
  static getCacheStats() {
    return {
      cacheSize: OCR_CACHE.size,
      batchJobs: this.batchJobs.size,
    };
  }
}

export const ocrEnhancedService = OCREnhancedService;
