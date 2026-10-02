import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

const endpoint = process.env.ATLAS_CDP;
if (!endpoint) throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const base = process.env.ATLAS_URL || 'http://127.0.0.1:4321/ios/';
const out = process.env.ATLAS_QA_DIR || 'test-results/status';
mkdirSync(out, {recursive: true});
const source = JSON.parse(readFileSync('src/data/capabilities.json', 'utf8')).domains.flatMap(d => d.features);
const domains = ['Foundations', 'Machine', 'Storage', 'Graphics', 'Interaction', 'Method'];
const inputNames = ['Touch input', 'Multitouch & pinch-zoom', 'Physical buttons'];
const areas = {
  input: inputNames,
  camera: ['Live viewfinder', 'Photo capture & save', 'Full-resolution stills'],
  power: ['Battery status', 'Charge budget', 'Sleep / suspend'],
  display: ['Backlight fade & blanking', 'Screenshots'],
  connections: ['Audio output', 'Networking / Wi-Fi', 'Telephony'],
};
const browser = await chromium.connectOverCDP(endpoint);
const context = await browser.newContext({viewport: {width: 1440, height: 1080}, reducedMotion: 'reduce'});
const page = await context.newPage();
const errors = [], audits = [], layouts = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
const visible = () => page.locator('[data-capability]:visible');
const names = () => visible().locator('h4').allTextContents();
async function go(path = 'status/') {
  await page.goto(base + path);
  await page.bringToFront();
  await page.evaluate(() => document.fonts.ready);
}
async function audit(name) {
  const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  audits.push({name, violations: result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary}))}))});
  console.log(`Accessibility: ${name}, ${result.violations.length} violations`);
}
try {
  await go('status/#interaction');
  await expect(visible()).toHaveCount(3);
  expect(await names()).toEqual(inputNames);
  await expect(page.locator('[data-area-summary]')).toHaveText('3 of 14 shown');
  const compactHeight = await page.locator('.capability-panel').evaluate(el => el.clientHeight);
  for (const [area, expected] of Object.entries(areas)) {
    await page.locator(`[data-cap-area="${area}"]`).click();
    expect(await names()).toEqual(expected);
    expect(new URL(page.url()).hash).toBe('#interaction/' + area);
    await expect(page.locator('[data-scope-permalink]')).toHaveAttribute('href', new RegExp(`/ios/status/#interaction/${area}$`));
  }
  await page.locator('[data-cap-area="all"]').click();
  await expect(visible()).toHaveCount(14);
  expect(await names()).toEqual(source.filter(f => f.layers.includes('Interaction')).map(f => f.feature));
  const fullHeight = await page.locator('.capability-panel').evaluate(el => el.clientHeight);
  expect(compactHeight).toBeLessThan(fullHeight / 2);
  console.log(`Interaction panel: ${compactHeight}px grouped versus ${fullHeight}px in the optional All view.`);

  // Native browser navigation must reconstruct the same domain and subgroup.
  await page.locator('[data-cap-area="camera"]').click();
  await page.locator('[data-cap-area="power"]').click();
  await page.goBack();
  await expect(page.locator('[data-cap-area="camera"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await names()).toEqual(areas.camera);
  await page.goForward();
  await expect(page.locator('[data-cap-area="power"]')).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.locator('[data-cap-area="power"]')).toHaveAttribute('aria-pressed', 'true');
  expect(await names()).toEqual(areas.power);
  await go('status/#interaction/camera');
  expect(await names()).toEqual(areas.camera);
  await audit('camera-direct-link');
  await page.locator('[data-expand-scores]').click();
  await expect(visible().locator('details[open]')).toHaveCount(3);
  await page.locator('[data-cap-area="input"]').focus();
  await page.keyboard.press('Space');
  expect(await names()).toEqual(inputNames);

  for (const [index, domain] of domains.entries()) {
    await page.locator(`[data-layer-tab="${index}"]`).click();
    expect(new URL(page.url()).hash).toBe('#' + domain.toLowerCase());
    expect(await names()).toEqual(domain === 'Interaction' ? inputNames : source.filter(f => f.layers.includes(domain)).map(f => f.feature));
  }
  await page.locator('[data-layer-tab="5"]').press('Home');
  await expect(page.locator('[data-layer-tab="0"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-layer-tab="1"]')).toBeFocused();
  await expect(page.locator('[data-layer-tab="1"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-show-all]').click();
  await expect(visible()).toHaveCount(22);
  expect(new Set(await names()).size).toBe(22);
  await page.locator('[data-expand-scores]').click();
  await expect(page.locator('[data-capability] details[open]')).toHaveCount(22);
  await audit('all-expanded');

  for (const [index, tier] of ['context', 'hardware', 'kernel', 'services', 'apps'].entries()) {
    await go('status/#layer-' + tier);
    await expect(page.locator('[data-layerplate]')).toHaveAttribute('data-domain', domains[index]);
    await expect(page.locator(`[data-tier="${tier}"]`)).toHaveAttribute('href', '/ios/status/#layer-' + tier);
  }
  await go('status/#method');
  await expect(page.locator('[data-layer-tab="5"]')).toHaveAttribute('aria-pressed', 'true');
  await go('status/#feature-matrix');
  await expect(visible()).toHaveCount(22);
  await go('status/#interaction');

  for (const appearance of ['light', 'dark']) {
    await page.locator('select[data-appearance]').selectOption(appearance);
    const colors = await page.locator('[data-layerplate]').evaluate(el => [...el.querySelectorAll('[data-layer]')].map(layer => {
      const tab = el.querySelector(`[data-layer-tab="${layer.dataset.layer}"]`);
      const color = getComputedStyle(layer).getPropertyValue(layer.hasAttribute('data-tier') ? '--tint' : '--domain').trim();
      return {color, tab: getComputedStyle(tab).getPropertyValue('--domain').trim()};
    }));
    for (const color of colors) expect(color.color).toBe(color.tab);
    await audit('interaction-' + appearance);
    await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'}));
    await page.screenshot({path: `${out}/interaction-${appearance}.png`, fullPage: true});
  }
  await page.locator('select[data-appearance]').selectOption('light');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({width, height: 1000});
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`).toBe(true);
    const layout = await page.locator('[data-layerplate]').evaluate(el => {
      const head = el.querySelector('.plate-head').getBoundingClientRect();
      const scene = el.querySelector('.layer-scene').getBoundingClientRect();
      const tabs = el.querySelector('.layer-tabs').getBoundingClientRect();
      const boxes = [...el.querySelectorAll('.layer,.layer-face')].map(node => node.getBoundingClientRect());
      const callouts = [...el.querySelectorAll('.face-label')].map(node => node.getBoundingClientRect()).sort((a,b) => a.top-b.top);
      const panel = el.querySelector('.capability-panel');
      return {left: Math.min(...boxes.map(b => b.left))-scene.left, right: Math.max(...boxes.map(b => b.right))-scene.right, topClearance: Math.min(...boxes.map(b => b.top))-head.bottom, bottomClearance: tabs.top-Math.max(...boxes.map(b => b.bottom)), labelsOverlap: callouts.some((b,i) => i > 0 && callouts[i-1].bottom >= b.top), panelOverflow: getComputedStyle(panel).overflowY, innerOverflow: panel.scrollHeight-panel.clientHeight};
    });
    expect(layout.left).toBeGreaterThanOrEqual(-1); expect(layout.right).toBeLessThanOrEqual(1);
    expect(layout.topClearance).toBeGreaterThan(0); expect(layout.bottomClearance).toBeGreaterThan(0);
    expect(layout.labelsOverlap).toBe(false); expect(layout.panelOverflow).toBe('visible'); expect(layout.innerOverflow).toBeLessThanOrEqual(1);
    layouts.push({width, ...layout});
    if (width === 320) await audit('interaction-320');
    if (width === 390) { await page.evaluate(() => scrollTo({top: 0, behavior: 'instant'})); await page.screenshot({path: `${out}/interaction-mobile.png`, fullPage: true}); }
  }
  await page.emulateMedia({media: 'print'});
  await expect(visible()).toHaveCount(22);
  await page.emulateMedia({media: 'screen', reducedMotion: 'no-preference'});
  await page.locator('[data-layer-motion]').click();
  await expect(page.locator('[data-layerplate]')).toHaveAttribute('data-motion-paused', '');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await expect(page.locator('[data-layer-motion]')).toBeDisabled();
  expect(await page.locator('[data-layerplate]').evaluate(el => el.getAnimations({subtree: true}).filter(a => a.playState === 'running').length)).toBe(0);

  // The actual diagram links work from the homepage as well as from status.
  await go('');
  await page.locator('[data-tier="kernel"] .face-label strong').click();
  await expect(page).toHaveURL(base + 'status/#layer-kernel');
  await expect(page.locator('[data-layer-tab="2"]')).toHaveAttribute('aria-pressed', 'true');
  const staticContext = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base + 'status/');
  await expect(staticPage.locator('[data-capability]:visible')).toHaveCount(22);
  await staticContext.close();
  expect(errors).toEqual([]); expect(audits.flatMap(a => a.violations)).toEqual([]);
  writeFileSync(`${out}/results.json`, JSON.stringify({errors, audits, layouts, compactHeight, fullHeight, uniqueCapabilities: 22, interactions: 'area groups, direct URLs, Back/Forward, reload, diagram anchors, shared colors, keyboard, print, no-JS, reduced motion'}, null, 2));
  console.log(JSON.stringify({result: 'passed', audits: audits.length, layouts: layouts.length, errors}));
} finally {
  await context.close();
  await browser.close();
}
