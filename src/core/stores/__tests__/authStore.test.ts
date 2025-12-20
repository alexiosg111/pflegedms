/**
 * Tests for authStore
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { authStore } from '../authStore';
import type { AuthState } from '../authStore';

describe('authStore', () => {
  let state: AuthState | null = null;

  beforeEach(() => {
    state = null;
    authStore.subscribe((s) => {
      state = s;
    })();
  });

  it('should initialize with unauthenticated state', () => {
    expect(state).toEqual({
      isAuthenticated: false,
    });
  });

  it('should login successfully', () => {
    authStore.login('testuser');
    expect(state?.isAuthenticated).toBe(true);
    expect(state?.username).toBe('testuser');
    expect(state?.loginTime).toBeInstanceOf(Date);
    expect(state?.sessionExpiry).toBeInstanceOf(Date);
  });

  it('should set default username if not provided', () => {
    authStore.login();
    expect(state?.username).toBe('Administrator');
  });

  it('should logout successfully', () => {
    authStore.login('testuser');
    expect(state?.isAuthenticated).toBe(true);

    authStore.logout();
    expect(state?.isAuthenticated).toBe(false);
  });

  it('should reset to initial state', () => {
    authStore.login('testuser');
    authStore.reset();
    expect(state?.isAuthenticated).toBe(false);
  });

  it('should maintain session expiry 8 hours after login', () => {
    const beforeLogin = Date.now();
    authStore.login('testuser');
    const afterLogin = Date.now();

    const expectedMin = beforeLogin + 8 * 60 * 60 * 1000;
    const expectedMax = afterLogin + 8 * 60 * 60 * 1000;

    expect(state?.sessionExpiry?.getTime()).toBeGreaterThanOrEqual(expectedMin);
    expect(state?.sessionExpiry?.getTime()).toBeLessThanOrEqual(expectedMax);
  });
});
