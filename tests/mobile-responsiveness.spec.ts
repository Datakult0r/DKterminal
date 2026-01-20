import { test, expect } from '@playwright/test';

test.describe('DKprofile Mobile Responsiveness', () => {
  test('should work on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174');
    
    // Check if elements are visible and properly sized
    const powerButton = page.locator('#changePageButton');
    const terminalContainer = page.locator('#terminal-container');
    
    await expect(powerButton).toBeVisible();
    
    // Click power button
    await powerButton.click();
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Check if terminal content is readable on mobile
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toBeVisible();
    await expect(terminalOutput).toContainText('Starting MS-DOS');
  });

  test('should work on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    const terminalContainer = page.locator('#terminal-container');
    
    await expect(powerButton).toBeVisible();
    await powerButton.click();
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Test navigation on tablet
    await page.waitForTimeout(8000); // Wait for initial animation
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    // Check for menu options after returning
    await page.keyboard.press('Escape');
    await page.waitForTimeout(5000);
    
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toContainText('1. ABOUT', { timeout: 20000 });
  });

  test('should handle touch interactions', async ({ browser }) => {
    // Create context with touch support
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 },
      hasTouch: true,
      isMobile: true
    });
    
    const page = await context.newPage();
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    
    // Test touch tap
    await powerButton.tap();
    
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    await context.close();
  });
});
