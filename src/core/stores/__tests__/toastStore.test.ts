/**
 * Tests for toastStore
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { toastStore } from '../toastStore';
import type { ToastState } from '../toastStore';

describe('toastStore', () => {
  let state: { toasts: any[] } | null = null;

  beforeEach(() => {
    state = null;
    toastStore.subscribe((s) => {
      state = s;
    })();
    toastStore.clear();
    vi.clearAllTimers();
  });

  it('should initialize with empty toasts', () => {
    expect(state?.toasts).toEqual([]);
  });

  it('should show success toast', () => {
    toastStore.show('Success!', 'success');
    expect(state?.toasts).toHaveLength(1);
    expect(state?.toasts[0].message).toBe('Success!');
    expect(state?.toasts[0].type).toBe('success');
  });

  it('should show error toast with longer default duration', () => {
    toastStore.show('Error!', 'error', 5000);
    expect(state?.toasts).toHaveLength(1);
    expect(state?.toasts[0].type).toBe('error');
    expect(state?.toasts[0].duration).toBe(5000);
  });

  it('should create multiple toasts', () => {
    toastStore.show('Toast 1', 'success');
    toastStore.show('Toast 2', 'info');
    toastStore.show('Toast 3', 'error');

    expect(state?.toasts).toHaveLength(3);
  });

  it('should dismiss specific toast by id', () => {
    const id = toastStore.show('Test', 'info', 0);
    expect(state?.toasts).toHaveLength(1);

    toastStore.dismiss(id);
    expect(state?.toasts).toHaveLength(0);
  });

  it('should clear all toasts', () => {
    toastStore.show('Toast 1', 'success');
    toastStore.show('Toast 2', 'info');
    expect(state?.toasts).toHaveLength(2);

    toastStore.clear();
    expect(state?.toasts).toHaveLength(0);
  });

  it('should auto-dismiss toast after duration', async () => {
    vi.useFakeTimers();
    const duration = 3000;
    toastStore.show('Auto dismiss', 'info', duration);
    expect(state?.toasts).toHaveLength(1);

    vi.advanceTimersByTime(duration);
    expect(state?.toasts).toHaveLength(0);

    vi.useRealTimers();
  });

  it('should not auto-dismiss when duration is 0', async () => {
    const id = toastStore.show('No dismiss', 'info', 0);
    expect(state?.toasts).toHaveLength(1);

    // Even after a long time, it shouldn't dismiss
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(state?.toasts).toHaveLength(1);

    toastStore.dismiss(id);
  });
});
