import {chromium,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
if(!process.env.ATLAS_CDP)throw Error('Set ATLAS_CDP to a dedicated QA browser endpoint.');
const base=process.env.ATLAS_URL||'http://127.0.0.1:4321/ios/';
const out=process.env.ATLAS_QA_DIR||'test-results/reading-paths';mkdirSync(out,{recursive:true});
const browser=await chromium.connectOverCDP(process.env.ATLAS_CDP);
const context=await browser.newContext({viewport:{width:1440,height:1080},reducedMotion:'reduce'});
const page=await context.newPage();const errors=[],audits=[],layouts=[];
page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.url().startsWith(base)&&r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
const paths=()=>page.locator('[data-reading-path]');
async function ready(){await page.bringToFront();await page.evaluate(()=>document.fonts.ready);await page.locator('#reading-paths').scrollIntoViewIfNeeded();await expect.poll(()=>page.locator('.reading-art img').evaluateAll(imgs=>imgs.length===3&&imgs.every(img=>img.complete&&img.naturalWidth>0))).toBe(true);}
async function go(){if(page.url()===base+'#reading-paths')await page.reload({waitUntil:'domcontentloaded'});else await page.goto(base+'#reading-paths',{waitUntil:'domcontentloaded'});await ready();}
async function audit(name){const r=await new AxeBuilder({page}).include('#reading-paths').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();audits.push({name,violations:r.violations});console.log(`Accessibility: ${name}, ${r.violations.length} violations`);}
try{
  await go();await expect(paths()).toHaveCount(3);await expect(page.locator('#reading-paths button')).toHaveCount(0);await expect(page.locator('#reading-paths a')).toHaveCount(6);
  expect(await page.locator('.reading-path-index').allTextContents()).toEqual(['PATH 0112 stops','PATH 0212 stops','PATH 036 stops']);
  await page.locator('select[data-appearance]').selectOption('light');await audit('desktop-light');await page.locator('#reading-paths').screenshot({path:out+'/desktop.png'});
  await page.locator('select[data-appearance]').selectOption('dark');await audit('desktop-dark');await page.locator('#reading-paths').screenshot({path:out+'/dark.png'});
  await page.locator('select[data-appearance]').selectOption('light');
  for(const width of [320,390,768,900,1024,1440]){
    await page.setViewportSize({width,height:1080});await go();
    const geometry=await page.locator('#reading-paths').evaluate(section=>({width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,paths:[...section.querySelectorAll('.reading-path')].map(path=>{const art=path.querySelector('.reading-art').getBoundingClientRect(),title=path.querySelector('h3').getBoundingClientRect(),caption=path.querySelector('p').getBoundingClientRect(),cta=path.querySelector('.reading-path-follow').getBoundingClientRect();return{art:{left:art.left,right:art.right,width:art.width,height:art.height,bottom:art.bottom},titleTop:title.top,captionTop:caption.top,titleBottom:title.bottom,cta:{top:cta.top,left:cta.left,width:cta.width,height:cta.height},overflowY:getComputedStyle(path).overflowY};})}));
    layouts.push(geometry);expect(geometry.overflow).toBeLessThanOrEqual(0);geometry.paths.forEach(p=>{expect(p.art.left).toBeGreaterThanOrEqual(0);expect(p.art.right).toBeLessThanOrEqual(width);expect(p.art.height).toBeGreaterThanOrEqual(170);expect(p.titleTop).toBeGreaterThan(p.art.bottom);expect(p.captionTop).toBeGreaterThan(p.titleBottom);expect(p.overflowY).toBe('visible');});
    geometry.paths.forEach(p=>{expect(p.cta.height).toBe(48);expect(Math.abs(p.cta.left-p.art.left)).toBeLessThan(.02);expect(Math.abs(p.cta.width-p.art.width)).toBeLessThan(.02);});
    if(width>760){for(const field of ['top','height','width'])expect(Math.max(...geometry.paths.map(p=>p.cta[field]))-Math.min(...geometry.paths.map(p=>p.cta[field]))).toBeLessThan(.02);}
    if(width===320||width===900)await audit('layout-'+width);
    if(width===390){await page.evaluate(()=>scrollTo({top:document.querySelector('#reading-paths').getBoundingClientRect().top+scrollY-95,behavior:'instant'}));await page.screenshot({path:out+'/mobile.png'});}
    console.log(`Layout ${width}: 3 illustrations, no overflow or text overlap.`);
  }
  for(const id of ['boot','pixels','method']){
    for(const selector of ['.reading-art','.reading-path-follow']){const link=page.locator(`[data-reading-path="${id}"] ${selector}`);await expect(link).toHaveAttribute('href',`/ios/tours/${id}/`);await link.focus();await page.keyboard.press('Enter');await expect(page).toHaveURL(new RegExp(`/ios/tours/${id}/$`));await expect(page.locator('.tour-stops>li')).toHaveCount(id==='method'?6:12);await page.goBack({waitUntil:'commit'});await ready();}
  }
  await page.emulateMedia({reducedMotion:'no-preference'});await go();
  const motion=page.locator('[data-reading-path="boot"] .reading-art-motion');await expect.poll(()=>motion.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  const samples=await motion.evaluate(async el=>{const a=getComputedStyle(el).transform;await new Promise(r=>setTimeout(r,800));return[a,getComputedStyle(el).transform];});expect(samples[0]).not.toBe(samples[1]);
  await page.mouse.move(0,0);const hover=page.locator('[data-reading-path="boot"] .reading-hover');await expect.poll(()=>hover.evaluate(el=>getComputedStyle(el).transform)).toBe('none');await page.locator('[data-reading-path="boot"] .reading-art').hover();await expect.poll(()=>hover.evaluate(el=>getComputedStyle(el).transform)).not.toBe('none');
  await page.locator('[data-hero-motion]').click();await page.locator('#reading-paths').scrollIntoViewIfNeeded();await expect.poll(()=>motion.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.locator('[data-hero-motion]').click();await page.locator('#reading-paths').scrollIntoViewIfNeeded();await expect.poll(()=>motion.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('running');
  await page.emulateMedia({reducedMotion:'reduce'});expect(await motion.evaluate(el=>el.getAnimations().length)).toBe(0);await audit('live-reduced-motion');
  await page.emulateMedia({reducedMotion:'no-preference'});await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await expect.poll(()=>motion.evaluate(el=>getComputedStyle(el).animationPlayState)).toBe('paused');
  await page.emulateMedia({media:'print'});await expect(page.locator('.reading-art img:visible')).toHaveCount(3);await expect(page.locator('.reading-path-follow:visible')).toHaveCount(3);expect(await motion.evaluate(el=>el.getAnimations().length)).toBe(0);await page.emulateMedia({media:'screen'});
  const fallback=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:1080}});const plain=await fallback.newPage();await plain.goto(base+'#reading-paths');await expect(plain.locator('.reading-art img:visible')).toHaveCount(3);await expect(plain.locator('.reading-path-follow:visible')).toHaveCount(3);expect(await plain.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(0);await fallback.close();
  expect(errors).toEqual([]);expect(audits.flatMap(a=>a.violations)).toEqual([]);writeFileSync(out+'/results.json',JSON.stringify({result:'pass',layouts,audits,errors,motionSamples:samples},null,2));console.log('PASS: automatic artwork, shared pause, offscreen pause, motion preferences, keyboard links, print and no-JavaScript.');
}finally{await context.close();await browser.close();}
