import { createWorker, type Worker, type RecognizeResult } from 'tesseract.js';
import type { OCRResult, OCRLine, OCRConfidenceStats } from './types';

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
    result.data.lines.forEach((line, lineIndex) => {
      const wordConfidences: number[] = [];
      const alternatives: string[] = [];
      
      if (line.words) {
        line.words.forEach((word) => {
          wordConfidences.push(word.confidence);
          if (word.alternatives && word.alternatives.length > 0) {
            alternatives.push(...word.alternatives);
          }
        });
      }
      
      lines.push({
        id: `line-${lineIndex}`,
        text: line.text.trim(),
        confidence: line.confidence,
        wordConfidences: wordConfidences.length > 0 ? wordConfidences : undefined,
        alternatives: alternatives.length > 0 ? [...new Set(alternatives)] : undefined,
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
  if (confidence >= 85) return '#10b981';
  if (confidence >= 60) return '#f59e0b';
  return '#ef4444';
}

export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 85) return 'Sehr hoch';
  if (confidence >= 60) return 'Mittel';
  return 'Niedrig';
}

export function getConfidenceClass(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 85) return 'high';
  if (confidence >= 60) return 'medium';
  return 'low';
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

export function calculateConfidenceStats(lines: OCRLine[]): OCRConfidenceStats {
  if (lines.length === 0) {
    return {
      averageConfidence: 0,
      minConfidence: 0,
      maxConfidence: 0,
      highConfidenceCount: 0,
      mediumConfidenceCount: 0,
      lowConfidenceCount: 0,
      criticalCount: 0
    };
  }

  const confidences = lines.map(l => l.confidence);
  const averageConfidence = Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length);
  const minConfidence = Math.min(...confidences);
  const maxConfidence = Math.max(...confidences);

  const highConfidenceCount = lines.filter(l => l.confidence >= 85).length;
  const mediumConfidenceCount = lines.filter(l => l.confidence >= 60 && l.confidence < 85).length;
  const lowConfidenceCount = lines.filter(l => l.confidence < 60).length;
  const criticalCount = lines.filter(l => l.confidence < 60 && !l.verified).length;

  return {
    averageConfidence,
    minConfidence,
    maxConfidence,
    highConfidenceCount,
    mediumConfidenceCount,
    lowConfidenceCount,
    criticalCount
  };
}

export function getVerifiedText(lines: OCRLine[]): string {
  return lines
    .map(line => line.correctedText || line.text)
    .join('\n');
}

export function getConfidenceHistogramData(lines: OCRLine[]): { value: number; count: number }[] {
  const buckets = [
    { value: 0, count: 0 },
    { value: 10, count: 0 },
    { value: 20, count: 0 },
    { value: 30, count: 0 },
    { value: 40, count: 0 },
    { value: 50, count: 0 },
    { value: 60, count: 0 },
    { value: 70, count: 0 },
    { value: 80, count: 0 },
    { value: 90, count: 0 },
    { value: 100, count: 0 }
  ];

  lines.forEach(line => {
    const bucketIndex = Math.min(Math.floor(line.confidence / 10), 10);
    buckets[bucketIndex].count++;
  });

  return buckets;
}

export function applyQuickFix(text: string, fixType: string): string {
  const fixes: Record<string, [string, string][]> = {
    'common-ocr': [
      ['l', 'I'],
      ['I', 'l'],
      ['O', '0'],
      ['0', 'O'],
      ['rn', 'm'],
      ['m', 'rn'],
      ['vv', 'w'],
      ['w', 'vv'],
      ['uU', '00'],
      ['00', 'uU'],
      ['ci', 'el'],
      ['el', 'ci'],
      ['1I', 'Il'],
      ['Il', '1I']
    ],
    'letter-number': [
      ['l', 'I'],
      ['I', 'l'],
      ['O', '0'],
      ['0', 'O'],
      ['S', '5'],
      ['5', 'S'],
      ['Z', '2'],
      ['2', 'Z'],
      ['B', '8'],
      ['8', 'B']
    ],
    'special-chars': [
      ['„', '"'],
      ['"', '"'],
      ["'", "'"],
      ["'", "'"],
      ['–', '-'],
      ['‑', '-'],
      ['…', '...'],
      ['©', '(c)']
    ]
  };

  const selectedFixes = fixes[fixType] || fixes['common-ocr'];
  let result = text;
  
  selectedFixes.forEach(([from, to]) => {
    const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, to);
  });

  return result;
}

export function getNextLowConfidenceLine(lines: OCRLine[], currentIndex: number): number | null {
  for (let i = currentIndex + 1; i < lines.length; i++) {
    if (lines[i].confidence < 85 && !lines[i].verified) {
      return i;
    }
  }
  for (let i = 0; i <= currentIndex; i++) {
    if (lines[i].confidence < 85 && !lines[i].verified) {
      return i;
    }
  }
  return null;
}

export function verifyAllLowConfidenceWithSummary(lines: OCRLine[]): {
  lines: OCRLine[];
  summary: { total: number; autoVerified: number; requiresReview: number };
} {
  const autoVerified = lines.filter(l => l.confidence >= 85 && !l.verified).length;
  const requiresReview = lines.filter(l => l.confidence < 85 && !l.verified).length;

  const updatedLines = lines.map(line => {
    if (line.confidence >= 85 && !line.verified) {
      return { ...line, verified: true };
    }
    return line;
  });

  return {
    lines: updatedLines,
    summary: {
      total: lines.length,
      autoVerified,
      requiresReview
    }
  };
}
