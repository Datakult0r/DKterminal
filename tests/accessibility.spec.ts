import { test, expect } from '@playwright/test';

test.describe('DKprofile Accessibility', () => {
  test('should have proper ARIA labels and roles', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Check power button has proper aria-label
    const powerButton = page.locator('#changePageButton');
    await expect(powerButton).toHaveAttribute('aria-label', 'Power Button');
    
    // Check page has proper title
    await expect(page).toHaveTitle(/Philippe Kung - MS-DOS Terminal/);
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Test Tab navigation to power button
    await page.keyboard.press('Tab');
    const powerButton = page.locator('#changePageButton');
    await expect(powerButton).toBeFocused();
    
    // Test Enter key activation
    await page.keyboard.press('Enter');
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).not.toHaveClass(/hidden/);
    
    // Test keyboard navigation in terminal
    await page.waitForTimeout(8000); // Wait for initial animation
    
    // Check for menu options instead of prompt
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toContainText('LIST', { timeout: 20000 });
    
    // Navigate to ABOUT section
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    // Return to main menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(5000);
    
    // Check for menu options again after ESC
    await expect(terminalOutput).toContainText('LIST', { timeout: 20000 });
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Check terminal text has good contrast
    const terminalOutput = page.locator('#terminal-output');
    await expect(terminalOutput).toHaveCSS('color', 'rgb(0, 255, 0)'); // Green text
    await expect(terminalOutput).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)'); // Transparent background
  });

  test('should work without JavaScript (graceful degradation)', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      delete (window as any).addEventListener;
    });
    
    await page.goto('http://localhost:5174');
    
    // Page should still load basic structure
    const powerButton = page.locator('#changePageButton');
    await expect(powerButton).toBeVisible();
  });
});
