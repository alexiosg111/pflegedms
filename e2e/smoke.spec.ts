/**
 * E2E Smoke Tests for Pflegedienst Workspace
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Pflegedienst Workspace - Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('should load the login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Pflegedienst Workspace/);
    await expect(page.locator('text=Pflegedienst Workspace')).toBeVisible();
  });

  test('should display login form', async ({ page }) => {
    // Look for password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();

    // Look for submit button
    const submitButton = page.locator('button:has-text("Login")');
    await expect(submitButton).toBeVisible();
  });

  test('should login with master password', async ({ page }) => {
    // Enter password (assuming default test password)
    await page.locator('input[type="password"]').fill('testpassword123');

    // Click login button
    await page.locator('button:has-text("Login")').click();

    // Wait for dashboard to load
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Check if we're on the dashboard
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should display main layout after login', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Check sidebar
    await expect(page.locator('text=Pflegedienst')).toBeVisible();
    await expect(page.locator('text=Patientenakte')).toBeVisible();
    await expect(page.locator('text=Posteingang')).toBeVisible();
    await expect(page.locator('text=Verträge')).toBeVisible();
    await expect(page.locator('text=Rechnungen')).toBeVisible();
  });

  test('should open search dialog with Ctrl+K', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Press Ctrl+K
    await page.keyboard.press('Control+K');

    // Wait for search dialog
    const searchDialog = page.locator('text=Suche nach Patienten');
    await expect(searchDialog).toBeVisible({ timeout: 5000 });
  });

  test('should navigate between modules', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Click on Patientenakte
    await page.locator('text=Patientenakte').click();
    await page.waitForTimeout(500);

    // Check if we're on patients page
    await expect(page.locator('text=Patientenakte')).toBeVisible();

    // Click on Verträge
    await page.locator('text=Verträge').click();
    await page.waitForTimeout(500);

    // Check if we're on contracts page
    await expect(page.locator('text=Verträge')).toBeVisible();
  });

  test('should open settings dialog', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Click settings button
    await page.locator('button:has-text("Einstellungen")').click();

    // Wait for settings dialog
    const settingsDialog = page.locator('text=Einstellungen');
    await expect(settingsDialog).toBeVisible({ timeout: 5000 });
  });

  test('should display all modules in navigation', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Check all modules are visible
    const modules = [
      'Dashboard',
      'Patientenakte',
      'Posteingang',
      'Verträge',
      'Rechnungen',
      'Qualitätsmgmt.',
    ];

    for (const module of modules) {
      await expect(page.locator(`text=${module}`)).toBeVisible();
    }
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Click logout button
    await page.locator('button:has-text("Abmelden")').click();

    // Should be back on login page
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });
});

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Login
    await page.locator('input[type="password"]').fill('testpassword123');
    await page.locator('button:has-text("Login")').click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });
  });

  test('should search for patients', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);

    // Type search query
    const searchInput = page.locator('input[placeholder*="Suche nach"]');
    await searchInput.fill('test');

    // Wait for results
    await page.waitForTimeout(500);

    // Check if results are displayed
    const resultsList = page.locator('.divide-y');
    await expect(resultsList).toBeVisible({ timeout: 5000 });
  });

  test('should close search with Escape', async ({ page }) => {
    // Open search
    await page.keyboard.press('Control+K');
    await page.waitForTimeout(500);

    // Press Escape
    await page.keyboard.press('Escape');

    // Search dialog should be gone
    const searchDialog = page.locator('text=Suche nach');
    await expect(searchDialog).not.toBeVisible();
  });
});
