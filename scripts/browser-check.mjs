import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
const endpoint=process.env.ATLAS_CDP;if(!endpoint)throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const browser=await chromium.connectOverCDP(endpoint),context=browser.contexts()[0],page=await context.newPage();
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/';const out=process.env.ATLAS_QA_DIR||'test-results';mkdirSync(out,{recursive:true});
const errors=[],checks=[],layouts=[];
async function go(url){await page.goto(url);await page.bringToFront();await page.locator('html[data-enhanced]').waitFor();}
async function layout(name,width){
 const geometry=await page.evaluate(()=>{
  const main=document.querySelector('.site-main'),r=main.getBoundingClientRect(),css=getComputedStyle(main),brand=document.querySelector('.brand').getBoundingClientRect(),footer=document.querySelector('.footer-title').getBoundingClientRect();
  const header=[...document.querySelectorAll('.brand,.desktop-nav,.header-actions')].map(el=>el.getBoundingClientRect()).filter(r=>r.width>0).sort((a,b)=>a.left-b.left);
  return{overflow:document.documentElement.scrollWidth-innerWidth,mainLeft:r.left+parseFloat(css.paddingLeft),brandLeft:brand.left,footerLeft:footer.left,headerOverlap:header.some((r,i)=>i>0&&header[i-1].right>r.left)};
 });
 expect(geometry.overflow,`${name} overflow at ${width}`).toBeLessThanOrEqual(0);expect(geometry.headerOverlap,`${name} header controls at ${width}`).toBe(false);
 expect(Math.abs(geometry.mainLeft-geometry.brandLeft),`${name} header gutter at ${width}`).toBeLessThan(.02);expect(Math.abs(geometry.mainLeft-geometry.footerLeft),`${name} footer gutter at ${width}`).toBeLessThan(.02);
 layouts.push({name,width,...geometry});
}
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
for(const [name,path]of [['home',''],['paper','paper/'],['summary','summary/'],['edition','edition/'],['claims','claims/'],['article','articles/storage-abi/'],['map','map/'],['evidence','evidence/E20/'],['method','method/'],['timeline','timeline/'],['swap','evidence/E06/'],['photo','evidence/E05/'],['library','library/'],['tour','tours/boot/'],['glossary','glossary/'],['sources','sources/'],['status','status/'],['evidence-atlas','evidence/']]){
 await page.setViewportSize({width:1440,height:1000});await go(base+path);await page.evaluate(()=>document.fonts.ready);await expect(page.locator('h1')).toBeVisible();await layout(name,1440);await page.screenshot({path:`${out}/${name}-desktop.png`,fullPage:true});
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();checks.push({name,viewport:'desktop',violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});
 for(const width of [390,360,320,768]){await page.setViewportSize({width,height:844});await page.reload();await page.evaluate(()=>document.fonts.ready);await layout(name,width);if(width===390){await page.screenshot({path:`${out}/${name}-mobile.png`,fullPage:true});const mobileAxe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();checks.push({name,viewport:'mobile',violations:mobileAxe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});}}
}
await page.setViewportSize({width:1440,height:1000});await go(base);
// User preference survives navigation; System responds to live OS changes.
for(const [preference,system,resolved] of [['dark','light','dark'],['light','dark','light'],['system','dark','dark'],['system','light','light']]){
 await page.emulateMedia({colorScheme:system});await page.locator('select[data-appearance]').selectOption(preference);await expect(page.locator('html')).toHaveAttribute('data-theme',resolved);await page.reload();await expect(page.locator('select[data-appearance]')).toHaveValue(preference);await expect(page.locator('html')).toHaveAttribute('data-theme',resolved);
}
for(const path of ['', 'evidence/E04/','evidence/E06/','evidence/E16/','map/','timeline/']){
 await go(base+path);await page.locator('select[data-appearance]').selectOption('dark');const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();checks.push({name:path||'home',viewport:'dark',violations:audit.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))});
 await page.screenshot({path:`${out}/dark-${path.replaceAll('/','-')||'home'}.png`,fullPage:true});
}
await page.locator('select[data-appearance]').selectOption('light');await go(base);
await page.locator('[data-search-open]').click();await expect(page.locator('dialog')).toBeVisible();await page.locator('#atlas-search').fill('completion ABI');await expect(page.locator('#search-results a').first()).toBeVisible();await expect(page.locator('#search-results')).toContainText('completion');await page.locator('#atlas-search').fill('zzzz-no-result');await expect(page.locator('.no-results')).toBeVisible();await page.keyboard.press('Escape');await expect(page.locator('dialog')).not.toBeVisible();await page.locator('body').click({position:{x:4,y:200}});await page.keyboard.press('/');await expect(page.locator('dialog')).toBeVisible();await page.keyboard.press('Escape');
await go(base+'map/?focus=storage-abi');await expect(page.locator('#map-detail')).toContainText('A correct sector');await page.locator('#concept-select').selectOption('buttons');await expect(page.locator('#map-detail')).toContainText('A physical key becomes a guest event');expect(new URL(page.url()).searchParams.get('focus')).toBe('buttons');await page.locator('#map-reset').click();await expect(page.locator('#map-detail')).toContainText('A system of contracts');await page.locator('#list-view').click();await expect(page.locator('#map-list')).toBeVisible();
await page.locator('#graph-view').click();await expect(page.locator('#force-graph')).toBeVisible();
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#map-reset').click();
const node=page.locator('[data-force-node="orientation"]');const before=await node.getAttribute('transform');const box=await node.locator('circle:not(.hit-target)').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+90,box.y+55,{steps:10});await page.mouse.up();expect(await node.getAttribute('transform')).not.toBe(before);
const cameraBefore=await page.locator('#graph-camera').getAttribute('transform');await page.locator('#graph-in').click();expect(await page.locator('#graph-camera').getAttribute('transform')).not.toBe(cameraBefore);await page.locator('#graph-fit').click();await page.locator('#map-view').click();await expect(page.locator('#map-canvas')).toBeVisible();await page.locator('[data-node="buttons"]').last().click();await expect(page.locator('#map-detail')).toContainText('A physical key becomes');
await go(base+'evidence/E06/');await page.locator('[data-source-link]').first().click();await expect(page.locator('.source-excerpt[open]')).toBeVisible();await expect(page.locator('.source-excerpt[open]')).toContainText('AppleHV SWP');
const download=await page.request.get(base+'evidence/data/E06.json');expect(download.ok()).toBe(true);expect((await download.json()).record.exhibits[0].text).toContain('2fe25724');
await page.locator('[data-search-open]').click();await page.locator('#atlas-search').fill('2fe25724');await expect(page.locator('#search-results')).toContainText('E06');await page.keyboard.press('Escape');
await go(base+'evidence/');await page.locator('[data-ea-env]').selectOption('Physical PinePhone');await expect(page.locator('[data-ea-count]')).not.toContainText('40 of 40');for(const tile of await page.locator('[data-ea-tile]:visible').all())expect(await tile.getAttribute('data-env')).toBe('physical-pinephone');
await page.emulateMedia({reducedMotion:'reduce'});await go(base+'articles/storage-abi/');expect(await page.locator('html').evaluate(el=>getComputedStyle(el).scrollBehavior)).not.toBe('smooth');
const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const staticPage=await noJS.newPage();await staticPage.goto(base+'articles/storage-abi/');await expect(staticPage.locator('.article-prose')).toContainText('negative control');await noJS.close();
const atlas=await (await fetch(base+'atlas.json')).json();await page.setViewportSize({width:360,height:844});for(const a of atlas.articles){await go(base+'articles/'+a.slug+'/');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Narrow reading: '+a.slug).toBe(true);}
writeFileSync(`${out}/results.json`,JSON.stringify({checks,layouts,errors,interactions:'template alignment at five widths, search and addresses, excerpt links/download, appearance persistence and system updates, graph drag/zoom/reset/structured/list, evidence filtering, reduced motion, no-JS article'},null,2));
console.log(JSON.stringify({pages:checks.length,violations:checks.flatMap(c=>c.violations),errors},null,2));await page.close();await browser.close();if(errors.length||checks.some(c=>c.violations.length))process.exitCode=1;
