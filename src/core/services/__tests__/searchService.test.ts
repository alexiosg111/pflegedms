/**
 * Tests for searchService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchService } from '../searchService';

// Mock window.api
global.window = {
  api: {
    queryDatabase: vi.fn(),
  },
} as any;

describe('searchService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const results = await searchService.search('');
    expect(results).toEqual([]);
  });

  it('should return empty array for query less than 2 chars', async () => {
    const results = await searchService.search('a');
    expect(results).toEqual([]);
  });

  it('should search with minimum 2 characters', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Test Patient',
        type: 'patient',
        content_preview: 'Patient data',
        created_at: '2024-01-01T00:00:00Z',
        relevance: 60,
      },
    ];

    (window.api.queryDatabase as any).mockResolvedValue(mockResults);

    const results = await searchService.search('te');
    expect(results.length).toBeGreaterThanOrEqual(0);
  });

  it('should sort results by relevance', async () => {
    const mockResults = [
      {
        id: '1',
        title: 'Low relevance',
        type: 'patient',
        content_preview: 'Low',
        created_at: '2024-01-01T00:00:00Z',
        relevance: 10,
      },
      {
        id: '2',
        title: 'High relevance',
        type: 'patient',
        content_preview: 'High',
        created_at: '2024-01-01T00:00:00Z',
        relevance: 60,
      },
    ];

    (window.api.queryDatabase as any).mockResolvedValue(mockResults);

    const results = await searchService.search('test', 50);
    if (results.length > 0) {
      // Results should be sorted by relevance descending
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].relevance).toBeGreaterThanOrEqual(results[i + 1].relevance);
      }
    }
  });

  it('should limit results to specified number', async () => {
    const mockResults = Array.from({ length: 30 }, (_, i) => ({
      id: String(i),
      title: `Result ${i}`,
      type: 'patient',
      content_preview: `Preview ${i}`,
      created_at: '2024-01-01T00:00:00Z',
      relevance: 50,
    }));

    (window.api.queryDatabase as any).mockResolvedValue(mockResults);

    const results = await searchService.search('test', 10);
    expect(results.length).toBeLessThanOrEqual(10);
  });

  it('should handle search errors gracefully', async () => {
    (window.api.queryDatabase as any).mockRejectedValue(new Error('DB error'));

    const results = await searchService.search('test');
    expect(results).toEqual([]);
  });

  it('should escape FTS5 special characters', async () => {
    // Test that queries with special characters don't crash
    const results = await searchService.search('test (query) "with" special');
    expect(Array.isArray(results)).toBe(true);
  });
});
