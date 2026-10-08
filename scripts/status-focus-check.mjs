import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';

if (!process.env.ATLAS_CDP) throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const base = process.env.ATLAS_URL || 'http://127.0.0.1:4321/ios/';
const out = process.env.ATLAS_QA_DIR || 'test-results/status-focus';
mkdirSync(out, {recursive: true});
const source = JSON.parse(readFileSync('src/data/capabilities.json', 'utf8')).domains.flatMap(d => d.features);
const statuses = ['Working', 'Partial', 'Planned'];
const key = name => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const browser = await chromium.connectOverCDP(process.env.ATLAS_CDP);
const context = await browser.newContext({viewport: {width: 1440, height: 1080}, reducedMotion: 'reduce'});
const page = await context.newPage();
const errors = [], audits = [], layouts = [], checked = [];
page.on('pageerror', e => errors.push(e.message));
page.on('response', r => {if (r.url().startsWith(base) && r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);});
const plate = () => page.locator('.with-capabilities');
const visible = () => page.locator('[data-capability]:visible');
const trigger = status => page.locator(`[data-status-trigger="${status}"]`);
async function ready() {
  await page.bringToFront();
  await page.evaluate(() => document.fonts.ready);
  await expect(trigger('Working')).toBeEnabled();
}
async function go(hash = '') {
  const address = base + 'status/' + hash;
  if (page.url() === address) await page.reload({waitUntil: 'domcontentloaded'});
  else await page.goto(address, {waitUntil: 'domcontentloaded'});
  await ready();
}
async function audit(name) {
  const r = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  audits.push({name, violations: r.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary}))}))});
  console.log(`Accessibility: ${name}, ${r.violations.length} violations`);
}
async function capture(name) {
  await page.evaluate(() => {document.activeElement?.blur();scrollTo({top:0,behavior:'instant'});});
  await page.screenshot({path: `${out}/${name}.png`, fullPage: true});
}
async function attached() {
  return plate().evaluate(el => {
    const svg=el.querySelector('[data-focus-connectors]'),origin=svg.getBoundingClientRect();
    const tiles=[...el.querySelectorAll('.lens-component')].map(tile=>tile.getBoundingClientRect());
    return [...svg.querySelectorAll('circle')].every(dot=>{
      const x=Number(dot.getAttribute('cx'))+origin.left,y=Number(dot.getAttribute('cy'))+origin.top;
      return tiles.some(tile=>Math.abs(x-(tile.left+tile.right)/2)<2&&Math.min(Math.abs(y-tile.top),Math.abs(y-tile.bottom))<4);
    });
  });
}
async function checkFeature(feature) {
  await expect(visible()).toHaveCount(1);
  await expect(page.locator('[data-layer-tab][aria-pressed="true"]')).toHaveCount(0);
  await expect(page.locator('[data-focus-title]')).toHaveText(feature.feature);
  await expect(visible().locator('.feat-note')).toHaveText(feature.note);
  await expect(visible().locator('.status-chip')).toHaveText(feature.status);
  await expect(visible().locator('details')).toHaveAttribute('open', '');
  expect(await visible().locator('.score-number').allTextContents()).toEqual([`${feature.functionality}/5`, `${feature.implementation}/5`]);
  const focused = await plate().evaluate(el => {
    const row = [...el.querySelectorAll('[data-capability]')].find(row => !row.hidden);
    return {expected: row.dataset.componentFocus.split('|'), actual: [...el.querySelectorAll('.lens-component')].map(tile => tile.dataset.component)};
  });
  expect(focused.actual.slice().sort()).toEqual(focused.expected.slice().sort());
  expect(focused.actual.length).toBeGreaterThan(0);
  expect(new URL(page.url()).hash).toBe(`#status-${feature.status.toLowerCase()}/${key(feature.feature)}`);
  checked.push(feature.feature);
}
async function geometry(width, status) {
  await page.setViewportSize({width, height: 1080});
  await go(`#status-${status.toLowerCase()}`);
  await expect(plate()).toHaveAttribute('data-status-lens', status);
  await expect.poll(() => page.locator('[data-focus-connectors]').evaluate(svg => svg.getAttribute('viewBox'))).not.toBeNull();
  // All connector endpoints must stay attached to a highlighted tile after layout changes.
  await expect.poll(attached).toBe(true);
  const layout = await plate().evaluate(el => {
    const scene = el.querySelector('.layer-scene').getBoundingClientRect();
    const tabs = el.querySelector('.layer-tabs').getBoundingClientRect();
    const labels = [...el.querySelectorAll('.face-label')].map(node => node.getBoundingClientRect()).sort((a,b) => a.top-b.top);
    const faces = [...el.querySelectorAll('.layer-face')].map(node => node.getBoundingClientRect());
    const panel = el.querySelector('.capability-panel');
    const meters = [...el.querySelectorAll('[data-capability]:not([hidden]) .dots')].map(node => node.getBoundingClientRect().width);
    const counts = [...document.querySelectorAll('[data-status-trigger]')].map(node => node.getBoundingClientRect());
    return {overflow: document.documentElement.scrollWidth-innerWidth, left: Math.min(...faces.map(r => r.left))-scene.left, right: Math.max(...faces.map(r => r.right))-scene.right, top: Math.min(...faces.map(r => r.top))-scene.top, bottom: tabs.top-Math.max(...faces.map(r => r.bottom)), labelsOverlap: labels.some((r,i) => i > 0 && labels[i-1].bottom >= r.top), panelOverflow: panel.scrollHeight-panel.clientHeight, panelFlow: getComputedStyle(panel).overflowY, meters, countTops: counts.map(r => r.top), countHeights: counts.map(r => r.height)};
  });
  layouts.push({width, status, ...layout});
  expect(layout.overflow).toBeLessThanOrEqual(0); expect(layout.left).toBeGreaterThanOrEqual(-1); expect(layout.right).toBeLessThanOrEqual(1);
  expect(layout.top).toBeGreaterThan(0); expect(layout.bottom).toBeGreaterThan(0); expect(layout.labelsOverlap).toBe(false);
  expect(layout.panelFlow).toBe('visible'); expect(layout.panelOverflow).toBeLessThanOrEqual(1);
  layout.meters.forEach(value => expect(value).toBeGreaterThan(60));
  for (const values of [layout.countTops, layout.countHeights]) expect(Math.max(...values)-Math.min(...values)).toBeLessThan(.02);
  console.log(`Focus layout ${width}px / ${status}: connected tiles, aligned counts, no overlap or overflow.`);
}
try {
  for (const width of [320,390,768,1024,1440]) for (const status of statuses) await geometry(width, status);
  await go('#interaction/camera');
  const beforeNames = await visible().locator('h4').allTextContents();
  await page.locator('[data-expand-scores]').click();
  for (const status of statuses) {
    await trigger(status).click();
    await expect(plate()).toHaveAttribute('data-status-lens', status);
    const features = source.filter(f => f.status === status);
    await expect(trigger(status)).toHaveAttribute('aria-pressed', 'true');
    expect(await page.locator('[data-focus-choice] option').allTextContents()).toEqual(expect.arrayContaining(features.map(f => f.feature)));
    await expect(page.locator('[data-focus-choice] option')).toHaveCount(features.length);
    for (const feature of features) {
      await page.locator('[data-focus-choice]').selectOption(key(feature.feature));
      await checkFeature(feature);
    }
    await page.locator('button[data-focus-all]').click();
    await expect(visible()).toHaveCount(features.length);
    expect((await visible().locator('h4').allTextContents()).sort()).toEqual(features.map(f => f.feature).sort());
    await page.locator('button[data-focus-all]').click(); await expect(visible()).toHaveCount(1);
    await page.locator('[data-focus-choice]').selectOption(await page.locator('[data-focus-choice] option').first().getAttribute('value'));
    await page.locator('[data-focus-step="-1"]').click();
    await expect(page.locator('[data-focus-position]')).toHaveText(`${features.length} / ${features.length}`);
    await page.locator('[data-focus-step="1"]').click();
    await expect(page.locator('[data-focus-position]')).toHaveText(`1 / ${features.length}`);
    await audit(status.toLowerCase()+'-light');
    await capture(status.toLowerCase()+'-desktop');
  }
  await page.locator('[data-focus-restore]').click();
  expect(await visible().locator('h4').allTextContents()).toEqual(beforeNames);
  await expect(visible().locator('details[open]')).toHaveCount(beforeNames.length);
  expect(new URL(page.url()).hash).toBe('#interaction/camera');
  await expect(page.locator('[data-layer-tab="4"]')).toHaveAttribute('aria-pressed','true');
  await trigger('Working').focus(); await page.keyboard.press('Space');
  await expect(plate()).toHaveAttribute('data-status-lens', 'Working');
  await page.locator('[data-search-open]').click(); await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape'); await expect(page.locator('dialog')).not.toBeVisible();
  await expect(plate()).toHaveAttribute('data-status-lens', 'Working');
  await page.keyboard.press('Escape'); await expect(trigger('Working')).toBeFocused();
  expect(await plate().getAttribute('data-status-lens')).toBeNull();
  await trigger('Partial').click(); await trigger('Partial').click();
  expect(await plate().getAttribute('data-status-lens')).toBeNull();

  // History and direct URLs preserve the feature and the actual snapshot ratings.
  await go('#status-working/live-viewfinder'); await checkFeature(source.find(f => f.feature === 'Live viewfinder'));
  await page.reload({waitUntil: 'domcontentloaded'}); await ready(); await checkFeature(source.find(f => f.feature === 'Live viewfinder'));
  await trigger('Partial').click(); await trigger('Planned').click();
  await page.goBack({waitUntil: 'commit'}); await expect(plate()).toHaveAttribute('data-status-lens', 'Partial');
  await page.goForward({waitUntil: 'commit'}); await expect(plate()).toHaveAttribute('data-status-lens', 'Planned');
  await page.locator('[data-layer-tab="3"]').click(); expect(await plate().getAttribute('data-status-lens')).toBeNull();
  await page.goBack({waitUntil: 'commit'}); await expect(plate()).toHaveAttribute('data-status-lens', 'Planned');
  await go('#status-partial/unknown-capability'); await expect(visible()).toHaveCount(1); await expect(page.locator('[data-focus-title]')).toHaveText('Full-resolution stills');

  await go('#status-working'); await page.locator('select[data-appearance]').selectOption('dark'); await audit('working-dark');
  await capture('working-dark');
  await page.locator('select[data-appearance]').selectOption('light'); await page.setViewportSize({width:390,height:844});
  await go('#status-partial'); await audit('partial-mobile');
  await capture('partial-mobile');
  const jumpHash = new URL(page.url()).hash;
  await page.locator('[data-focus-jump]').click(); await expect(page.locator('.capability-panel')).toBeFocused();
  expect(new URL(page.url()).hash).toBe(jumpHash);
  expect(await page.locator('.capability-panel').evaluate(el => el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(75);
  await page.setViewportSize({width:1440,height:1080}); await go('#foundations');
  await page.emulateMedia({reducedMotion:'no-preference'});
  const overviewTransform=await page.locator('[data-tier="apps"] .layer-face').evaluate(el=>getComputedStyle(el).transform);
  await trigger('Working').click(); await expect(plate()).not.toHaveClass(/lens-changing/);
  await expect.poll(attached).toBe(true);
  expect(await page.locator('[data-tier="apps"] .layer-face').evaluate(el=>getComputedStyle(el).transform)).not.toBe(overviewTransform);
  await trigger('Partial').click(); await page.locator('.layer-scene').scrollIntoViewIfNeeded();
  await expect(plate()).not.toHaveClass(/lens-changing/);
  await expect.poll(attached).toBe(true);
  const line = page.locator('[data-focus-connectors] path').first(); await expect(line).toBeAttached();
  const sample = await line.evaluate(async el => {const a=getComputedStyle(el).strokeDashoffset; await new Promise(r=>setTimeout(r,180)); return [a,getComputedStyle(el).strokeDashoffset];});
  expect(sample[0]).not.toBe(sample[1]);
  await page.locator('[data-layer-motion]').click();
  const paused = await line.evaluate(async el => {const a=getComputedStyle(el).strokeDashoffset; await new Promise(r=>setTimeout(r,180)); return [a,getComputedStyle(el).strokeDashoffset];});
  expect(paused[0]).toBe(paused[1]);
  await page.emulateMedia({reducedMotion:'reduce'}); await expect(page.locator('[data-layer-motion]')).toBeDisabled();
  expect(await plate().evaluate(el=>el.getAnimations({subtree:true}).filter(a=>a.playState==='running').length)).toBe(0);
  await page.emulateMedia({media:'print'}); await expect(visible()).toHaveCount(source.length); await expect(visible().locator('.score-number:visible')).toHaveCount(source.length*2);
  await page.emulateMedia({media:'screen'});
  const fallback = await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});
  const plain = await fallback.newPage(); await plain.goto(base+'status/');
  await expect(plain.locator('[data-capability]:visible')).toHaveCount(source.length); await expect(plain.locator('[data-status-trigger]:disabled')).toHaveCount(3);
  await fallback.close();
  expect(new Set(checked).size).toBe(source.length); expect(errors).toEqual([]); expect(audits.flatMap(a=>a.violations)).toEqual([]);
  writeFileSync(out+'/results.json',JSON.stringify({result:'pass',features:checked,layouts,audits,errors,motion:sample,paused},null,2));
  console.log(`PASS: ${source.length} original capabilities, status cohorts, connected focus, scores, restore/history, keyboard, responsive layouts, pause, reduced motion, print and no-JavaScript.`);
} finally {await context.close(); await browser.close();}
