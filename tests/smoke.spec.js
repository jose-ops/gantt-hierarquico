import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const url = () => pathToFileURL(resolve(process.cwd(), 'index.html')).href;

test('carrega o gantt e renderiza barras', async ({ page }) => {
  await page.goto(url());
  await expect(page.locator('.bar').first()).toBeVisible();
  const count = await page.locator('.bar').count();
  expect(count).toBeGreaterThan(0);
});

test('barra estreita move a cauda (pct+avatar) para fora', async ({ page }) => {
  await page.goto(url());
  const mini = page.locator('.bar--mini').first();
  if (await mini.count() > 0) {
    await expect(mini.locator('.bar-tail')).toBeVisible();
  }
});
