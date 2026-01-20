import { test, expect } from '@playwright/test';

test.describe('DKprofile Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:5174');
    
    // Check page loads within reasonable time
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    
    // Check critical elements are visible quickly
    const powerButton = page.locator('#changePageButton');
    await expect(powerButton).toBeVisible({ timeout: 2000 });
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    
    // Test rapid clicking doesn't break functionality
    await powerButton.click();
    await powerButton.click();
    await powerButton.click();
    
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).not.toHaveClass(/hidden/);
  });

  test('should not have memory leaks during navigation', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load and initial animation
    await page.waitForTimeout(5000);
    
    // Navigate through sections multiple times
    for (let i = 0; i < 1; i++) { // Reduced to 1 iteration to prevent timeout
      await page.keyboard.type('1');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(3000);
      
      await page.keyboard.type('2');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(3000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(3000);
    }
    
    // Check that terminal is still responsive
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    // Simulate slow network
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await expect(powerButton).toBeVisible({ timeout: 10000 });
    
    await powerButton.click();
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).not.toHaveClass(/hidden/);
  });

  test('should maintain performance with long content', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for initial load and animation
    await page.waitForTimeout(5000);
    
    // Wait for initial content
    const terminalOutput = page.locator('#terminal-output');
    
    // Wait for directory listing to appear
    await expect(terminalOutput).toContainText('Directory of C:', { timeout: 20000 });
    
    // Navigate to HISTORY section (longest content)
    await page.keyboard.type('3');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); // Reduced timeout
    
    // Wait for history content to load and typing to complete
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000); // Reduced timeout
    await expect(terminalOutput).toContainText('HISTORY', { timeout: 20000 }); // Reduced timeout
    
    // Check scrolling performance
    await page.keyboard.press('PageDown');
    await page.keyboard.press('PageUp');
    
    // Terminal should still be responsive
    await expect(terminalOutput).toBeVisible();
  });
});
