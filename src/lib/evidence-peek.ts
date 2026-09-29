// Evidence cards in a chapter: expand in place (loading the published record JSON once), switch between
// exhibits, and "zoom" into the full record page with a shared-element view transition.
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const cache=new Map<string,Promise<any>>();
const esc=(s:unknown)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function load(id:string){let p=cache.get(id);if(!p){p=fetch(`/ios/evidence/data/${id}.json`).then(r=>{if(!r.ok)throw Error(String(r.status));return r.json();}).then(d=>d.record);p.catch(()=>cache.delete(id));cache.set(id,p);}return p;}
const technical=/^0x[0-9a-f]+$|^[0-9a-f]{64}$/i;
function exhibitHtml(x:any,record:any){
 if(x.kind==='table')return `<div class="exhibit-table-wrap" tabindex="0" role="region" aria-label="${esc(x.title)}, scroll table if needed"><table class="exhibit-table"><thead><tr>${x.columns.map((c:string)=>`<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${x.rows.map((row:string[])=>`<tr>${row.map((c,i)=>i===0?`<th scope="row">${esc(c)}</th>`:`<td${technical.test(c)?' class="technical-value"':''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
 if(x.kind==='trace'){const s=record.excerpts.find((e:any)=>e.id===x.sourceIds[0]);return `<div class="trace-panel"><div class="trace-toolbar"><span><strong>${esc(s?.document)}</strong><small>${esc(s?.locator)} · SHA-256 ${esc(String(s?.sha256||'').slice(0,12))}…</small></span></div><pre tabindex="0" aria-label="${esc(x.title)}"><code>${esc(x.text)}</code></pre></div>`;}
 if(x.kind==='image')return `<figure class="capture-figure"><div class="capture-image${x.height>x.width?' portrait':''}"><img src="${esc(x.src)}" width="${x.width}" height="${x.height}" alt="${esc(x.alt)}" loading="lazy"/></div><figcaption>${esc(x.caption)}</figcaption></figure>`;
 return '';
}
function render(card:HTMLElement,body:HTMLElement,record:any,active:string){
 const id=body.id,from=new URLSearchParams(new URL(card.querySelector<HTMLAnchorElement>('.peek-zoom')!.href).search).get('from');
 const link=(hash:string)=>`/ios/evidence/${record.id}/${from?`?from=${encodeURIComponent(from)}`:''}#${hash}`;
 const index=Math.max(0,record.exhibits.findIndex((x:any)=>x.id===active));
 const tabs=record.exhibits.length>1?`<div class="peek-tabs" role="tablist" aria-label="Exhibits in ${esc(record.id)}">${record.exhibits.map((x:any,i:number)=>`<button type="button" role="tab" id="${id}-tab-${i}" aria-controls="${id}-panel" aria-selected="${i===index}" tabindex="${i===index?0:-1}" data-index="${i}"><span class="mono">${String(i+1).padStart(2,'0')}</span>${esc(x.title)}</button>`).join('')}</div>`:'';
 const panel=(i:number)=>{const x=record.exhibits[i];return `${exhibitHtml(x,record)}<p class="exhibit-reading"><strong>How to read it.</strong> ${esc(x.interpretation)}</p><a class="peek-exhibit-link" href="${link(x.id)}">Inspect this exhibit with its source excerpt ↗</a>`;};
 body.innerHTML=`<div class="peek-body-inner"><div class="peek-content">${tabs}<div class="peek-panel" id="${id}-panel" role="${tabs?'tabpanel':'region'}" ${tabs?`aria-labelledby="${id}-tab-${index}"`:`aria-label="${esc(record.exhibits[0].title)}"`}>${panel(index)}</div><div class="peek-limit"><span class="mono">BOUNDARY OF THE CLAIM</span><p>${esc(record.limits)}</p></div><p class="peek-method"><span class="mono">METHOD</span> ${esc(record.method)}</p></div></div>`;
 const tablist=body.querySelector<HTMLElement>('[role=tablist]');if(!tablist)return;
 const buttons=[...tablist.querySelectorAll<HTMLButtonElement>('[role=tab]')];
 const select=(i:number,focus=false)=>{buttons.forEach((b,j)=>{b.setAttribute('aria-selected',String(i===j));b.tabIndex=i===j?0:-1;});const p=body.querySelector<HTMLElement>('.peek-panel')!;p.setAttribute('aria-labelledby',buttons[i].id);p.innerHTML=panel(i);if(focus)buttons[i].focus();};
 tablist.addEventListener('click',e=>{const b=(e.target as Element).closest<HTMLButtonElement>('[role=tab]');if(b)select(+b.dataset.index!);});
 tablist.addEventListener('keydown',e=>{const i=buttons.findIndex(b=>b.getAttribute('aria-selected')==='true');const to={ArrowRight:i+1,ArrowLeft:i-1,Home:0,End:buttons.length-1}[e.key];if(to===undefined)return;e.preventDefault();select((to+buttons.length)%buttons.length,true);});
}
function setOpen(card:HTMLElement,open:boolean){
 const button=card.querySelector<HTMLButtonElement>('.peek-expand')!,body=card.querySelector<HTMLElement>('.peek-body')!,label=button.querySelector('.peek-expand-label')!;
 const repeat=card.classList.contains('is-repeat');
 button.setAttribute('aria-expanded',String(open));card.classList.toggle('is-open',open);
 label.textContent=open?(repeat?'Hide':'Hide the captured result'):(repeat?'Show':'Show the captured result');
 if(open){body.hidden=false;if(reduced.matches)body.classList.add('is-open');else requestAnimationFrame(()=>requestAnimationFrame(()=>body.classList.add('is-open')));}
 else{body.classList.remove('is-open');if(reduced.matches)body.hidden=true;else body.addEventListener('transitionend',()=>{if(!card.classList.contains('is-open'))body.hidden=true;},{once:true});}
}
async function expand(card:HTMLElement,exhibit?:string){
 const body=card.querySelector<HTMLElement>('.peek-body')!,id=card.dataset.evidence!;
 const active=exhibit||card.dataset.exhibit||'';
 if(!body.dataset.loaded||exhibit){
  body.innerHTML='<div class="peek-body-inner"><div class="peek-content"><div class="peek-loading" role="status"><span></span><span></span><span></span><em>Loading the captured record…</em></div></div></div>';
  setOpen(card,true);
  try{render(card,body,await load(id),active);body.dataset.loaded='true';}
  catch{body.innerHTML=`<div class="peek-body-inner"><div class="peek-content"><p class="peek-error" role="status">The record could not load here. <a href="${card.querySelector<HTMLAnchorElement>('.peek-zoom')!.href}">Open the full record ↗</a></p></div></div>`;}
  return;
 }
 setOpen(card,true);
}
const cards=[...document.querySelectorAll<HTMLElement>('.evidence-peek')];
for(const card of cards){
 const button=card.querySelector<HTMLButtonElement>('.peek-expand')!;button.hidden=false;
 button.addEventListener('click',()=>button.getAttribute('aria-expanded')==='true'?setOpen(card,false):expand(card));
 // Warm the cache while the pointer travels to the button.
 button.addEventListener('pointerenter',()=>load(card.dataset.evidence!).catch(()=>{}),{once:true});
 card.addEventListener('mouseenter',()=>document.dispatchEvent(new CustomEvent('atlas-evidence-hover',{detail:{id:card.dataset.evidence,on:true}})));
 card.addEventListener('mouseleave',()=>document.dispatchEvent(new CustomEvent('atlas-evidence-hover',{detail:{id:card.dataset.evidence,on:false}})));
 // Zoom: the card becomes the record page's heading during a same-origin view transition.
 card.querySelector<HTMLAnchorElement>('.peek-zoom')!.addEventListener('click',e=>{if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;document.querySelectorAll<HTMLElement>('.evidence-peek').forEach(c=>c.style.viewTransitionName='');card.style.viewTransitionName='evidence-zoom';});
}
// Returning from the record (back/forward cache) must not leave a stale transition name behind.
addEventListener('pageshow',()=>cards.forEach(c=>c.style.viewTransitionName=''));
// An inline reference opens the card that follows its paragraph instead of leaving the chapter.
document.querySelectorAll<HTMLAnchorElement>('.article-prose a.evidence-ref').forEach(link=>link.addEventListener('click',e=>{
 if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey||e.button!==0)return;
 let block:Element|null=link;while(block&&block.parentElement&&!block.parentElement.classList.contains('article-prose'))block=block.parentElement;
 let card=block?.nextElementSibling;while(card&&card.classList.contains('evidence-peek')&&(card as HTMLElement).dataset.evidence!==link.dataset.evidence)card=card.nextElementSibling;
 if(!(card instanceof HTMLElement)||card.dataset.evidence!==link.dataset.evidence)return;
 e.preventDefault();const exhibit=link.hash.slice(1)||undefined;
 expand(card,exhibit);flash(card);
 const r=card.getBoundingClientRect();if(r.top>innerHeight*.7||r.bottom<90)card.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});
 card.querySelector<HTMLElement>('.peek-expand')?.focus({preventScroll:true});
}));
export function flash(card:HTMLElement){card.classList.remove('is-flashing');void card.offsetWidth;card.classList.add('is-flashing');setTimeout(()=>card.classList.remove('is-flashing'),1400);}
// The map asks for a record: open the next card for it below the current reading position.
document.addEventListener('atlas-evidence-reveal',((e:CustomEvent)=>{
 const matches=cards.filter(c=>c.dataset.evidence===e.detail.id&&c.closest('.article-prose'));if(!matches.length)return;
 const card=matches.find(c=>c.getBoundingClientRect().top>120)||matches[0];
 expand(card);
 card.scrollIntoView({block:'center',behavior:reduced.matches?'instant':'smooth'});flash(card);card.querySelector<HTMLElement>('.peek-expand')?.focus({preventScroll:true});
}) as EventListener);
// Tell the map which record the reader is looking at.
const inline=cards.filter(c=>c.closest('.article-prose'));
if(inline.length&&'IntersectionObserver' in window){
 const visible=new Map<Element,number>();
 const io=new IntersectionObserver(entries=>{for(const en of entries)en.isIntersecting?visible.set(en.target,0):visible.delete(en.target);const mid=innerHeight/2,dist=(el:Element)=>{const r=el.getBoundingClientRect();return Math.abs(r.top+r.height/2-mid);};const first=[...visible.keys()].sort((a,b)=>dist(a)-dist(b)).map(el=>[el])[0];document.dispatchEvent(new CustomEvent('atlas-evidence-inview',{detail:{id:first?(first[0] as HTMLElement).dataset.evidence:null}}));},{rootMargin:'-20% 0px -30% 0px'});
 inline.forEach(c=>io.observe(c));
}
