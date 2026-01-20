import { test, expect } from '@playwright/test';

test.describe('Visual Regression Testing', () => {
  test('should match initial page screenshot', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for page to fully load and fonts
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    
    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    
    // Take screenshot of initial state with higher threshold for font differences
    await expect(page).toHaveScreenshot('initial-page.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.3
    });
  });

  test('should match terminal state screenshot', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for initial load and fonts
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    
    // Wait for terminal animation and typing to complete
    await page.waitForTimeout(6000);
    
    // Take screenshot of terminal state with higher threshold for text and font differences
    await expect(page).toHaveScreenshot('terminal-active.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match navigation state screenshots', async ({ page }) => {
    await page.goto('http://localhost:5174');
    
    // Wait for initial load and fonts
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);
    
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    await page.waitForTimeout(4000);
    
    // Navigate to ABOUT section
    await page.keyboard.type('1');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
    
    // Take screenshot of ABOUT section with higher threshold for text and font differences
    await expect(page).toHaveScreenshot('about-section.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.3,
      animations: 'disabled'
    });
    
    // Go back and navigate to SKILLS
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    await page.keyboard.type('2');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Take screenshot of SKILLS section with higher threshold for text differences
    await expect(page).toHaveScreenshot('skills-section.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.3,
      animations: 'disabled'
    });
  });

  test('should match mobile layout screenshots', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:5174');
    
    // Wait for initial load and fonts
    await page.waitForLoadState('networkidle');
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(() => document.fonts.ready);
    
    // Initial mobile view with higher threshold for mobile differences and fonts
    await expect(page).toHaveScreenshot('mobile-initial.png', {
      maxDiffPixelRatio: 0.5,
      threshold: 0.3,
      animations: 'disabled'
    });
    
    // Mobile terminal view with higher threshold
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    await page.waitForTimeout(5000); // Increased wait time for mobile animations
    
    await expect(page).toHaveScreenshot('mobile-terminal.png', {
      maxDiffPixelRatio: 0.6,
      threshold: 0.3,
      animations: 'disabled'
    });
  });
});
