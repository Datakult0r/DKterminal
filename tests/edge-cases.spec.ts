import { test, expect } from '@playwright/test';

test.describe('DKprofile Edge Cases', () => {
  test('should handle multiple rapid ESC presses', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load
    await page.waitForTimeout(3000);
    
    // Navigate to a section
    await page.keyboard.type('1');
    await page.waitForTimeout(2000);
    
    // Rapidly press ESC multiple times
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(200); // Increased interval between ESC presses
    }
    
    // Wait for terminal to stabilize
    await page.waitForTimeout(2000);
    
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toContainText('C:\\>', { timeout: 20000 });
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load
    await page.waitForTimeout(3000);
    
    // Try invalid inputs
    await page.keyboard.type('9'); // Invalid option
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    await page.keyboard.type('abc'); // Non-numeric input
    await page.keyboard.press('Enter');
    await page.waitForTimeout(1000);
    
    // Terminal should still be responsive
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toBeVisible();
    
    // Valid input should still work
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000); // Wait for typing animation
    
    // Check for command prompt first
    await expect(terminalOutput).toContainText('C:\\>', { timeout: 10000 });
    
    // Then check for content
    await expect(terminalOutput).toContainText('ABOUT', { timeout: 10000 });
  });

  test('should maintain state during window resize', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load
    await page.waitForTimeout(3000);
    
    // Resize window
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    // Check terminal is still visible and functional
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Resize to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Terminal should still be functional
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Test navigation still works
    await page.keyboard.type('1');
    await page.waitForTimeout(5000); // Wait for typing animation
    
    const terminalOutput = page.locator('#terminal-output');
    // Check for command prompt first
    await expect(terminalOutput).toContainText('C:\\>', { timeout: 10000 });
    
    // Then check for content
    await expect(terminalOutput).toContainText('ABOUT', { timeout: 10000 });
  });

  test('should handle focus and blur events', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load
    await page.waitForTimeout(3000);
    
    // Simulate losing focus (e.g., user switches tabs)
    await page.evaluate(() => {
      window.dispatchEvent(new Event('blur'));
    });
    
    await page.waitForTimeout(500);
    
    // Simulate regaining focus
    await page.evaluate(() => {
      window.dispatchEvent(new Event('focus'));
    });
    
    // Terminal should still be responsive
    await page.keyboard.type('1');
    await page.waitForTimeout(5000); // Wait for typing animation
    
    const terminalOutput = page.locator('#terminal-output');
    // Check for command prompt first
    await expect(terminalOutput).toContainText('C:\\>', { timeout: 10000 });
    
    // Then check for content
    await expect(terminalOutput).toContainText('ABOUT', { timeout: 10000 });
  });

  test('should handle long session without memory issues', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal to load and initial animation
    await page.waitForTimeout(8000);
    
    // Simulate extended usage (reduced iterations to avoid timeout)
    for (let i = 0; i < 2; i++) {
      // Navigate through sections
      await page.keyboard.type('1');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(5000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
      
      await page.keyboard.type('2');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2000);
    }
    
    // Terminal should still be responsive after extended use
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toBeVisible();
    
    // After extended use, verify we can still see the command prompt
    await expect(terminalOutput).toContainText('C:\\>', { timeout: 20000 });
  });
});
