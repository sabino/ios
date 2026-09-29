const data=JSON.parse(document.querySelector('#map-data')?.textContent||'[]');
const detail=document.querySelector<HTMLElement>('#map-detail')!;
const original=detail.innerHTML;
const select=document.querySelector<HTMLSelectElement>('#concept-select')!;
const nodeLinks=Array.from(document.querySelectorAll<SVGAElement>('[data-node]'));
const canvas=document.querySelector<HTMLElement>('#map-canvas')!,list=document.querySelector<HTMLElement>('#map-list')!;
const mapButton=document.querySelector('#map-view')!,listButton=document.querySelector('#list-view')!;
const graph=document.querySelector<HTMLElement>('#floating-graph')!,graphButton=document.querySelector('#graph-view')!;
function mode(view:'graph'|'structured'|'list'){
 canvas.hidden=view!=='structured';list.hidden=view!=='list';graph.hidden=view!=='graph';
 mapButton.setAttribute('aria-pressed',String(view==='structured'));listButton.setAttribute('aria-pressed',String(view==='list'));graphButton.setAttribute('aria-pressed',String(view==='graph'));
 document.dispatchEvent(new CustomEvent('atlas-graph-view',{detail:view}));
}
mapButton.addEventListener('click',()=>mode('structured'));listButton.addEventListener('click',()=>mode('list'));graphButton.addEventListener('click',()=>mode('graph'));if(matchMedia('(max-width:760px)').matches)mode('list');
function choose(slug:string){
 const a=data.find((a:any)=>a.slug===slug);select.value=a?slug:'';
 const related=new Set(a?[a.slug,...a.related,...data.filter((b:any)=>b.related.includes(slug)).map((b:any)=>b.slug)]:[]);
 nodeLinks.forEach(el=>{const key=el.dataset.node;el.classList.toggle('selected',key===slug);el.classList.toggle('connected',related.has(key)&&key!==slug);el.classList.toggle('dimmed',!!a&&!related.has(key));if(key===slug)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current');});
 document.querySelectorAll<SVGPathElement>('[data-edge-from]').forEach(el=>el.classList.toggle('highlighted',!!a&&(el.dataset.edgeFrom===slug||el.dataset.edgeTo===slug)));
 if(!a){detail.innerHTML=original;}else{
  detail.replaceChildren();
  const label=document.createElement('span');label.className='section-number';label.textContent=a.section+' / '+String(a.order).padStart(2,'0');
  const heading=document.createElement('h2');heading.textContent=a.title;const p=document.createElement('p');p.textContent=a.description;
  const read=document.createElement('a');read.className='button primary';read.href='/ios/articles/'+a.slug+'/';read.textContent='Read chapter ↗';
  const sub=document.createElement('h3');sub.textContent='Connected concepts';const ul=document.createElement('ul');
  [...related].filter(s=>s!==slug).forEach(s=>{const b=data.find((b:any)=>b.slug===s);if(!b)return;const li=document.createElement('li'),button=document.createElement('button');button.textContent=b.title;button.addEventListener('click',()=>choose(s as string));li.append(button);ul.append(li);});
  const count=document.createElement('p');count.className='mono';count.textContent=a.evidence.length+' supporting evidence records';detail.append(label,heading,p,read,sub,ul,count);
 }
 const u=new URL(location.href);if(a)u.searchParams.set('focus',slug);else u.searchParams.delete('focus');history.replaceState(null,'',u);
}
nodeLinks.forEach(el=>el.addEventListener('click',e=>{if((e as MouseEvent).ctrlKey||(e as MouseEvent).metaKey||(e as MouseEvent).shiftKey||(e as MouseEvent).altKey)return;e.preventDefault();if(el.dataset.dragged==='true'){delete el.dataset.dragged;return;}choose(el.dataset.node!)}));
select.addEventListener('change',()=>choose(select.value));document.querySelector('#map-reset')?.addEventListener('click',()=>{choose('');document.dispatchEvent(new Event('atlas-graph-reset'));});
const initial=new URL(location.href).searchParams.get('focus');if(initial)choose(initial);

for(const node of nodeLinks){const preview=(on:boolean)=>document.querySelectorAll<SVGPathElement>('[data-edge-from]').forEach(edge=>edge.classList.toggle('preview',on&&(edge.dataset.edgeFrom===node.dataset.node||edge.dataset.edgeTo===node.dataset.node)));node.addEventListener('mouseenter',()=>preview(true));node.addEventListener('mouseleave',()=>preview(false));node.addEventListener('focus',()=>preview(true));node.addEventListener('blur',()=>preview(false));}
