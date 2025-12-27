import { createWorker, type Worker, type RecognizeResult } from 'tesseract.js';
import type { OCRResult, OCRLine } from './types';

let worker: Worker | null = null;
let workerReady = false;

export async function initializeOCRWorker(language: string = 'deu+eng'): Promise<Worker> {
  if (worker && workerReady) {
    return worker;
  }

  worker = await createWorker(language, 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
      }
    }
  });
  
  workerReady = true;
  return worker;
}

export async function terminateOCRWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
    workerReady = false;
  }
}

export async function extractText(
  imageData: string | Blob | HTMLImageElement,
  language: string = 'deu+eng',
  onProgress?: (progress: number) => void
): Promise<OCRResult> {
  const startTime = Date.now();
  
  const ocrWorker = await initializeOCRWorker(language);
  
  const result: RecognizeResult = await ocrWorker.recognize(imageData, {
    rotateAuto: true,
  }, {
    text: true,
    blocks: true,
    hocr: false,
    tsv: false,
  });

  const lines: OCRLine[] = [];
  
  if (result.data.lines) {
    result.data.lines.forEach((line, index) => {
      lines.push({
        id: `line-${index}`,
        text: line.text,
        confidence: line.confidence,
        boundingBox: {
          x: line.bbox.x0,
          y: line.bbox.y0,
          width: line.bbox.x1 - line.bbox.x0,
          height: line.bbox.y1 - line.bbox.y0
        },
        verified: false
      });
    });
  }

  const processingTime = Date.now() - startTime;

  return {
    fullText: result.data.text,
    lines,
    language,
    processingTime
  };
}

export async function extractTextWithLines(
  imageData: string | Blob | HTMLImageElement,
  options: {
    language?: string;
    onProgress?: (progress: number) => void;
  } = {}
): Promise<OCRResult> {
  const { language = 'deu+eng', onProgress } = options;
  return extractText(imageData, language, onProgress);
}

export function getConfidenceColor(confidence: number): string {
  if (confidence >= 80) return '#10b981';
  if (confidence >= 60) return '#f59e0b';
  return '#ef4444';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 80) return 'Hoch';
  if (confidence >= 60) return 'Mittel';
  return 'Niedrig';
}

export function filterLowConfidenceLines(lines: OCRLine[], threshold: number = 80): OCRLine[] {
  return lines.filter(line => line.confidence < threshold);
}

export function filterUnverifiedLines(lines: OCRLine[]): OCRLine[] {
  return lines.filter(line => !line.verified);
}

export function autoVerifyHighConfidence(lines: OCRLine[], threshold: number = 85): OCRLine[] {
  return lines.map(line => {
    if (line.confidence >= threshold && !line.verified) {
      return { ...line, verified: true };
    }
    return line;
  });
}

export function calculateVerificationProgress(lines: OCRLine[]): {
  total: number;
  verified: number;
  percentage: number;
} {
  const total = lines.length;
  const verified = lines.filter(line => line.verified).length;
  const percentage = total > 0 ? Math.round((verified / total) * 100) : 0;
  
  return { total, verified, percentage };
}

export function getVerifiedText(lines: OCRLine[]): string {
  return lines
    .map(line => line.correctedText || line.text)
    .join('\n');
}
