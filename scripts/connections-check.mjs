import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const endpoint=process.env.ATLAS_CDP;if(!endpoint)throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const browser=await chromium.connectOverCDP(endpoint),page=await browser.contexts()[0].newPage();
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/',errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(base+'articles/cpu-compatibility/');await page.bringToFront();await page.locator('html[data-enhanced]').waitFor();
 await page.locator('select[data-appearance]').selectOption('light');
 await page.locator('[data-neighborhood] .is-evidence[data-key="E06"]').click();
 const card=page.locator('.article-prose .evidence-peek[data-evidence="E06"].is-open').first();
 await expect(card.locator('.peek-expand')).toHaveAttribute('aria-expanded','true');await expect(card.locator('.peek-panel')).toContainText('2fe25724');
 const tabs=card.getByRole('tab');await tabs.first().focus();await page.keyboard.press('ArrowRight');await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
 const desktop=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(desktop.violations.map(v=>v.id)).toEqual([]);
 await card.locator('.peek-zoom').click();await expect(page.locator('[data-return]')).toBeVisible();await page.locator('[data-return]').click();await expect(page.locator('h1')).toContainText('ARM compatibility');
 await page.setViewportSize({width:390,height:844});await page.locator('select[data-appearance]').selectOption('dark');await page.locator('.article-prose .evidence-peek').first().scrollIntoViewIfNeeded();await page.locator('[data-context-open]').click();await expect(page.locator('[data-context-rail]')).toHaveClass(/is-open/);
 const mobile=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(mobile.violations.map(v=>v.id)).toEqual([]);
 await page.keyboard.press('Escape');await expect(page.locator('[data-context-open]')).toHaveAttribute('aria-expanded','false');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.locator('select[data-appearance]').selectOption('system');expect(errors).toEqual([]);
 console.log('Evidence map expansion, keyboard exhibit tabs, return-to-chapter navigation, mobile sheet and accessibility passed.');
}finally{await page.close();await browser.close();}
