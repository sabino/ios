import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import {data} from './content.mjs';

if(!process.env.ATLAS_CDP)throw Error('Set ATLAS_CDP to the isolated QA browser endpoint.');
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/',out=process.env.ATLAS_QA_DIR||'test-results/paper';
mkdirSync(out,{recursive:true});
const browser=await chromium.connectOverCDP(process.env.ATLAS_CDP);
const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
const errors=[],audits=[],layouts=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(r.status()+' '+r.url());});
async function go(path){await page.goto(base+path);await page.evaluate(()=>document.fonts.ready);await page.locator('html[data-enhanced]').waitFor();}
async function audit(name){
 const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
 audits.push({name,violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
 console.log(name+': '+r.violations.length+' accessibility violations');
}
try{
 for(const path of ['paper/','summary/','edition/','claims/','evidence/E51/','evidence/E54/']){
  for(const width of [320,360,390,768,1024,1280,1440]){
   await page.setViewportSize({width,height:1000});await go(path);
   const geometry=await page.evaluate(()=>{
    const header=[...document.querySelectorAll('.brand,.desktop-nav,.header-actions')].map(e=>e.getBoundingClientRect()).filter(r=>r.width>0).sort((a,b)=>a.left-b.left);
    return {overflow:document.documentElement.scrollWidth-innerWidth,headerOverlap:header.some((r,i)=>i>0&&header[i-1].right>r.left)};
   });
   expect(geometry.overflow,path+' at '+width).toBeLessThanOrEqual(0);expect(geometry.headerOverlap).toBe(false);
   layouts.push({path,width,...geometry});
   if(width===390||width===1440)for(const appearance of ['light','dark']){
    await page.locator('select[data-appearance]').selectOption(appearance);await audit(path+width+'-'+appearance);
    await page.screenshot({path:out+'/'+path.replaceAll('/','-')+width+'-'+appearance+'.png',fullPage:true});
   }
  }
 }
 await page.setViewportSize({width:1440,height:1000});await go('paper/');
 expect(await page.locator('#figure-1').count()).toBe(1);
 expect(await page.locator('.publication-prose figure').count()).toBe(6);
 expect(await page.locator('.publication-prose table').count()).toBe(10);
 await page.setViewportSize({width:320,height:1000});
 const wide=page.locator('.publication-prose table').first();
 await wide.focus();await expect(wide).toBeFocused();await page.keyboard.press('ArrowRight');
 await expect.poll(()=>wide.evaluate(t=>t.scrollLeft)).toBeGreaterThan(0);
 await page.setViewportSize({width:1440,height:1000});
 for(let i=1;i<=15;i++)expect(await page.locator('#ref-'+i).count()).toBe(1);
 for(const img of await page.locator('.publication-prose img').all()){
  await img.scrollIntoViewIfNeeded();await expect.poll(()=>img.evaluate(i=>i.complete&&i.naturalWidth>0)).toBe(true);
 }
 await page.locator('.publication-rail a').filter({hasText:'Case studies'}).click();
 expect(new URL(page.url()).hash).toContain('case-studies');
 await page.keyboard.press('Tab');expect(await page.evaluate(()=>document.activeElement.tagName)).toBe('A');
 await page.locator('[data-search-open]').click();await page.locator('#atlas-search').fill('listener');
 await expect(page.locator('#search-results')).toContainText('C54');await page.keyboard.press('Escape');
 const claims=await (await page.request.get(base+'claims.json')).json();
 expect(claims.claims.length).toBe(data('claims').claims.length);
 await go('claims/#C62');await expect(page.locator('#C62')).toContainText('Static inspection');
 await page.locator('#C62 summary').click();await expect(page.locator('#C62 details')).toHaveAttribute('open','');
 await go('');await page.locator('[data-hero-go="1"]').click();
 await expect(page.locator('[data-hero-slide].is-active')).toContainText('3.1.3');
 await page.locator('[data-hero-go="2"]').click();await expect(page.locator('[data-hero-slide].is-active')).toContainText('1600');
 await page.locator('[data-hero-go="3"]').click();await expect(page.locator('[data-hero-slide].is-active')).toContainText('cold power-on');
 await go('paper/');await page.emulateMedia({media:'print'});
 expect(await page.locator('.publication-rail').isVisible()).toBe(false);await page.emulateMedia({media:'screen'});
 const noJS=await browser.newContext({javaScriptEnabled:false,viewport:{width:320,height:844}});
 const staticPage=await noJS.newPage();await staticPage.goto(base+'paper/');await expect(staticPage.locator('.publication-prose')).toContainText('threats to validity');
 // The paper remains readable and its table containers scroll without scripting.
 expect(await staticPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await noJS.close();
 console.log('Paper structure, numbered citations, figures, search, claim disclosure, hero, print and no-JS checks passed.');
}finally{
 writeFileSync(out+'/results.json',JSON.stringify({layouts,audits,errors},null,2));
 await context.close();await browser.close();
}
if(errors.length||audits.some(a=>a.violations.length))process.exitCode=1;
