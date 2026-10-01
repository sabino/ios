import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync, writeFileSync} from 'node:fs';

const endpoint = process.env.ATLAS_CDP;
if (!endpoint) throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const base = process.env.ATLAS_URL || 'http://127.0.0.1:4321/ios/';
const out = process.env.ATLAS_QA_DIR || 'test-results/hero';
mkdirSync(out, {recursive: true});
const browser = await chromium.connectOverCDP(endpoint);
const context = await browser.newContext({viewport: {width: 1440, height: 900}});
const page = await context.newPage();
const errors = [], audits = [], layouts = [];
page.on('pageerror', error => errors.push(error.message));
page.on('response', response => {
  if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
});
const hero = page.locator('[data-home-hero]');
const selectedSlide = () => page.locator('[data-hero-slide][aria-hidden="false"]');
async function go() {
  await page.goto(base);
  await page.bringToFront();
  await expect(hero).toHaveClass(/is-ready/);
  await page.evaluate(() => document.fonts.ready);
}
async function audit(name) {
  await expect(page.locator('[data-home-hero] .is-entering')).toHaveCount(0);
  await expect.poll(() => selectedSlide().evaluate(el => getComputedStyle(el).opacity)).toBe('1');
  const result = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  audits.push({name, violations: result.violations.map(v => ({id: v.id, nodes: v.nodes.map(n => ({target: n.target, summary: n.failureSummary}))}))});
}
try {
  await go();
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'Read the system');
  await expect(page.locator('[data-layerplate]')).toBeInViewport();
  const sections = await page.locator('.domain-row h3').allTextContents();
  expect(await page.locator('[data-layer-tab]').allTextContents()).toEqual(sections);
  // Selection must update the explanation, matching color, and destination.
  for (const [index, section] of sections.entries()) {
    const tab = page.locator(`[data-layer-tab="${index}"]`);
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = page.locator(`[data-layer-detail="${index}"]`);
    await expect(panel).toBeVisible();
    const destination = await page.locator(`.domain-row[data-domain="${section}"]`).getAttribute('href');
    await expect(panel.locator('a')).toHaveAttribute('href', destination);
    expect(await tab.evaluate(el => getComputedStyle(el).getPropertyValue('--domain'))).toBe(await page.locator(`.domain-row[data-domain="${section}"]`).evaluate(el => getComputedStyle(el).getPropertyValue('--domain')));
  }
  console.log('Layer selections, colors and destinations passed.');
  // Roving layer keys stay inside the layer explorer, not the hero carousel.
  await page.locator('[data-layer-tab="5"]').press('Home');
  await expect(page.locator('[data-layer-tab="0"]')).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-layer-tab="1"]')).toBeFocused();
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'Read the system');
  await page.keyboard.press('End');
  await expect(page.locator('[data-layer-tab="5"]')).toBeFocused();
  await page.locator('[data-hero-go="0"]').focus();
  await page.locator('[data-hero-motion]').click();
  // Use rendered label coordinates: CDP content quads omit part of nested 3D projection.
  // Finish focus-triggered smooth scrolling before measuring screen coordinates.
  await page.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
  for (let index = 0; index < sections.length; index++) {
    const label = page.locator(index === 5 ? '[data-layer="5"] .method-label' : `[data-layer="${index}"] .face-label strong`);
    const bounds = await label.boundingBox();
    const point = {x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2};
    expect(await page.evaluate(({x, y}) => document.elementFromPoint(x, y)?.closest('[data-layer]')?.getAttribute('data-layer'), point)).toBe(String(index));
    await page.mouse.move(point.x, point.y);
    await expect(page.locator(`[data-layer-tab="${index}"]`)).toHaveAttribute('aria-selected', 'true');
  }
  await page.locator('[data-layer-tab="0"]').click();
  await page.locator('[data-hero-motion]').click();
  await expect(page.locator('[data-layer-tab="0"]')).toHaveAttribute('aria-selected', 'true');
  console.log('Keyboard and rendered layer hover passed.');
  const foundation = await page.locator('[data-layer="0"] .face-label strong').boundingBox();
  const interaction = await page.locator('[data-layer="4"] .face-label strong').boundingBox();
  expect(foundation.y, 'Foundations belongs at the base of the research map').toBeGreaterThan(interaction.y);
  expect(await page.locator('.method-rail').evaluate(el => !el.closest('.stack'))).toBe(true);
  await expect(page.locator('[data-layer-diagram]')).toHaveCount(1);
  await expect(page.locator('[data-layer-view]')).toHaveCount(0);
  await expect(page.locator('[data-layerplate].is-entering')).toHaveCount(0);
  const tierPositions = [];
  for (const tier of ['hardware', 'kernel', 'services', 'apps']) tierPositions.push((await page.locator(`[data-tier="${tier}"] .face-label strong`).boundingBox()).y);
  for (let i = 1; i < tierPositions.length; i++) expect(tierPositions[i - 1]).toBeGreaterThan(tierPositions[i]);
  await page.locator('[data-layer-tab="1"]').click();
  await expect(page.locator('[data-tier].is-related')).toHaveCount(2);
  await expect(page.locator('[data-tier="kernel"]')).toHaveClass(/is-related/);

  await page.locator('[data-layer-tab="0"]').click();
  console.log('Unified wireframe order, cross-domain Method and research selection passed.');
  // Both arrows wrap; hidden content leaves the keyboard and accessibility tree.
  const boundsBefore = await hero.boundingBox();
  await page.locator('[data-hero-next]').click();
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'What runs');
  await expect(page.locator('[data-hero-slide]').first()).toHaveAttribute('inert', '');
  await expect(selectedSlide().getByRole('link', {name: 'See what runs'})).toHaveAttribute('href', '/ios/status/');
  expect((await hero.boundingBox()).height).toBeCloseTo(boundsBefore.height, 0);
  await page.locator('[data-hero-next]').click();
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'Read the system');
  await page.locator('[data-hero-prev]').click();
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'What runs');
  await page.locator('[data-hero-prev]').press('ArrowRight');
  await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'Read the system');
  await page.locator('[data-hero-motion]').click();
  await expect(page.locator('[data-hero-motion]')).toHaveAccessibleName('Resume motion');
  expect(await page.locator('[data-layer-diagram]:not([hidden]) .stack-drift').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.locator('[data-hero-motion]').click();
  await page.mouse.move(5, 5);
  expect(await page.locator('[data-layer-diagram]:not([hidden]) .stack-drift').evaluate(el => getComputedStyle(el).animationPlayState)).toBe('running');
  console.log('Hero arrows, keyboard, inert slides and pause/resume passed.');
  // Desktop, tablet and narrow phones: real transformed faces must remain in their scene.
  for (const width of [1440, 1280, 1024, 900, 768, 390, 360, 320]) {
    console.log(`Layout: ${width}px`);
    await page.setViewportSize({width, height: width > 900 ? 900 : 844});
    await go();
    await expect(page.locator('[data-layerplate]')).toHaveAttribute('data-entered', 'true');
    await expect(page.locator('[data-layerplate]')).not.toHaveClass(/is-entering/);
    await page.locator('[data-hero-next]').click();
    await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'What runs');
    await page.locator('[data-hero-prev]').click();
    await expect(selectedSlide()).toHaveAttribute('data-slide-title', 'Read the system');
    for (const slide of [0, 1]) {
      await page.locator(`[data-hero-go="${slide}"]`).click();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}, slide ${slide}`).toBe(true);
      if (slide === 0) {
        const geometry = await page.locator('[data-layerplate]').evaluate(el => {
          const activeScene = el.querySelector('[data-layer-diagram]:not([hidden]) .layer-scene');
          const scene = activeScene.getBoundingClientRect();
          const tabs = el.querySelector('.layer-tabs').getBoundingClientRect();
          const faces = [...activeScene.querySelectorAll('.layer')].map(layer => layer.getBoundingClientRect());
          return {top: Math.min(...faces.map(b => b.top)), bottom: Math.max(...faces.map(b => b.bottom)), left: Math.min(...faces.map(b => b.left)), right: Math.max(...faces.map(b => b.right)), sceneTop: scene.top, sceneLeft: scene.left, sceneRight: scene.right, tabsTop: tabs.top};
        });
        layouts.push({width, ...geometry});
        expect(geometry.top, `Stack clips heading at ${width}`).toBeGreaterThanOrEqual(geometry.sceneTop - 1);
        expect(geometry.bottom, `Stack overlaps selectors at ${width}`).toBeLessThan(geometry.tabsTop);
        expect(geometry.left).toBeGreaterThanOrEqual(geometry.sceneLeft - 1);
        expect(geometry.right).toBeLessThanOrEqual(geometry.sceneRight + 1);
      }
      if ([1440, 390].includes(width)) {
        await page.screenshot({path: `${out}/${width}-${slide}.png`, fullPage: false, animations: 'disabled'});
        await audit(`${width}-${slide}-light`);
      }
    }
  }
  await page.setViewportSize({width: 1440, height: 900});
  await go();
  await page.locator('select[data-appearance]').selectOption('dark');
  for (const slide of [0, 1]) {
    await page.locator(`[data-hero-go="${slide}"]`).click();
    await audit(`1440-${slide}-dark`);
    await page.screenshot({path: `${out}/dark-${slide}.png`, animations: 'disabled'});
  }
  // Preference can change while the page is open; both slides must become static.
  await page.emulateMedia({reducedMotion: 'reduce'});
  for (const slide of [0, 1]) {
    await page.locator(`[data-hero-go="${slide}"]`).click();
    expect(await hero.evaluate(el => el.getAnimations({subtree: true}).filter(a => a.playState === 'running').length)).toBe(0);
  }
  await page.emulateMedia({reducedMotion: 'no-preference'});
  await page.locator('[data-hero-motion]').click();
  await expect(page.locator('[data-hero-motion]')).toHaveAttribute('aria-pressed', 'true');
  // Without JS, both stories and navigation destinations remain readable.
  const staticContext = await browser.newContext({javaScriptEnabled: false, viewport: {width: 390, height: 844}});
  const staticPage = await staticContext.newPage();
  await staticPage.goto(base);
  await expect(staticPage.getByRole('heading', {name: 'iPhone OS, under the surface.'})).toBeVisible();
  await expect(staticPage.getByRole('link', {name: 'See what runs'})).toBeVisible();
  expect(await staticPage.locator('[data-layerplate]').evaluate(el => getComputedStyle(el.querySelector('.layer')).opacity)).toBe('1');
  expect(await staticPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await staticContext.close();
  const touchContext = await browser.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  try {
    const touchPage = await touchContext.newPage();
    touchPage.on('pageerror', error => errors.push(error.message));
    await touchPage.goto(base);
    await touchPage.bringToFront();
    await expect(touchPage.locator('[data-home-hero]')).toHaveClass(/is-ready/);
    const touchSlide = () => touchPage.locator('[data-hero-slide][aria-hidden="false"]');
    await touchPage.locator('[data-hero-next]').tap();
    await expect(touchSlide()).toHaveAttribute('data-slide-title', 'What runs');
    await touchPage.locator('[data-hero-prev]').tap();
    await expect(touchSlide()).toHaveAttribute('data-slide-title', 'Read the system');
    await touchPage.locator('[data-layer-tab="2"]').tap();
    await expect(touchPage.locator('[data-layer-tab="2"]')).toHaveAttribute('aria-selected', 'true');
    await touchPage.evaluate(() => window.scrollTo({top: 0, behavior: 'instant'}));
    const client = await touchContext.newCDPSession(touchPage);
    const swipe = async (from, to) => {
      await client.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: from, y: 240}]});
      for (let step = 1; step <= 6; step++) await client.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: from + (to - from) * step / 6, y: 240}]});
      await client.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    };
    await swipe(320, 70);
    await expect(touchSlide()).toHaveAttribute('data-slide-title', 'What runs');
    await swipe(70, 320);
    await expect(touchSlide()).toHaveAttribute('data-slide-title', 'Read the system');
    console.log('Touch arrows, layer selection and both swipe directions passed.');
  } finally {
    await touchContext.close();
  }
  writeFileSync(`${out}/results.json`, JSON.stringify({errors, audits, layouts}, null, 2));
  expect(errors).toEqual([]);
  expect(audits.flatMap(a => a.violations)).toEqual([]);
  console.log(JSON.stringify({result: 'passed', layoutWidths: layouts.map(l => l.width), accessibilityStates: audits.length, errors}, null, 2));
} finally {
  await context.close();
  await browser.close();
}
