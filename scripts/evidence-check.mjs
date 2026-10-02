import {chromium, expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {readArticles} from './content.mjs';

const endpoint=process.env.ATLAS_CDP;
if(!endpoint)throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/';
const out=process.env.ATLAS_QA_DIR||'test-results/evidence';mkdirSync(out,{recursive:true});
const source=JSON.parse(readFileSync('src/data/evidence.json','utf8'));
const arrangement=JSON.parse(readFileSync('src/data/evidence-layout.json','utf8'));
const timeline=JSON.parse(readFileSync('src/data/timeline.json','utf8'));
const chapters=readArticles();
const dates=[...new Set(timeline.map(e=>e.date))].sort();
const browser=await chromium.connectOverCDP(endpoint);
const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
const page=await context.newPage();const errors=[],audits=[],layouts=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const visible=()=>page.locator('[data-ea-tile]:visible');
const selected=()=>page.locator('[data-ea-tile][aria-current=true]');
const ids=()=>visible().evaluateAll(nodes=>nodes.map(n=>n.dataset.eaTile).sort());
async function go(params=''){await page.goto(base+'evidence/'+params);await page.bringToFront();await page.locator('[data-evidence-atlas][data-ready]').waitFor();await page.evaluate(()=>document.fonts.ready);}
async function audit(name){const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({name,violations:result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});console.log('Accessibility:',name,result.violations.length);}
function expected(predicate){return source.filter(predicate).map(e=>e.id).sort();}
try{
 await go();
 expect(await ids()).toEqual(source.map(e=>e.id).sort());
 expect(new Set(await page.locator('[data-ea-tile]').evaluateAll(nodes=>nodes.map(n=>n.dataset.eaTile))).size).toBe(source.length);
 await expect(selected()).toHaveAttribute('data-ea-tile','E35');
 expect(await page.locator('[data-ea-day]').evaluateAll(nodes=>nodes.map(n=>n.dataset.eaDay))).toEqual(dates);
 await audit('atlas-light');

 // Every selectable claim, limit, environment and snapshot must match the ledger.
 for(const record of source){
  await page.locator(`[data-ea-tile="${record.id}"]`).click();
  await expect(selected()).toHaveAttribute('data-ea-tile',record.id);
  await expect(page.locator('#ea-detail-title')).toHaveText(arrangement[record.id].label);
  await expect(page.locator('.ea-detail-environment')).toContainText(record.environment);
  await expect(page.locator('.ea-detail-observation p')).toHaveText(record.observation);
  await page.locator('.ea-detail-limits').evaluate(el=>el.open=true);
  await expect(page.locator('.ea-detail-limits p')).toHaveText(record.limits);
  await expect(page.locator('.ea-detail-limits')).toContainText(record.sourceRevision.slice(0,7));
  await expect(page.locator('[data-ea-open]')).toHaveAttribute('href',`/ios/evidence/${record.id}/`);
  expect(new URL(page.url()).searchParams.get('focus')).toBe(record.id);
  for(const edge of await page.locator('.ea-route.is-connection').evaluateAll(nodes=>nodes.map(n=>({from:n.dataset.edgeFrom,to:n.dataset.edgeTo})))){
   expect(edge.from).toBe(record.id);
   expect(chapters.some(c=>c.evidence.includes(edge.from)&&c.evidence.includes(edge.to))).toBe(true);
  }
 }
 console.log('All',source.length,'claims, limits, snapshots and reading edges match their sources.');

 // Earlier dates come from published milestones, independently of review dates.
 for(const date of dates){
  await page.locator(`[data-ea-day="${date}"]`).click();
  await expect(page.locator('[data-ea-day][aria-current=true]')).toHaveAttribute('data-ea-day',date);
  const events=timeline.filter(e=>e.date===date);
  expect(await page.locator('[data-ea-history-record]').evaluateAll(nodes=>nodes.map(n=>n.dataset.eaHistoryRecord).sort())).toEqual(events.map(e=>e.evidence).sort());
  for(const event of events){
   await page.locator(`[data-ea-history-record="${event.evidence}"]`).click();
   await expect(selected()).toHaveAttribute('data-ea-tile',event.evidence);
   await page.locator('.ea-detail-milestone').evaluate(el=>el.open=true);
   await expect(page.locator('.ea-detail-milestone p')).toHaveText(event.description);
   const href=await page.locator('.ea-detail-milestone a').getAttribute('href');
   const response=await page.request.get(new URL(href,base).href);expect(response.ok()).toBe(true);
   expect(await response.text()).toContain(`id="${new URL(href,base).hash.slice(1)}"`);
  }
 }
 await go('?focus=E28');await page.locator('.ea-detail-milestone').evaluate(el=>el.open=true);
 await expect(page.locator('.ea-detail-milestone')).toContainText('not retroactively assigned');
 await expect(page.locator('[data-ea-day][aria-current=true]')).toHaveAttribute('data-ea-day','2026-09-23');
 await audit('earlier-milestone-expanded');
 console.log('All',timeline.length,'milestones on',dates.length,'dates retain their wording and links.');

 // All filters combine, and a failed search leaves an actionable empty state.
 await go();
 for(const domain of [...new Set(Object.values(arrangement).map(e=>e.domain))]){
  await page.locator(`[data-ea-domain="${domain}"]`).click();
  expect(await ids()).toEqual(expected(e=>arrangement[e.id].domain===domain));
  await page.locator('[data-ea-domain=""]').click();
 }
 for(const environment of [...new Set(source.map(e=>e.environment))]){
  await page.locator('[data-ea-env]').selectOption(environment);
  expect(await ids()).toEqual(expected(e=>e.environment===environment));
 }
 await page.locator('[data-ea-env]').selectOption('');
 for(const key of [...new Set(source.map(e=>e.reviewedOn+'/'+e.sourceRevision))]){
  await page.locator('[data-ea-review]').selectOption(key);
  expect(await ids()).toEqual(expected(e=>e.reviewedOn+'/'+e.sourceRevision===key));
 }
 await page.locator('[data-ea-review]').selectOption('');
 await page.locator('[data-ea-domain="Graphics"]').click();
 await page.locator('[data-ea-env]').selectOption('Physical PinePhone');
 await page.locator('[data-ea-search]').fill('E35');
 expect(await ids()).toEqual(['E35']);
 await page.locator('[data-ea-search]').fill('no-record-xyz-unknown');
 await expect(page.locator('[data-ea-empty]')).toBeVisible();
 await expect(page.locator('[data-ea-detail]')).toBeHidden();
 await audit('empty-state');
 await page.locator('[data-ea-clear]').click();expect(await ids()).toHaveLength(source.length);

 // Links restore selection, filters and the browser's history.
 await go('?focus=E06&domain=Machine&env=Physical+PinePhone');
 await expect(selected()).toHaveAttribute('data-ea-tile','E06');
 await expect(page.locator('[data-ea-domain="Machine"]')).toHaveAttribute('aria-pressed','true');
 await page.locator('[data-ea-tile="E07"]').click();await page.goBack();
 await expect(selected()).toHaveAttribute('data-ea-tile','E06');await page.goForward();
 await expect(selected()).toHaveAttribute('data-ea-tile','E07');await page.reload();
 await expect(selected()).toHaveAttribute('data-ea-tile','E07');
 await page.locator('[data-ea-day="2026-09-23"]').click();
 await expect(selected()).toHaveAttribute('data-ea-tile','E28');
 expect(await ids()).toHaveLength(source.length);
 await page.locator('[data-ea-open]').click();await expect(page).toHaveURL(new RegExp('/evidence/E28/$'));
 await page.getByRole('link',{name:'← Evidence Atlas',exact:true}).click();
 await expect(selected()).toHaveAttribute('data-ea-tile','E28');
 await page.locator('[data-ea-tile="E35"]').click();
 await page.locator('[data-ea-step="-1"]').click();await expect(selected()).toHaveAttribute('data-ea-tile','E34');
 await page.locator('[data-ea-step="1"]').click();await expect(selected()).toHaveAttribute('data-ea-tile','E35');
 await page.locator('[data-ea-tile="E35"]').focus();await page.keyboard.press('ArrowUp');
 await expect(selected()).toHaveAttribute('data-ea-tile','E33');
 await page.keyboard.press('Home');await expect(selected()).toHaveAttribute('data-ea-tile','E01');
 await page.keyboard.press('End');await expect(selected()).toHaveAttribute('data-ea-tile','E40');
 await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp('focus=E40'));
 await page.locator('[data-ea-view="ledger"]').click();
 await expect(page.locator('[data-ea-row]:visible')).toHaveCount(source.length);
 await audit('ledger');
 await page.locator('[data-ea-env]').selectOption('Physical PinePhone');
 await expect(page.locator('[data-ea-row]:visible')).toHaveCount(source.filter(e=>e.environment==='Physical PinePhone').length);
 await page.reload();await expect(page.locator('[data-ea-view="ledger"]')).toHaveAttribute('aria-pressed','true');

 // Mobile layouts retain every tile, focus controls and normal document scrolling.
 for(const width of [320,360,390,768,1024,1120,1440]){
  await page.setViewportSize({width,height:1000});await go();
  const geometry=await page.evaluate(()=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,collisions:Array.from(document.querySelectorAll('.ea-tile strong,.ea-lane h3')).filter(el=>el.scrollWidth>el.clientWidth+1).map(el=>el.textContent),detailOverflow:getComputedStyle(document.querySelector('[data-ea-detail]')).overflowY,detailHeight:document.querySelector('[data-ea-detail]').clientHeight,detailScroll:document.querySelector('[data-ea-detail]').scrollHeight}));
  layouts.push(geometry);expect(geometry.overflow).toBeLessThanOrEqual(0);expect(geometry.collisions).toEqual([]);expect(geometry.detailOverflow).toBe('visible');expect(geometry.detailHeight).toBe(geometry.detailScroll);
  if([320,390,1440].includes(width)){await audit('atlas-'+width);await page.screenshot({path:out+'/atlas-'+width+'.png',fullPage:true});}
  if(width===390){
   await page.locator('[data-ea-mobile]').click();
   await expect(page.locator('[data-ea-mobile]')).toBeHidden();
   const top=await page.locator('#ea-detail-title').evaluate(el=>el.getBoundingClientRect().top);
   expect(top).toBeGreaterThanOrEqual(0);expect(top).toBeLessThan(1000);
  }
 }
 await page.setViewportSize({width:1440,height:1080});
 await page.locator('select[data-appearance]').selectOption('dark');await audit('atlas-dark');
 for(const domain of [...new Set(Object.values(arrangement).map(e=>e.domain))]){
  const colors=await page.evaluate(domain=>({tile:getComputedStyle(document.querySelector(`[data-ea-tile][data-domain="${domain}"]`)).getPropertyValue('--domain'),key:getComputedStyle(document.querySelector(`[data-ea-domain="${domain}"]`)).getPropertyValue('--domain')}),domain);expect(colors.tile).toBe(colors.key);
 }
 await page.screenshot({path:out+'/atlas-dark.png',fullPage:true});
 await page.locator('[data-ea-search]').fill('E35');await page.emulateMedia({media:'print'});
 await expect(page.locator('[data-ea-row]:visible')).toHaveCount(source.length);
 await expect(page.locator('[data-ea-chart]')).toBeHidden();await page.emulateMedia({media:'screen'});
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}}),staticPage=await noJS.newPage();
 await staticPage.goto(base+'evidence/');await expect(staticPage.locator('[data-ea-row]:visible')).toHaveCount(source.length);await expect(staticPage.locator('[data-ea-tile]:visible')).toHaveCount(source.length);await expect(staticPage.locator('[data-ea-day]')).toHaveCount(dates.length);expect(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await staticPage.locator('[data-ea-tile="E06"]').click();await expect(staticPage).toHaveURL(new RegExp('/evidence/E06/$'));await noJS.close();

 // Motion occurs on an action and responds immediately to reduced motion.
 await page.emulateMedia({reducedMotion:'no-preference'});await go();
 const motion=await page.evaluate(()=>{document.querySelector('[data-ea-domain="Graphics"]').click();return Array.from(document.querySelectorAll('[data-ea-tile]')).flatMap(el=>el.getAnimations()).length;});expect(motion).toBeGreaterThan(0);
 await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>page.evaluate(()=>Array.from(document.querySelectorAll('[data-ea-tile]')).flatMap(el=>el.getAnimations()).filter(a=>a.playState==='running').length)).toBe(0);
 await page.locator('[data-ea-reset]').click();
 expect(await page.locator('.ea-route.is-connection').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
 await page.locator('[data-search-open]').click();await page.locator('#atlas-search').fill('SWP');await expect(page.locator('#search-results')).toContainText('E06');await page.keyboard.press('Escape');
 expect(errors).toEqual([]);for(const check of audits)expect(check.violations,check.name).toEqual([]);
 writeFileSync(out+'/results.json',JSON.stringify({errors,audits,layouts,records:source.length,milestones:timeline.length,dates,interactions:'claims and limits, co-citation edges, older milestones, combined filters, empty state, share links, Back/Forward, record return, keyboard, ledger, seven widths, themes, no-JS, print, reduced motion, site search'},null,2));
 console.log('Evidence Atlas review passed:',source.length,'records,',timeline.length,'milestones,',audits.length,'accessibility states.');
}finally{await context.close();await browser.close();}
