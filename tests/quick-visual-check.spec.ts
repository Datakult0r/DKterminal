import { test } from '@playwright/test';

test('quick visual check', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Screenshot before power on
  await page.screenshot({ path: 'test-results/off-state.png' });

  // Click power button
  await page.click('#changePageButton');

  // Wait for typing animation
  await page.waitForTimeout(4000);

  // Screenshot after power on
  await page.screenshot({ path: 'test-results/on-state.png' });

  // Log element positions
  const positions = await page.evaluate(() => {
    const bezel = document.getElementById('monitor-bezel');
    const screen = document.querySelector('.screen-area');
    const terminal = document.getElementById('terminal-container');
    const output = document.getElementById('terminal-output');

    return {
      bezel: bezel?.getBoundingClientRect(),
      screen: screen?.getBoundingClientRect(),
      terminal: terminal?.getBoundingClientRect(),
      output: output?.getBoundingClientRect(),
      outputScroll: output ? { scrollHeight: output.scrollHeight, clientHeight: output.clientHeight } : null
    };
  });

  console.log('Element Positions:', JSON.stringify(positions, null, 2));
});
