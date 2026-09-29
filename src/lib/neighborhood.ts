// Chapter neighborhood map: linked highlighting, tooltips, scroll sync with the evidence cards,
// reading progress on the journey track, and the small-screen sheet.
const READ_KEY='ios-atlas-read';
function readSet():Set<string>{try{return new Set(JSON.parse(localStorage.getItem(READ_KEY)||'[]'));}catch{return new Set();}}

for(const map of document.querySelectorAll<HTMLElement>('[data-neighborhood]')){
 const svg=map.querySelector('svg')!,tip=map.querySelector<HTMLElement>('.nb-tip')!,focusKey=map.dataset.focus!;
 const nodes=[...map.querySelectorAll<SVGAElement>('.nb-node')],edges=[...map.querySelectorAll<SVGPathElement>('.nb-edge')];
 const byKey=(key:string)=>nodes.filter(n=>n.dataset.key===key);
 function highlight(key:string|null){
  map.classList.toggle('is-tracing',!!key);
  const linked=new Set<string>(key?[key]:[]);
  edges.forEach(e=>{const on=!!key&&(e.dataset.a===key||e.dataset.b===key);e.classList.toggle('is-lit',on);if(on){linked.add(e.dataset.a!);linked.add(e.dataset.b!);}});
  // Hovering a record also lights the chapter it supports through the centre.
  nodes.forEach(n=>n.classList.toggle('is-lit',!!key&&linked.has(n.dataset.key!)));
 }
 function show(node:SVGAElement){
  const box=node.querySelector('.nb-dot,.nb-glyph')!.getBoundingClientRect(),host=map.getBoundingClientRect();
  tip.innerHTML='';const t=document.createElement('strong');t.textContent=node.dataset.title||'';const m=document.createElement('span');m.textContent=node.dataset.meta||'';tip.append(m,t);
  tip.hidden=false;const w=tip.offsetWidth;let x=box.left+box.width/2-host.left-w/2;x=Math.max(0,Math.min(host.width-w,x));
  tip.style.transform=`translate(${Math.round(x)}px,${Math.round(box.top-host.top-tip.offsetHeight-10)}px)`;
 }
 const hide=()=>{tip.hidden=true;};
 for(const node of nodes){
  const on=()=>{highlight(node.dataset.key!);show(node);if(node.classList.contains('is-evidence'))document.dispatchEvent(new CustomEvent('atlas-map-evidence',{detail:{id:node.dataset.key,on:true}}));};
  const off=()=>{highlight(null);hide();if(node.classList.contains('is-evidence'))document.dispatchEvent(new CustomEvent('atlas-map-evidence',{detail:{id:node.dataset.key,on:false}}));};
  node.addEventListener('mouseenter',on);node.addEventListener('mouseleave',off);node.addEventListener('focus',on);node.addEventListener('blur',off);
  // Inside a chapter, a record opens its card in place; the card's own zoom leads to the full record.
  if(node.classList.contains('is-evidence')&&document.querySelector(`.article-prose .evidence-peek[data-evidence="${node.dataset.key}"]`))
   node.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;e.preventDefault();closeSheet(false);document.dispatchEvent(new CustomEvent('atlas-evidence-reveal',{detail:{id:node.dataset.key}}));});
  if(node.dataset.key===focusKey)node.addEventListener('click',e=>{e.preventDefault();scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 }
 document.addEventListener('atlas-evidence-hover',((e:CustomEvent)=>{byKey(e.detail.id).forEach(n=>n.classList.toggle('is-linked',e.detail.on));edges.forEach(x=>x.classList.toggle('is-linked',e.detail.on&&x.dataset.a===e.detail.id));}) as EventListener);
 document.addEventListener('atlas-evidence-inview',((e:CustomEvent)=>{nodes.forEach(n=>n.classList.toggle('is-reading',n.dataset.key===e.detail.id));edges.forEach(x=>x.classList.toggle('is-reading',!!e.detail.id&&x.dataset.a===e.detail.id&&x.dataset.b===focusKey));}) as EventListener);
 svg.addEventListener('mouseleave',()=>{highlight(null);hide();});
}
// Cards glow while their record is traced on the map.
document.addEventListener('atlas-map-evidence',((e:CustomEvent)=>document.querySelectorAll<HTMLElement>(`.evidence-peek[data-evidence="${e.detail.id}"]`).forEach(c=>c.classList.toggle('is-linked',e.detail.on))) as EventListener);

// Journey: remember opened chapters in this browser only.
const current=document.querySelector<HTMLElement>('[data-journey]')?.dataset.current;
const read=readSet();if(current){read.add(current);try{localStorage.setItem(READ_KEY,JSON.stringify([...read]));}catch{}}
document.querySelectorAll<HTMLElement>('[data-journey]').forEach(j=>{
 j.querySelectorAll<HTMLAnchorElement>('a[data-slug]').forEach(a=>a.parentElement!.classList.toggle('is-read',read.has(a.dataset.slug!)));
 const label=j.querySelector('[data-journey-read]');if(label)label.textContent=`${read.size} READ HERE`;
});

// Small screens: the rail becomes a sheet opened from a floating button.
const rail=document.querySelector<HTMLElement>('[data-context-rail]'),fab=document.querySelector<HTMLButtonElement>('[data-context-open]');
function closeSheet(restore=true){if(!rail?.classList.contains('is-open'))return;rail.classList.remove('is-open');document.documentElement.classList.remove('sheet-open');fab?.setAttribute('aria-expanded','false');if(restore)fab?.focus();}
if(rail&&fab){
 const sheet=matchMedia('(max-width:1279px)');
 const sync=()=>{if(sheet.matches){rail.setAttribute('role','dialog');rail.setAttribute('aria-modal','true');}else{rail.removeAttribute('role');rail.removeAttribute('aria-modal');closeSheet(false);}};
 sheet.addEventListener('change',sync);sync();
 fab.addEventListener('click',()=>{rail.classList.add('is-open');document.documentElement.classList.add('sheet-open');fab.setAttribute('aria-expanded','true');rail.querySelector<HTMLElement>('[data-context-close]')?.focus();});
 rail.querySelector('[data-context-close]')?.addEventListener('click',()=>closeSheet());
 rail.addEventListener('click',e=>{if(e.target===rail)closeSheet();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&rail.classList.contains('is-open')){e.preventDefault();closeSheet();}
  // Keep keyboard focus inside the open sheet.
  if(e.key==='Tab'&&rail.classList.contains('is-open')){const f=[...rail.querySelectorAll<HTMLElement>('a[href],button:not([hidden])')].filter(el=>el.offsetParent!==null||el instanceof SVGElement);if(!f.length)return;const first=f[0],last=f[f.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 // Reveal the button once the reader is into the chapter, not over the title.
 const heading=document.querySelector('.article-heading');if(heading&&'IntersectionObserver' in window)new IntersectionObserver(([en])=>fab.classList.toggle('is-visible',!en.isIntersecting)).observe(heading);else fab.classList.add('is-visible');
}
