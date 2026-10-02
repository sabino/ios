type Chapter = {slug:string;title:string;section:string;href:string};
type Milestone = {date:string;title:string;evidence:string;chapter:string;description:string;href:string};
type RecordData = {id:string;title:string;label:string;domain:string;environment:string;observation:string;limits:string;reviewedOn:string;sourceRevision:string;href:string;search:string;related:{id:string;via:string[]}[];chapters:Chapter[];milestones:Milestone[]};
type State = {focus:string;domain:string;env:string;review:string;q:string;view:'atlas'|'ledger'};
const root = document.querySelector<HTMLElement>('[data-evidence-atlas]')!;
const records:RecordData[] = JSON.parse(document.querySelector('#evidence-atlas-data')!.textContent!);
const byId = new Map(records.map(r=>[r.id,r]));
const tiles = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-ea-tile]'));
const rows = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-ea-row]'));
const tileById = new Map(tiles.map(t=>[t.dataset.eaTile!,t]));
const chart = root.querySelector<HTMLElement>('[data-ea-chart]')!;
const ledger = root.querySelector<HTMLElement>('[data-ea-ledger]')!;
const detail = root.querySelector<HTMLElement>('[data-ea-detail]')!;
const body = root.querySelector<HTMLElement>('[data-ea-detail-body]')!;
const idLabel = root.querySelector<HTMLElement>('[data-ea-detail-id]')!;
const count = root.querySelector<HTMLElement>('[data-ea-count]')!;
const search = root.querySelector<HTMLInputElement>('[data-ea-search]')!;
const env = root.querySelector<HTMLSelectElement>('[data-ea-env]')!;
const review = root.querySelector<HTMLSelectElement>('[data-ea-review]')!;
const routes = root.querySelector<SVGSVGElement>('[data-ea-routes]')!;
const mobile = root.querySelector<HTMLAnchorElement>('[data-ea-mobile]')!;
const media = matchMedia('(prefers-reduced-motion: reduce)');
const domains = new Set(records.map(r=>r.domain));
const dayDomains = new Map(Array.from(root.querySelectorAll<HTMLElement>('[data-ea-day]')).map(link=>[link.dataset.eaDay!,link.dataset.domain!]));
let state:State, shown:RecordData[] = [], preview = '', frame = 0, detailVisible = false;
const dateLabel = (date:string) => new Intl.DateTimeFormat('en-GB',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(date+'T00:00:00Z'));
function node<K extends keyof HTMLElementTagNameMap>(tag:K,cls='',text=''){
  const el=document.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;
}
function readState():State {
  const params=new URL(location.href).searchParams;
  const chosen=params.get('focus')?.toUpperCase() || 'E35';
  const category=params.get('domain') || '';
  const substrate=params.get('env') || '';
  const snapshot=params.get('review') || '';
  return {focus:byId.has(chosen)?chosen:'E35',domain:domains.has(category)?category:'',env:records.some(r=>r.environment===substrate)?substrate:'',review:Array.from(review.options).some(o=>o.value===snapshot)?snapshot:'',q:params.get('q') || '',view:params.get('view')==='ledger'?'ledger':'atlas'};
}
function writeState(push=false) {
  const target=new URL(location.href);target.hash='';
  for(const key of ['focus','domain','env','review','q','view'] as const){
    if(state[key] && !(key==='view'&&state.view==='atlas'))target.searchParams.set(key,state[key]);
    else target.searchParams.delete(key);
  }
  if(target.href!==location.href)history[push?'pushState':'replaceState'](null,'',target);
  const link=root.querySelector<HTMLAnchorElement>('[data-ea-permalink]');
  if(link){link.href=target.pathname+target.search;link.setAttribute('aria-label','Link to '+state.focus+' in the atlas');}
}
function matches(record:RecordData) {
  const words=state.q.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return (!state.domain||record.domain===state.domain) && (!state.env||record.environment===state.env) && (!state.review||record.reviewedOn+'/'+record.sourceRevision===state.review) && words.every(word=>record.search.includes(word));
}
function renderDetail() {
  const record=byId.get(state.focus);
  detail.hidden=!record || !shown.length;
  if(!record || !shown.length){
    root.querySelector<HTMLElement>('[data-ea-history-context]')!.hidden=true;
    root.querySelectorAll('[data-ea-day]').forEach(link=>link.removeAttribute('aria-current'));
    return;
  }
  root.querySelector<HTMLElement>('[data-ea-history-context]')!.hidden=false;
  const keepLimits=!!body.querySelector<HTMLDetailsElement>('.ea-detail-limits')?.open;
  const keepChapters=!!body.querySelector<HTMLDetailsElement>('.ea-detail-chapters')?.open;
  const keepMilestone=!!body.querySelector<HTMLDetailsElement>('.ea-detail-milestone')?.open;
  detail.dataset.domain=record.domain;
  idLabel.textContent=record.id+' / '+record.domain;
  root.querySelector<HTMLElement>('[data-ea-announcement]')!.textContent='Selected '+record.id+': '+record.label+'. '+record.environment+'.';
  const heading=node('h2','',record.label);heading.id='ea-detail-title';
  const environment=node('p','ea-detail-environment');environment.dataset.env=record.environment.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const glyph=tileById.get(record.id)!.querySelector('svg')!.cloneNode(true);
  environment.append(glyph,node('span','',record.environment));
  const observation=node('section','ea-detail-observation');observation.append(node('h3','','Observation'),node('p','',record.observation));
  const limits=node('details','ea-detail-limits');limits.open=keepLimits;limits.append(node('summary','','Scope and limits'),node('p','',record.limits));
  const facts=node('dl');facts.append(node('dt','','Review'),node('dd','',dateLabel(record.reviewedOn)),node('dt','','Source snapshot'));
  const revision=node('dd');revision.append(node('code','',record.sourceRevision.slice(0,7)));facts.append(revision);limits.append(facts);
  const related=node('section','ea-detail-related');related.append(node('h3','','Cited alongside'));
  const nearest=record.related.slice(0,6);
  related.append(node('p','',record.related.length+' records share a chapter. Showing the '+nearest.length+' most frequent connections.'));
  const links=node('div');
  for(const connection of nearest){
    const other=byId.get(connection.id)!;
    const link=node('a');link.href=other.href;link.dataset.eaRelated=other.id;link.dataset.domain=other.domain;
    link.title=connection.via.length+' shared chapter'+(connection.via.length===1?'':'s');
    link.append(node('span','mono',other.id),node('span','',other.label));links.append(link);
  }
  related.append(links);
  const chapters=node('details','ea-detail-chapters');chapters.open=keepChapters;chapters.append(node('summary','','Used in '+record.chapters.length+' chapters'));
  const list=node('ul');for(const chapter of record.chapters){
    const item=node('li'),link=node('a');link.href=chapter.href;link.dataset.domain=chapter.section;
    const dot=node('i','domain-dot');dot.setAttribute('aria-hidden','true');link.append(dot,document.createTextNode(chapter.title));item.append(link);list.append(item);
  }chapters.append(list);
  const actions=node('div','ea-detail-actions'),inspect=node('a','button primary','Inspect '+record.id+' ↗');
  inspect.href=record.href;inspect.dataset.eaOpen='';
  const permalink=node('a','ea-permalink','#');permalink.href='/ios/evidence/?focus='+record.id;permalink.dataset.eaPermalink='';permalink.setAttribute('aria-label','Link to '+record.id+' in the atlas');
  const milestones=record.milestones.map(event=>{
    const section=node('details','ea-detail-milestone');section.open=keepMilestone;
    section.append(node('summary','','Dated report · '+dateLabel(event.date)),node('p','',event.description));
    const link=node('a','','Read this milestone ↗');link.href=event.href;section.append(link);return section;
  });
  actions.append(inspect,permalink);body.replaceChildren(heading,environment,...milestones,observation,limits,related,chapters,actions);
  renderHistory(record);
  const position=shown.findIndex(r=>r.id===record.id);
  root.querySelectorAll<HTMLButtonElement>('[data-ea-step]').forEach(button=>button.disabled=position<0||(button.dataset.eaStep==='-1'?position===0:position===shown.length-1));
  mobile.replaceChildren(node('span','mono',record.id),node('span','',record.label),node('strong','','Details ↓'));mobile.dataset.domain=record.domain;
}
function renderHistory(record:RecordData){
  const day=record.milestones[0]?.date||'';
  root.querySelectorAll<HTMLAnchorElement>('[data-ea-day]').forEach(link=>{
    link.dataset.domain=link.dataset.eaDay===day?record.domain:dayDomains.get(link.dataset.eaDay!);
    if(link.dataset.eaDay===day)link.setAttribute('aria-current','true');else link.removeAttribute('aria-current');
  });
  const context=root.querySelector<HTMLElement>('[data-ea-history-context]')!;
  const dated=records.flatMap(r=>r.milestones).filter(event=>event.date===day).sort((a,b)=>a.evidence.localeCompare(b.evidence));
  const label=node('span','mono',day?dateLabel(day):'No separate dated milestone listed for '+record.id);
  const list=node('div');
  for(const event of dated){
    const other=byId.get(event.evidence)!,link=node('a');
    link.href=other.href;link.dataset.eaHistoryRecord=other.id;link.dataset.domain=other.domain;
    if(other.id===record.id)link.setAttribute('aria-current','true');
    link.append(node('span','mono',other.id),document.createTextNode(other.label));list.append(link);
  }context.replaceChildren(label,list);
}
function scheduleRoutes(){cancelAnimationFrame(frame);frame=requestAnimationFrame(drawRoutes);}
function emphasize(id:string) {
  preview=id;
  const related=new Set(byId.get(id)?.related.slice(0,6).map(r=>r.id)||[]);
  for(const tile of tiles){
    const key=tile.dataset.eaTile!;
    tile.classList.toggle('is-connected',related.has(key));
    tile.classList.toggle('is-dim',!!id&&key!==id&&!related.has(key));
  }scheduleRoutes();
}
function drawRoutes() {
  if(chart.hidden)return;
  const bounds=chart.getBoundingClientRect();if(!bounds.width)return;
  routes.setAttribute('viewBox','0 0 '+bounds.width+' '+bounds.height);
  const fragment=document.createDocumentFragment();
  function path(d:string,domain:string,connection=false,to=''){
    const el=document.createElementNS('http://www.w3.org/2000/svg','path');
    el.setAttribute('d',d);el.setAttribute('class','ea-route'+(connection?' is-connection':''));el.dataset.domain=domain;
    if(connection){el.dataset.edgeFrom=preview||state.focus;el.dataset.edgeTo=to;}fragment.append(el);
  }
  for(const edition of root.querySelectorAll<HTMLElement>('[data-ea-edition]')){
    if(edition.hidden)continue;
    const dot=edition.querySelector('.ea-milestone')!.getBoundingClientRect();
    const x=dot.left-bounds.left+dot.width/2,y=dot.top-bounds.top+dot.height/2;
    for(const lane of edition.querySelectorAll<HTMLElement>('.ea-lane')){
      if(lane.hidden)continue;
      const marker=lane.querySelector('h3 i')!.getBoundingClientRect();
      const hx=marker.left-bounds.left+marker.width/2,hy=marker.top-bounds.top+marker.height/2;
      const branch=innerWidth<=760?'M'+x+' '+y+' L'+x+' '+(hy-12)+' Q'+x+' '+hy+' '+(x+12)+' '+hy+' L'+hx+' '+hy:'M'+x+' '+y+' C'+(x+18)+' '+y+' '+(hx-24)+' '+hy+' '+hx+' '+hy;
      path(branch,lane.dataset.domain!);
      const last=Array.from(lane.querySelectorAll<HTMLElement>('[data-ea-tile]')).filter(t=>!t.hidden).at(-1);
      if(last){const r=last.getBoundingClientRect(),rail=r.left-bounds.left-4,end=r.bottom-bounds.top-7;path('M'+hx+' '+hy+' Q'+rail+' '+hy+' '+rail+' '+(hy+14)+' L'+rail+' '+end,lane.dataset.domain!);}
    }
  }
  const selected=byId.get(preview||state.focus),from=selected&&tileById.get(selected.id);
  if(selected&&from&&!from.hidden){
    const a=from.getBoundingClientRect();
    for(const connection of selected.related.slice(0,6)){
      const tile=tileById.get(connection.id)!;if(tile.hidden)continue;
      const b=tile.getBoundingClientRect();
      const right=b.left>=a.right;
      const sameColumn=Math.abs(a.left-b.left)<3;
      const x1=(right||sameColumn?a.right:a.left)-bounds.left;
      const x2=(right?b.left:b.right)-bounds.left;
      const y1=a.top-bounds.top+a.height/2,y2=b.top-bounds.top+b.height/2;
      const bend=sameColumn?Math.max(x1,x2)+15:(x1+x2)/2;
      path('M'+x1+' '+y1+' C'+bend+' '+y1+' '+bend+' '+y2+' '+x2+' '+y2,selected.domain,true,connection.id);
    }
  }
  routes.replaceChildren(fragment);
}
function render(animate=false) {
  const before=new Map(tiles.filter(t=>!t.hidden).map(t=>[t,t.getBoundingClientRect()]));
  shown=records.filter(matches);
  const ids=new Set(shown.map(r=>r.id));
  if(!ids.has(state.focus))state.focus=shown[0]?.id||'';
  for(const tile of tiles){
    const id=tile.dataset.eaTile!;tile.hidden=!ids.has(id);
    tile.classList.toggle('is-selected',id===state.focus);
    tile.tabIndex=id===state.focus?0:-1;
    if(id===state.focus)tile.setAttribute('aria-current','true');else tile.removeAttribute('aria-current');
  }
  for(const row of rows)row.hidden=!ids.has(row.dataset.eaRow!);
  for(const edition of root.querySelectorAll<HTMLElement>('[data-ea-edition]')){
    let lanes=0,total=0;
    for(const lane of edition.querySelectorAll<HTMLElement>('.ea-lane')){
      const n=Array.from(lane.querySelectorAll<HTMLElement>('[data-ea-tile]')).filter(t=>!t.hidden).length;
      lane.hidden=!n;lane.querySelector('[data-ea-lane-count]')!.textContent=String(n);
      if(n){lanes++;total+=n;}
    }
    edition.hidden=!total;
    const grid=edition.querySelector<HTMLElement>('.ea-lanes')!;
    grid.style.setProperty('--columns',String(Math.min(6,lanes)||1));grid.style.setProperty('--tablet-columns',String(Math.min(3,lanes)||1));grid.style.setProperty('--phone-columns',String(Math.min(2,lanes)||1));
    edition.querySelector('header p')!.firstChild!.textContent=total+' record'+(total===1?'':'s')+' ';
  }
  chart.hidden=state.view!=='atlas'||!shown.length;ledger.hidden=state.view!=='ledger'||!shown.length;
  root.querySelector<HTMLElement>('[data-ea-empty]')!.hidden=!!shown.length;
  root.querySelectorAll<HTMLButtonElement>('[data-ea-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.eaView===state.view)));
  root.querySelectorAll<HTMLButtonElement>('[data-ea-domain]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.eaDomain===state.domain)));
  search.value=state.q;env.value=state.env;review.value=state.review;
  const snapshots=new Set(shown.map(r=>r.sourceRevision)).size;
  count.textContent=shown.length+' of '+records.length+' records · '+snapshots+' reviewed snapshot'+(snapshots===1?'':'s');
  root.querySelector<HTMLElement>('[data-ea-reset]')!.hidden=!(state.domain||state.env||state.review||state.q);
  mobile.hidden=state.view!=='atlas'||!shown.length||detailVisible;
  renderDetail();emphasize(state.focus);
  if(animate&&!media.matches&&state.view==='atlas'){
    for(const tile of tiles.filter(t=>!t.hidden)){
      tile.getAnimations().forEach(a=>a.cancel());
      const previous=before.get(tile),now=tile.getBoundingClientRect();
      const dx=previous?previous.left-now.left:0,dy=previous?previous.top-now.top:6;
      if(dx||dy)tile.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'translate(0,0)'}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'}).finished.then(scheduleRoutes).catch(()=>{});
    }
  }
}
function choose(id:string,push=true) {
  if(!byId.has(id))return;
  if(!shown.some(r=>r.id===id)){state.domain='';state.env='';state.review='';state.q='';}
  state.focus=id;render();writeState(push);
}
function clear(){state={...state,domain:'',env:'',review:'',q:''};render(true);writeState(true);}
root.querySelectorAll<HTMLElement>('[data-ea-controls]').forEach(el=>el.hidden=false);
root.querySelectorAll<HTMLButtonElement>('[data-ea-domain]').forEach(button=>{button.disabled=false;button.addEventListener('click',()=>{state.domain=state.domain===button.dataset.eaDomain?'':button.dataset.eaDomain!;render(true);writeState(true);});});
root.querySelectorAll<HTMLButtonElement>('[data-ea-view]').forEach(button=>button.addEventListener('click',()=>{state.view=button.dataset.eaView as State['view'];render();writeState(true);}));
root.querySelectorAll<HTMLButtonElement>('[data-ea-step]').forEach(button=>button.addEventListener('click',()=>{const index=shown.findIndex(r=>r.id===state.focus)+Number(button.dataset.eaStep);if(shown[index])choose(shown[index].id);}));
search.addEventListener('input',()=>{state.q=search.value;render(true);writeState();});
env.addEventListener('change',()=>{state.env=env.value;render(true);writeState(true);});
review.addEventListener('change',()=>{state.review=review.value;render(true);writeState(true);});
root.querySelector('[data-ea-reset]')!.addEventListener('click',clear);
root.querySelector('[data-ea-clear]')!.addEventListener('click',()=>{clear();search.focus();});
body.addEventListener('click',event=>{
  const link=(event.target as Element).closest<HTMLAnchorElement>('[data-ea-related]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();choose(link.dataset.eaRelated!);detail.focus({preventScroll:true});
});
root.addEventListener('click',event=>{
  const link=(event.target as Element).closest<HTMLAnchorElement>('[data-ea-day-focus], [data-ea-history-record]');
  if(!link||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();choose(link.dataset.eaDayFocus||link.dataset.eaHistoryRecord!);
});
for(const tile of tiles){
  tile.addEventListener('click',event=>{if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;event.preventDefault();choose(tile.dataset.eaTile!);});
  tile.addEventListener('pointerenter',()=>emphasize(tile.dataset.eaTile!));
  tile.addEventListener('pointerleave',()=>emphasize(state.focus));
  tile.addEventListener('focus',()=>emphasize(tile.dataset.eaTile!));
  tile.addEventListener('blur',()=>emphasize(state.focus));
  tile.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const visible=tiles.filter(t=>!t.hidden);let target:HTMLAnchorElement|undefined;
    if(event.key==='Home')target=visible[0];
    else if(event.key==='End')target=visible.at(-1);
    else {
      const from=tile.getBoundingClientRect(),x=from.left+from.width/2,y=from.top+from.height/2;
      const horizontal=event.key==='ArrowLeft'||event.key==='ArrowRight',sign=event.key==='ArrowLeft'||event.key==='ArrowUp'?-1:1;
      target=visible.filter(t=>t!==tile).map(t=>{const r=t.getBoundingClientRect(),dx=r.left+r.width/2-x,dy=r.top+r.height/2-y;return {tile:t,along:(horizontal?dx:dy)*sign,across:Math.abs(horizontal?dy:dx)};}).filter(p=>p.along>2).sort((a,b)=>(a.along+a.across*3)-(b.along+b.across*3))[0]?.tile;
    }
    if(target){event.preventDefault();choose(target.dataset.eaTile!,false);target.focus();}
  });
}
window.addEventListener('popstate',()=>{state=readState();render();writeState();});
window.addEventListener('resize',scheduleRoutes);
new ResizeObserver(scheduleRoutes).observe(chart);
function fitDetail(){detail.dataset.sticky=String(innerWidth>1100&&detail.offsetHeight<=innerHeight-130);}
new ResizeObserver(fitDetail).observe(detail);window.addEventListener('resize',fitDetail);
new IntersectionObserver(entries=>{
  detailVisible=entries[0].isIntersecting;
  mobile.hidden=state.view!=='atlas'||!shown.length||detailVisible;
},{rootMargin:'-100px 0px 0px',threshold:0}).observe(detail);
media.addEventListener('change',()=>{if(media.matches)for(const tile of tiles)tile.getAnimations().forEach(a=>a.cancel());scheduleRoutes();});
document.fonts.ready.then(scheduleRoutes);
root.dataset.ready='true';state=readState();render();writeState();
