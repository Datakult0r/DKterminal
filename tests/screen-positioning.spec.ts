import { test, expect } from '@playwright/test';

test.describe('Screen Positioning Debug', () => {
  test('capture screen positioning for analysis', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);

    // Take initial screenshot
    await page.screenshot({ path: 'test-results/01-initial.png', fullPage: true });

    // Click power and wait for animation
    const powerButton = page.locator('#changePageButton');
    await powerButton.click();

    // Wait for typing to complete
    await page.waitForTimeout(5000);

    // Take screenshot of terminal state
    await page.screenshot({ path: 'test-results/02-terminal-active.png', fullPage: true });

    // Get element positions for debugging
    const screenArea = await page.locator('.screen-area').boundingBox();
    const terminalOutput = await page.locator('#terminal-output').boundingBox();
    const monitorBezel = await page.locator('#monitor-bezel').boundingBox();

    console.log('Monitor Bezel:', monitorBezel);
    console.log('Screen Area:', screenArea);
    console.log('Terminal Output:', terminalOutput);

    // Verify screen area is within monitor bezel
    if (monitorBezel && screenArea) {
      const screenTopPercent = ((screenArea.y - monitorBezel.y) / monitorBezel.height) * 100;
      const screenLeftPercent = ((screenArea.x - monitorBezel.x) / monitorBezel.width) * 100;
      const screenWidthPercent = (screenArea.width / monitorBezel.width) * 100;
      const screenHeightPercent = (screenArea.height / monitorBezel.height) * 100;

      console.log('Screen Position (relative to bezel):');
      console.log(`  Top: ${screenTopPercent.toFixed(2)}%`);
      console.log(`  Left: ${screenLeftPercent.toFixed(2)}%`);
      console.log(`  Width: ${screenWidthPercent.toFixed(2)}%`);
      console.log(`  Height: ${screenHeightPercent.toFixed(2)}%`);
    }

    // Navigate to a content page to test scrolling
    await page.keyboard.press('1');
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'test-results/03-about-section.png', fullPage: true });

    // Check if terminal output overflows
    const overflowCheck = await page.evaluate(() => {
      const output = document.getElementById('terminal-output');
      if (output) {
        return {
          scrollHeight: output.scrollHeight,
          clientHeight: output.clientHeight,
          isOverflowing: output.scrollHeight > output.clientHeight
        };
      }
      return null;
    });
    console.log('Overflow Check:', overflowCheck);
  });

  test('verify text stays within screen bounds', async ({ page }) => {
    await page.goto('http://localhost:5174');
    await page.waitForLoadState('networkidle');

    const powerButton = page.locator('#changePageButton');
    await powerButton.click();
    await page.waitForTimeout(5000);

    // Get bounding boxes
    const screenArea = await page.locator('.screen-area').boundingBox();
    const terminalContainer = await page.locator('#terminal-container').boundingBox();

    // Verify terminal container is within screen area
    if (screenArea && terminalContainer) {
      expect(terminalContainer.y).toBeGreaterThanOrEqual(screenArea.y);
      expect(terminalContainer.x).toBeGreaterThanOrEqual(screenArea.x);
      expect(terminalContainer.y + terminalContainer.height).toBeLessThanOrEqual(screenArea.y + screenArea.height);
      expect(terminalContainer.x + terminalContainer.width).toBeLessThanOrEqual(screenArea.x + screenArea.width);
    }
  });
});
