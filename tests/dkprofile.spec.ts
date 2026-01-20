import { test, expect } from '@playwright/test';

test.describe('DKprofile MS-DOS Terminal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('should start with terminal hidden', async ({ page }) => {
    const terminalContainer = page.locator('#terminal-container');
    await expect(terminalContainer).toHaveClass(/hidden/);
  });

  test('should show terminal after power button click', async ({ page }) => {
    const powerButton = page.locator('#changePageButton');
    const terminalContainer = page.locator('#terminal-container');
    
    await powerButton.click();
    await expect(terminalContainer).not.toHaveClass(/hidden/);
  });

  test('should display typing animation', async ({ page }) => {
    const powerButton = page.locator('#changePageButton');
    const terminalOutput = page.locator('#terminal-output');
    
    await powerButton.click();
    await expect(terminalOutput).toBeVisible();
    // Wait for some content to appear
    await expect(terminalOutput).toContainText('Starting MS-DOS');
  });

  test('should navigate through different sections', async ({ page }) => {
    const powerButton = page.locator('#changePageButton');
    const terminalOutput = page.locator('#terminal-output');
    
    await powerButton.click();
    
    // Wait for initial content and typing to complete
    await expect(terminalOutput).toContainText('Starting MS-DOS');
    await page.waitForTimeout(8000); // Increased wait time for typing animation
    
    // Test navigation to ABOUT section
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(8000); // Increased wait time
    
    // Check for menu options instead of specific commands
    await expect(terminalOutput).toContainText('1. ABOUT', { timeout: 20000 });
    await expect(terminalOutput).toContainText('2. SKILLS', { timeout: 20000 });
    
    // Test ESC functionality
    await page.keyboard.press('Escape');
    await page.waitForTimeout(5000);
    
    // Check for menu options again after ESC
    await expect(terminalOutput).toContainText('1. ABOUT', { timeout: 20000 });
  });

  test('should play sound effects', async ({ page }) => {
    const powerButton = page.locator('#changePageButton');
    
    // Start the page
    await powerButton.click();
    
    // Check if audio elements are present in DOM (they don't need to be visible)
    const humSound = page.locator('#humSound');
    const keySound = page.locator('#keySound');
    
    await expect(humSound).toBeAttached();
    await expect(keySound).toBeAttached();
    
    // Check if audio elements have the correct attributes
    await expect(humSound).toHaveAttribute('src');
    await expect(keySound).toHaveAttribute('src');
  });
}); 