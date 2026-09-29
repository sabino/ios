import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const endpoint=process.env.ATLAS_CDP;if(!endpoint)throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const browser=await chromium.connectOverCDP(endpoint),page=await browser.contexts()[0].newPage();
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/';
const out=process.env.ATLAS_QA_DIR||'test-results';mkdirSync(out,{recursive:true});
const errors=[],audits=[];page.on('pageerror',e=>errors.push(e.message));
const camera=page.locator('#graph-camera');const pose=()=>camera.getAttribute('transform');
try{
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto(base+'map/');await page.bringToFront();await page.locator('html[data-enhanced]').waitFor();await page.locator('#force-graph').scrollIntoViewIfNeeded();await page.waitForTimeout(1400);
 const initial=await pose();await page.locator('#graph-in').click();await page.waitForTimeout(200);const midway=await pose();await page.waitForTimeout(1200);const end=await pose();expect(midway).not.toBe(initial);expect(end).not.toBe(midway);await page.waitForTimeout(150);expect(await pose()).toBe(end);
 await page.locator('#map-reset').click();await page.waitForTimeout(1400);
 // Pan, stop moving, then release: old movement must not cause a delayed fling.
 const box=await page.locator('#force-graph').boundingBox();
 await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+160,box.y+90,{steps:12});await page.waitForTimeout(250);const held=await pose();await page.mouse.up();await page.waitForTimeout(400);expect(await pose(),'Stationary release must not coast').toBe(held);
 // A release while moving should retain momentum in the same direction.
 await page.mouse.move(box.x+20,box.y+30);await page.mouse.down();await page.mouse.move(box.x+160,box.y+90,{steps:12});const moving=await pose();await page.mouse.up();await page.waitForTimeout(300);expect(await pose(),'Moving release should coast').not.toBe(moving);
 await page.locator('#concept-select').selectOption('buttons');await expect(page.locator('#map-detail')).toContainText('A physical key becomes');await page.locator('#list-view').click();await expect(page.locator('#map-list')).toBeVisible();await page.locator('#graph-view').click();await expect(page.locator('#force-graph')).toBeVisible();
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#map-reset').click();const reduced=await pose();await page.waitForTimeout(200);expect(await pose()).toBe(reduced);
 const node=page.locator('[data-force-node="orientation"]');const original=await node.getAttribute('transform');const dot=await node.locator('circle:not(.hit-target)').boundingBox();await page.mouse.move(dot.x+dot.width/2,dot.y+dot.height/2);await page.mouse.down();await page.mouse.move(dot.x+70,dot.y+45,{steps:8});await page.mouse.up();expect(await node.getAttribute('transform')).not.toBe(original);await page.locator('#map-reset').click();expect(await node.getAttribute('transform')).toBe(original);
 await page.locator('#graph-in').click();const reducedZoom=await pose();expect(reducedZoom).not.toBe(reduced);await page.waitForTimeout(200);expect(await pose()).toBe(reducedZoom);
 for(const [width,appearance] of [[1440,'light'],[390,'dark']]){
  await page.setViewportSize({width,height:1000});await page.reload();await page.locator('html[data-enhanced]').waitFor();await page.locator('select[data-appearance]').selectOption(appearance);if(width===390)await page.locator('#graph-view').click();await page.locator('#graph-fit').click();await page.locator('#force-graph').scrollIntoViewIfNeeded();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({width,appearance,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});await page.screenshot({path:`${out}/graph-${width}-${appearance}.png`,fullPage:true});
 }
 await node.focus();await page.keyboard.press('Enter');await expect(page.locator('#map-detail')).toContainText('What, exactly, are we preserving');
 expect(errors).toEqual([]);expect(audits.flatMap(a=>a.violations)).toEqual([]);
 writeFileSync(`${out}/graph-results.json`,JSON.stringify({audits,errors,checks:'smooth zoom/settling, stationary and moving release, selection, view switching, node dragging/reset, reduced motion, keyboard selection and responsive layout'},null,2));console.log('Graph motion, input, reduced motion and responsive accessibility checks passed.');
}finally{await page.close();await browser.close();}
