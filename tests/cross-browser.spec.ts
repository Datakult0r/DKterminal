import { test, expect, devices } from '@playwright/test';

test.describe('Cross-Browser Compatibility', () => {
  test('should work in different browsers', async ({ page, browserName }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    const terminalContainer = page.locator('#terminal-container');
    
    // Test basic functionality across browsers
    await expect(powerButton).toBeVisible();
    await powerButton.click();
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Test navigation works in all browsers
    await page.waitForTimeout(8000); // Increased wait for initial animation
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toContainText('1. ABOUT', { timeout: 20000 });
  });

  test('should handle different screen resolutions', async ({ page }) => {
    const resolutions = [
      { width: 1920, height: 1080 }, // Full HD
      { width: 1366, height: 768 },  // Common laptop
      { width: 1024, height: 768 },  // Tablet landscape
      { width: 320, height: 568 },   // Small mobile
    ];

    for (const resolution of resolutions) {
      await page.setViewportSize(resolution);
      await page.goto('http://localhost:5174');
      
      const powerButton = page.locator('#changePageButton');
      await expect(powerButton).toBeVisible();
      
      // Test that elements are still accessible at this resolution
      await powerButton.click();
      const terminalContainer = page.locator('#terminal-container');
      await expect(terminalContainer).not.toHaveClass(/hidden/);
    }
  });

  test('should handle network disconnection gracefully', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Start the application
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    await page.waitForTimeout(3000);
    
    // Simulate network failure
    await page.route('**/*', route => route.abort());
    
    // Application should still function with cached resources
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    const terminalOutput = page.locator('#terminal-output');
    // Should still show content since it's client-side
    await expect(terminalOutput).toBeVisible();
    await expect(terminalOutput).toContainText('1. ABOUT', { timeout: 20000 });
  });
});
